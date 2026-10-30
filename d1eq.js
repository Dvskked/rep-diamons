const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const eq=data.equipos.filter(e=>e.division==='D1');
eq.forEach(e=>console.log(e.id+':',e.nombre));
