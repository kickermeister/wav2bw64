import { writable } from 'svelte/store';

function getAudioProgrammeStructure(){
  return {
    id: Math.random(),
    name: "Give me a name", 
    loudness: -23,
    items: [],
    language: "EN"
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
          {id: 0, type: "Object", routing: "1 - 1"},
          {id: 1, type: "0+2+0", routing: "1 - 2"},
        ],
        language: 'de'
      },
      {
        id: 1,
        name: "Audio Programme 2",
        loudness: -23,
        items: [
          {id: 0, type: "0+5+0", routing: "1 - 6"},
          {id: 1, type: "0+2+0", routing: "1 - 2"},
          {id: 2, type: "Object", routing: "7 - 7"},
          {id: 3, type: "Object", routing: "8 - 8"}, 
          {id: 4, type: "0+7+0", routing: "1 - 8"},
          {id: 5, type: "Object", routing: "8 - 8"},
          {id: 6, type: "0+2+0", routing: "1 - 2"} 
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