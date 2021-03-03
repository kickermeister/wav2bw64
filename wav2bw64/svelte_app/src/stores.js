import { writable } from 'svelte/store';

export const wav_channels = writable();

function getAudioProgrammeStructure(){
  return {
    id: Math.random(),
    name: "Give me a name", 
    loudness: -23,
    items: [],
    language: "en"
  }
}


function Store() {
  const { subscribe, set, update } = writable(
    [
      {
        id: 0,
        name: "Audio Programme 1",
        loudness: -23,
        items: [
          {id: 0, name: "My Object 1" , type: "Object", routing: "1 - 1"},
          {id: 1, name: "Stereo Bed", type: "0+2+0", routing: "1 - 2"},
        ],
        language: 'de'
      },
      {
        id: 1,
        name: "Audio Programme 2",
        loudness: -23,
        items: [
          {id: 0, name: "Surround Bed", type: "0+5+0", routing: "1 - 6"},
          {id: 1, name: "Music", type: "0+2+0", routing: "1 - 2"},
          {id: 2, name: "Dialog", type: "Object", routing: "7 - 7"},
          {id: 3, name: "Commentary", type: "Object", routing: "8 - 8"}, 
          {id: 4, name: "7.1 Bed", type: "0+7+0", routing: "1 - 8"},
          {id: 5, name: "Effect", type: "Object", routing: "8 - 8"},
          {id: 6, name: "Music Bed 2", type: "0+2+0", routing: "1 - 2"} 
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