const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const jugados=(data.fechas||[]).filter(f=>f.jugado && f.division_a==='D1');
console.log(jugados.length);
jugados.slice(0,1).forEach(x=>{console.log(x.jornada,x.equipo_a,x.goles_a,x.equipo_b,x.goles_b);});
