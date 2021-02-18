from attr import attrib, attrs
import logging
import ruamel.yaml
import lxml.etree
from wavinfo import WavInfoReader as wavreader
from ear.core import bs2051
from ear.fileio import openBw64
from ear.fileio.adm.builder import ADMBuilder
from ear.fileio.adm.elements import AudioObject, AudioTrackUID, TypeDefinition
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
    return {"Channels": wavinfo.fmt.channel_count,
            "bext chunk": wavinfo.bext.to_dict()}

def load_adm_yaml_file(filename):
    with open(filename) as f:
        yaml = ruamel.yaml.safe_load(f)
    return yaml

def generate_adm(adm_dict, bitDepth=16, sampleRate=48000):
    builder = ExtendedADMBuilder()
    builder.load_common_definitions()
    for ap_name, conf in adm_dict.items():
        builder.create_programme(audioProgrammeName=ap_name)
        builder.create_content(audioContentName="Content")
        for system, channels in conf.items():
            builder.create_multichannel_item(TypeDefinition.DirectSpeakers,
                                             name=system,
                                             system=system,
                                             bitDepth=bitDepth,
                                             sampleRate=sampleRate,
                                             track_idxs=channels)
    return builder.adm


def generate_bw64_file(in_wav_path, out_bwav_path, adm_dict, screen=None):
    # adm_dict = {'AP1': {'0+5+0': [1, 2, 3, 4, 5, 6], '0+2+0': [7, 8]}, 'AP2': {'0+2+0': [1, 2]}}
    wav_info = get_wav_info(in_wav_path)
    highest_nr = _find_highest_channel_number(adm_dict)
    if wav_info["Channels"] < highest_nr:
        logging.error("ERROR: File has only %s channels but %s are defined in ADM metadata! Aborting." % (wav_info["Channels"], highest_nr))
        return False
    adm = generate_adm(adm_dict)
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


def _find_highest_channel_number(adm_dict):
    max_values = []
    for ap, conf in adm_dict.items():
        for sys, channels in conf.items():
            max_values.append(max(channels))
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
