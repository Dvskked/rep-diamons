const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const re=/"jornada":\s*"JORNADA 6"/g;
let m,c=0; while((m=re.exec(s))){c++; if(c<2){console.log(m.index);} }
console.log('total',c);
