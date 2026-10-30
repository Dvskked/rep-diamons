const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const j5=(data.fechas||[]).filter(f=>(f.jornada||'').includes('JORNADA 5') && f.division_a==='D1');
j5.slice(0,1).forEach(x=>{console.log(JSON.stringify(x,null,2));});
