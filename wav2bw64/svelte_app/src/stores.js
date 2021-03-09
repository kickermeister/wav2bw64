import { writable } from 'svelte/store';

export const fileInfo = writable({filename: "", path: "", channels: 0});

function getAudioProgrammeStructure(){
  return {
    id: ID(),
    name: "Give me a name", 
    loudness: -23,
    apItems: [],
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
      // {
      //   id: ID(),
      //   name: "Audio Programme 1",
      //   loudness: -23,
      //   apItems: [
      //     {id: ID(), name: "My Object 1" , type: "Object", routing: "1 - 1", object_parameter: {position: {azimuth: 0, elevation: 0, distance: 1.0}}},
      //     {id: ID(), name: "Stereo Bed", type: "0+2+0", routing: "1 - 2"},
      //   ],
      //   language: 'de'
      // },
      // {
      //   id: ID(),
      //   name: "Audio Programme 2",
      //   loudness: -23,
      //   apItems: [
      //     {id: ID(), name: "Surround Bed", type: "0+5+0", routing: "1 - 6"},
      //     {id: ID(), name: "Music", type: "0+2+0", routing: "1 - 2"},
      //     {id: ID(), name: "Dialog", type: "Object", routing: "7 - 7", object_parameter: {position: {azimuth: 0, elevation: 0, distance: 1.0}}},
      //     {id: ID(), name: "Effect", type: "Object", routing: "8 - 8", object_parameter: {position: {azimuth: 0, elevation: 0, distance: 1.0}}},
      //     {id: ID(), name: "Headphones", type: "Binaural", routing: "1 - 2"} 
      //   ],
      //   language: 'en'
      // },
    ]
  );

  return {
    subscribe,
    update,
    set,
    addAP: () => update(adm => {
      return [...adm, getAudioProgrammeStructure()];
    }),
    addItem: (apToUpdate, itemType) => update(adm => {
      let ap = adm.find(ap => ap.id === apToUpdate.id);
      if (itemType === "Object"){
        ap.apItems.push({type: itemType, 
                         routing: [],
                         id: ID(),
                         object_parameter: {position: {azimuth: 0.0, elevation: 0.0, distance: 1.0}}
        });
      } else {
        ap.apItems.push({type: itemType, routing: [], id: ID()});
      }
      return adm;
    })
  }
}
export const ADMStore = Store();