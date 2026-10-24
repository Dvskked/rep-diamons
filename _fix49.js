const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
const first=d.indexOf('const ROL_AURA');
const second=d.indexOf('const ROL_AURA', first+1);
if(second>=0){
  let i=second; let brace=0; for(;i<d.length;i++){ if(d[i]==='{')brace++; if(d[i]==='}'){brace--; if(brace===0){i++;break;}}}
  d = d.slice(0,second) + d.slice(i);
  fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
  console.log('ok');
} else console.log('no');
