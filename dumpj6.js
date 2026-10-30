const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const j6=(data.fechas||[]).filter(f=>(f.jornada||'').toLowerCase().includes('jornada 6'));
j6.forEach(x=>{
  console.log('===',x.id,x.jornada,x.division_a);
  console.log(x.equipo_a,'vs',x.equipo_b);
  console.log('played:',x.jugado,'goles:',x.goles_a,x.goles_b);
  console.log('goleadores:', JSON.stringify(x.goleadores));
  console.log('asis:', JSON.stringify(x.asistencias));
  console.log('autogoles:', JSON.stringify(x.autogoles));
  console.log('cs:',x.cs_a,x.cs_b,'porteros:',x.portero_a,x.portero_b,'mins:',x.minutos_cs_a,x.minutos_cs_b);
  console.log('');
});
