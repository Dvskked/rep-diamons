const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const d1=[19,23,16,26,20,27,22,24,21,17,18,25];
d1.forEach(id=>{
  const eq=data.equipos.find(e=>e.id==id);
  if(eq){ console.log('===',eq.nombre,'('+ (eq.jugadores||[]).length +')'); (eq.jugadores||[]).slice(0,5).forEach(j=>console.log(j.id,j.nombre)); }
});
