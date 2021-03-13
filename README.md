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

Start Web server:

```bash
adm_author -h 127.0.0.1 -p 8080 
```

Open http://127.0.0.1:8080 in your Browser 

### ADM config in YAML file

Very basic example structure:

```yaml
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

## GUI Development

In production mode, the Flask server is just using a bundled Javascript and CSS which was generated using [Svelte](https://svelte.dev/). To change the bundeled Javascript and CSS, the Svelte project needs to be build again: 

### Dependencies installation

```bash
cd svelte_app
npm install
```

### Environments
Using 

```bash
npm run build
```

will just build the Svelte project once and close, whilst

```bash
npm run dev
```

will start a webserver (which is actually not needed, since we are using Flask as webserver) in development mode which will rebuild the bundles on evey change.