import { writable } from 'svelte/store';

export const wav_channels = writable();

function getAudioProgrammeStructure(){
  return {
    id: ID(),
    name: "Give me a name", 
    loudness: -23,
    items: [],
    language: "en"
  }
}

export function ID(){
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters after the decimal.
  return Math.random().toString(36).substr(2, 9);
}


function Store() {
  const { subscribe, set, update } = writable(
    [
      {
        id: ID(),
        name: "Audio Programme 1",
        loudness: -23,
        items: [
          {id: ID(), name: "My Object 1" , type: "Object", routing: "1 - 1"},
          {id: ID(), name: "Stereo Bed", type: "0+2+0", routing: "1 - 2"},
        ],
        language: 'de'
      },
      {
        id: ID(),
        name: "Audio Programme 2",
        loudness: -23,
        items: [
          {id: ID(), name: "Surround Bed", type: "0+5+0", routing: "1 - 6"},
          {id: ID(), name: "Music", type: "0+2+0", routing: "1 - 2"},
          {id: ID(), name: "Dialog", type: "Object", routing: "7 - 7"},
          {id: ID(), name: "Commentary", type: "Object", routing: "8 - 8"}, 
          {id: ID(), name: "7.1 Bed", type: "0+7+0", routing: "1 - 8"},
          {id: ID(), name: "Effect", type: "Object", routing: "8 - 8"},
          {id: ID(), name: "Music Bed 2", type: "0+2+0", routing: "1 - 2"} 
        ],
        language: 'en'
      },
    ]
  );

  return {
    subscribe,
    update,
    set,
    addAP: () => update(adm => {
      return [...adm, getAudioProgrammeStructure()];
    })
    //addAP: () => console.log("Add AP in Store!")
  }
}
export const ADMStore = Store();