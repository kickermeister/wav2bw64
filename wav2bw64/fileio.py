from attr import attrib, attrs
import logging
import ruamel.yaml
import lxml.etree
from fractions import Fraction
from wavinfo import WavInfoReader as wavreader
from numpy import power as pow
from ear.core import bs2051
from ear.fileio import openBw64
from ear.fileio.adm.builder import ADMBuilder
from ear.fileio.adm.elements import (AudioObject,
                                     AudioObjectInteraction,
                                     GainInteractionRange,
                                     PositionInteractionRange,
                                     AudioTrackUID,
                                     TypeDefinition,
                                     AudioBlockFormatObjects,
                                     AudioBlockFormatBinaural)
from ear.fileio.adm.chna import populate_chna_chunk
from ear.fileio.adm.generate_ids import generate_ids
from ear.fileio.adm.xml import adm_to_xml
from ear.fileio.bw64.chunks import ChnaChunk, FormatInfoChunk
from .commondefinitions import (audioPackFormatLookupTable,
                               audioStreamFormatLookupTable,
                               audioTrackFormatLookupTable)


DEFAULT = object()


def get_wav_info(path):
    wavinfo = wavreader(path)
    info = {"Channels": wavinfo.fmt.channel_count}
    if wavinfo.bext is not None:
        info["bext chunk"] = wavinfo.bext.to_dict()
    return info


def load_adm_yaml_file(filename):
    with open(filename) as f:
        yaml = ruamel.yaml.safe_load(f)
    return yaml


def load_block_objects(block):
    kwargs = {}
    for attr in ["position", "gain"]:
        if attr in block:
            kwargs[attr] = block[attr]

    return AudioBlockFormatObjects(**kwargs)


def generate_adm(adm_array, bitDepth=16, sampleRate=48000):
    builder = ExtendedADMBuilder()
    builder.load_common_definitions()
    for ap in adm_array:
        builder.create_programme(audioProgrammeName=ap["name"], audioProgrammeLanguage=ap["language"])
        builder.create_content(audioContentName="Content")
        for item in ap["apItems"]:
            if item["type"] in bs2051.layout_names:
                adm_item = builder.create_multichannel_item(TypeDefinition.DirectSpeakers,
                                                name=item["name"],
                                                system=item["type"],
                                                bitDepth=bitDepth,
                                                sampleRate=sampleRate,
                                                track_idxs=item["routing"])
            elif item["type"] == "Object":
                blocks = [load_block_objects(item["object_parameter"])]
                # zero-based index and supporting Mono objects only for now
                adm_item = builder.create_item_objects(name=item["name"],
                                            track_index=item["routing"][0] - 1,
                                            block_formats=blocks)
            elif item["type"] == "Binaural":
                # zero-based index
                for ch in item["routing"]:
                    builder.create_item_mono(TypeDefinition.Binaural,
                                             name=item["name"],
                                             track_index=ch - 1,
                                             block_formats=[AudioBlockFormatBinaural()])
            elif item["type"] == "HOA":
                logging.warning("Type HOA not (yet) supported.")
            else:
                logging.error("No valid type in passed ADM structure found.")
            
            if "importance" in item:
                adm_item.audio_object.importance = item["importance"]
            data = item["interactivity"]
            if data["onOffInteract"] or data["positionInteract"] or data["gainInteract"]:
                adm_item.audio_object.interact = True
                aoi = AudioObjectInteraction(onOffInteract=data["onOffInteract"])
                if data["positionInteract"]:
                    pos_range = PositionInteractionRange(minAzimuth=float(data["azRange"][0]),
                                                         maxAzimuth=float(data["azRange"][1]),
                                                         minElevation=float(data["elRange"][0]),
                                                         maxElevation=float(data["elRange"][1]))
                    aoi.positionInteract = True
                    aoi.positionInteractionRange = pos_range
                if data["gainInteract"]:
                    # convert dB values to linear, since ITU-R BS.2076-1 expects linear values and -2 uses linear as default
                    min_lin = pow(10, data["gainInteractionRange"][0]/ 20)
                    max_lin = pow(10, data["gainInteractionRange"][1]/ 20)
                    gain_range = GainInteractionRange(min=min_lin,
                                                      max=max_lin)
                    aoi.gainInteract = True
                    aoi.gainInteractionRange = gain_range
                adm_item.audio_object.audioObjectInteraction = aoi
    return builder.adm


