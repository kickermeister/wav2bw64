import langs from 'langs';


export function mapISO6391(){
  let languages = [];
  for (const lang of langs.all()){
    languages.push({value: lang["2B"], name: lang["name"]});
  }
  languages.sort(function(a, b){
    if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
  });
  return languages;
}


export function downloadBW64(path){
  console.log("Download path: ", path);
}