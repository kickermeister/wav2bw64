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
          {type: "Object", routing: 1},
          {type: "0+2+0", routing: [1, 2]},
        ],
        language: 'Deutsch'
      },
      {
        id: 1,
        name: "Audio Programme 2",
        loudness: -23,
        items: [
          {type: "0+5+0", routing: [1, 6]},
          {type: "0+2+0", routing: [1, 2]},
          {type: "Object", routing: [1, 6]},
          {type: "Object", routing: [1, 2]}
        ],
        language: 'Deutsch'
      },
    ]
  );

  return {
    subscribe,
    update,
    addAP: () => update(adm => {
      return [...adm, getAudioProgrammeStructure()];
    })
    //addAP: () => console.log("Add AP in Store!")
  }
}
export const ADMStore = Store();