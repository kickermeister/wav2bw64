# wav2bw64

A very simple tool to add basic ADM metadata to a WAV file and export it as BW64 file.

## Installation
```bash
pip install .
```

## Usage
### Command Line Usage
```bash
wav2bw64 infile.wav outfilebw64.wav adm.yaml
```

### Web GUI Usage
```bash
adm-authoring -h 127.0.0.1 -p 8080 
```

### ADM config in YAML file
Very basic example structure:

```
- name: Audio Programme 1
  apItems:
  - name: My Object 1
    routing: [3]
    type: Object
    object_parameter:
      - position:
        - azimuth: 0
        - elevation: 0
        - distance: 1.0
  - name: Stereo Bed
    routing: [1, 2]
    type: 0+2+0
  language: de
  loudness: -23
- name: Audio Programme 2
  apItems:
  - name: Surround Bed
    routing: [1, 2, 3, 4, 5, 6]
    type: 0+5+0
  - name: Music
    routing: [7, 8]
    type: 0+2+0
  - name: Dialog
    routing: [3]
    type: Object
  language: en
  loudness: -23
```

This configures two audioProgrammes, one with the name "Audio Programme 1" and one with "Audio Programme 2". The first audioProgramme contains two audioObjects, one with an Object type and one with 0+2+0 DirectSpeakers type. The routing array defines the track indices for the CHNA chunk. It is possible to refer to the same track indices multiple times, as it is done in the example.

## Development
