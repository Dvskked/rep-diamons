const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
for (let i=0;i<data.fechas.length;i++){
  const f=data.fechas[i];
  if((f.jornada||'').toUpperCase().includes('JORNADA 6') && f.division_a==='D1'){
    console.log(f.id, f.equipo_a, f.equipo_b);
  }
}
