const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const j4=(data.fechas||[]).filter(f=>f.jornada.includes('JORNADA 4') && f.division_a==='D1' && f.jugado);
j4.forEach(x=>{
  console.log('===',x.equipo_a,x.goles_a,'-',x.goles_b,x.equipo_b);
  console.log(JSON.stringify(x.goleadores));
  console.log(JSON.stringify(x.asistencias));
  console.log(JSON.stringify(x.autogoles));
});