def generate_bw64_file(in_wav_path, out_bwav_path, adm_array, screen=None):
    # adm_array = {'AP1': {'0+5+0': [1, 2, 3, 4, 5, 6], '0+2+0': [7, 8]}, 'AP2': {'0+2+0': [1, 2]}}
    if in_wav_path == out_bwav_path:
        logging.error("Outfile must be different from infile!")
        return False
    wav_info = get_wav_info(in_wav_path)
    highest_nr = _find_highest_channel_number(adm_array)
    if wav_info["Channels"] < highest_nr:
        logging.error("ERROR: File has only %s channels but %s are defined in ADM metadata! Aborting." % (wav_info["Channels"], highest_nr))
        return False
    adm = generate_adm(adm_array)
    logging.debug("Generated ADM Structure: %s" % adm)
    if screen is not None:
        adm.audioProgrammes[0].referenceScreen = screen

    generate_ids(adm)

    xml = adm_to_xml(adm)
    axml = lxml.etree.tostring(xml, pretty_print=True)

    chna = ChnaChunk()
    populate_chna_chunk(chna, adm)

    with openBw64(in_wav_path) as infile:
        fmtInfo = FormatInfoChunk(formatTag=1,
                                  channelCount=infile.channels,
                                  sampleRate=infile.sampleRate,
                                  bitsPerSample=infile.bitdepth)

        with openBw64(out_bwav_path, 'w', chna=chna, formatInfo=fmtInfo, axml=axml) as outfile:
            while True:
                samples = infile.read(1024)
                if samples.shape[0] == 0:
                    break
                outfile.write(samples)
    return True


def _find_highest_channel_number(adm_array):
    max_values = []
    for ap in adm_array:
        for item in ap["apItems"]:
            max_values.append(max(item["routing"]))
    return max(max_values)


@attrs
class ExtendedADMBuilder(ADMBuilder):
    item_parent = attrib(default=None)

    def create_multichannel_item(self, type, name, system, bitDepth, sampleRate, track_idxs, parent=DEFAULT, block_formats=[]):
        """Create ADM components needed to represent a multichannel-directspeaker-object

        Args:
            type (TypeDefinition): type of channelFormat and packFormat
            track_index (int): zero-based index of the track in the BWF file.
            name (str): name used for all components
            parent (AudioContent or AudioObject): parent of the created audioObject
                defaults to the last content or explicitly created object
            block_formats (list of AudioBlockFormat): block formats to add to
                the channel format

        Returns:
            MonoItem: the created components
        """
        layout = bs2051.get_layout(system)

        '''works for 0+2+0 and 0+5+0, needs a function for matching bs2051 with common definitions'''
        pack_format = [x for x in self.adm._apf if x.id == audioPackFormatLookupTable[system]][0]
        logging.debug("Detected Pack Format: %s", pack_format)

        requiredstreamformats = [audioStreamFormatLookupTable[x] for x in layout.channel_names]
        logging.debug("Required stream formats: %s", requiredstreamformats)
        # stream_format = [x for x in self.adm._asf if x.id in requiredstreamformats]
        stream_format = []
        for id in requiredstreamformats:
            for asf in self.adm._asf:
                if id == asf.id:
                    stream_format.append(asf)
                    # print("Add to stream_format: ", asf.id)
        # print("Detected Stream Format: %s", stream_format, "\n")

        requiredtrackformats = [audioTrackFormatLookupTable[x] for x in layout.channel_names]
        logging.debug("Required track formats: %s", requiredtrackformats)
        # track_format = [x for x in self.adm._atf if x.id in requiredtrackformats]
        track_format = []
        for id in requiredtrackformats:
            for atf in self.adm._atf:
                if id == atf.id:
                    track_format.append(atf)
                    # print("Add to track_format: ", atf.id)
        # for idx, trackformat in enumerate(track_format):
            # print("Detected Track Format: ", trackformat.id)

        channel_format = pack_format.audioChannelFormats[:]

        """create new track UIDs for channel bed, beginning with ATU_00000001"""
        track_uids = []
        for chidx, ch in enumerate(layout.channels):
            track_uid = AudioTrackUID(
                id="ATU_" + f'{chidx+1:08}',
                trackIndex=track_idxs[chidx],
                audioTrackFormat=track_format[chidx],
                audioPackFormat=pack_format,
                bitDepth=bitDepth,
                sampleRate=sampleRate,
            )
            track_uids.append(track_uid)
            self.adm.addAudioTrackUID(track_uid)

        audio_object = AudioObject(
            audioObjectName=name,
            audioPackFormats=[pack_format],
            audioTrackUIDs=track_uids,
        )
        self.adm.addAudioObject(audio_object)

        if parent is DEFAULT:
            parent = self.item_parent
        if parent is not None:
            parent.audioObjects.append(audio_object)

        self.last_object = audio_object
        self.last_pack_format = pack_format
        self.last_stream_format = stream_format

        return self.MonoItem(
            channel_format=channel_format,
            track_format=track_format,
            pack_format=pack_format,
            stream_format=stream_format,
            track_uid=track_uids,
            audio_object=audio_object,
            parent=parent,
        )
