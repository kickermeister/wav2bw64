import ISO6391 from 'iso-639-1';


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