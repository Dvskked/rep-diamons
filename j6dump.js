const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
console.log('keys:', Object.keys(data));
console.log('fechas:', (data.fechas||[]).length);
const j6=(data.fechas||[]).filter(f=>(f.jornada||'').toLowerCase().includes('jornada 6'));
console.log('j6 count:', j6.length);
j6.slice(0,10).forEach(x=>console.log(x.id,x.jornada,x.division_a,x.equipo_a,x.goles_a,x.equipo_b,x.goles_b,x.jugado));
