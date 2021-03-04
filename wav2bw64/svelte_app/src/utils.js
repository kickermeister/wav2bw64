import ISO6391 from 'iso-639-1';
import { getRangeFromDisplayedName } from './adm_utils.js';



export function mapISO6391(){
  let languages = [];
  let names = ISO6391.getAllNames();
  for (const name of names){
    languages.push({value: ISO6391.getCode(name), name: name});
  }
  languages.sort(function(a, b){
    if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
  });
  // console.log("ISO639 mapped!", languages);
  return languages;
}


export function exportADM(ADMStore, fileInfo){
  // make deep copy of our store to avoid saving our modifications in case something happens during export / writing
  let adm = JSON.parse(JSON.stringify(ADMStore));
  adm = prepareADMforExport(adm);
  console.log("Prepared ADM: ", adm);
  postADM(adm, fileInfo);
}


function prepareADMforExport(adm){
  console.log("ADm to prepare: ", adm);
  for (const ap of adm){
    for (const item of ap.items){
      item.routing = getRangeFromDisplayedName(item.routing);
    }
  }
  return adm;
}


function postADM(adm, fileInfo) {
  let url = '/set_bw64_config';
  var out_path = fileInfo.path.substr(0, fileInfo.path.lastIndexOf(".")) + "_bw64.wav";
  let formData = new FormData();
  formData.append('adm_dict', JSON.stringify(adm));
  formData.append('in_wav_path', fileInfo.path);
  formData.append('out_bwav_path', out_path);
  fetch(url, {
    method: 'POST',
    body: formData,
    redirect: 'follow',
  })
  //.then(json)
  .then((e) => {
    console.log("Received: ", e);
  }) // <- Add `progressDone` call here
  .catch((e) => { console.log('Received Error: ', e);});
}