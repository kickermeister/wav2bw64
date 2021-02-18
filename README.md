# wav2bw64

A very simple tool to add basic ADM metadata to a WAV file and export it as BW64 file.

## Installation
```bash
pip install .
```

## Usage
wav2bw64 infile.wav outfilebw64.wav adm.yaml

### ADM config in YAML file
Very basic example structure:

```
"8ch SDI version":
  "0+5+0": [1, 2, 3, 4, 5, 6]
  "0+2+0": [7, 8]
"Stereo":
  "0+2+0": [1, 2]
```

This configures two audioProgrammes, one with the name "8ch SDI version" and one with "Stereo". The first audioProgramme contains two audioObjects, one with a 0+5+0 DirectSpeakers type and one with 0+2+0 DirectSpeakers type. The array defines the track index for the CHNA chunk. It is possible to refer to the same track indices multiple times, as it is done in the example for the 0+2+0 DirectSpeakers type in the "Stereo" programme.
