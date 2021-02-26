

Features for ADM Autoring Web App:

FileIO:
- Upload WAV file
- Upload / Download BW64 file
- Split uploaded WAV files into single tracks using e.g. sox. So the waveform can be rendered with any channel number and a solo function should be more simple to add.
- BEXT Chunk erhalten, bei v2 bext Loudness Metadaten in ADM übernehmen

ADM Authoring:
- Add / Edit interactivity Metadata
- Add / Edit audioProgrammes and assign tracks to DirectSpeakers / Objects types
- Add / Edit Loudness Metadata
- Add Binaural type
- Add BEXT Chunk Parameter into ADM (as per BS.2088 Section 11)

Use Cases:
1) WAV File Upload -> Create audioProgramme(s) -> Create audioObjects(s) and assign WAV tracks to them -> Further metadata for interactivity, loudness and importance can be adjusted in new area
2)

Notes:
Loudness can be assigned to audioProgrammes and audioContents


Example Object Structure:

adm = {
    "AP1": {
        "loudness": -23,
        "items": [
            - "0+2+0": {
                "type": 'DirectSpeakers',
                "routing": [1, 2],
                "interactivity": {
                    "gainInteraction": false,
                    "positionInteraction": [-1, 1],
                    "onOffInteraction": false
                }

            }
            - "Dialog": {
                "type": 'Object',
            }
        ]

    }
}