
export const LAYOUTS = [
  {name: "Mono / 0+1+0", value: "0+1+0", channels: 1},
  {name: "Stereo / 0+2+0", value: "0+2+0", channels: 2},
  {name: "5.1 / 0+5+0", value: "0+5+0", channels: 6},
  {name: "5.1+2H / 2+5+0", value: "2+5+0", channels: 8},
  {name: "5.1+4H / 4+5+0", value: "4+5+0", channels: 10},
  {name: "7.2+3H / 3+7+0", value: "3+7+0", channels: 12},
  {name: "9.1+4H / 4+9+0", value: "4+9+0", channels: 14},
  {name: "22.2 / 9+10+3", value: "9+10+3", channels: 24},
  {name: "7.1 / 0+7+0", value: "0+7+0", channels: 8},
  {name: "7.1+4H / 4+7+0", value: "4+7+0", channels: 12},
  {name: "7.1+2H / 2+7+0", value: "2+7+0", channels: 10},
  {name: "Object", value: "Object", channels: 1},
  {name: "Binaural" , value: "Binaural", channels: 2}
];




export function _arange(min, max){
  return Array.from({length:max-min+1},(v,k)=>k+min);
}

export function getLayout(layout){
  let bs2051_layout = LAYOUTS.filter(l => {
    return l.value === layout;
  });
  return bs2051_layout[0];
}

export function getLayoutRoutingPairs(layout, wav_channels){
  let bs2051_layout = getLayout(layout);
  return getValidRoutingPair(bs2051_layout.channels, wav_channels)
}


export function getValidLayouts(wav_channels){
  let valid_layouts = [];
  for (const sys of LAYOUTS){
      if (sys.channels <= wav_channels){
        valid_layouts.push({name: sys.name, value: sys.value, channels: sys.channels});
      }
  }
  return valid_layouts;
}

 export function getValidRoutings(wav_channels){
  let valid_layouts = getValidLayouts(wav_channels);
  let valid_routings = [];
  for (const layout of valid_layouts){
      valid_routings.push({name: layout.value, routings: getValidRoutingPair(layout.channels, wav_channels)});
  }
  return valid_routings;
 }

 export function getValidRoutingPair(sys_chs, wav_channels){
  let routing_pairs = [];
  for (const ch of Array(wav_channels).keys()){
      // axml / chna track index starts with 1
      let upper = 1 + ch + sys_chs - 1;
      if (upper <= wav_channels){
        //let range_val = [1 + ch, upper];
        let range_name = String(1 + ch) + " - " + String(upper);
        routing_pairs.push({name: range_name, value: range_name});
      } else {
      break;
      }
  }
  return routing_pairs;
 }

