const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const jugados=(data.fechas||[]).filter(f=>f.jugado);
console.log('jugados:',jugados.length);
if(jugados.length){
  console.log(JSON.stringify(jugados[0],null,2));
}
