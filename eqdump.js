const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
if(!m){console.log('no');process.exit();}
const data=eval('('+m[1]+')');
const eq=data.contenidos.equipo||[];
eq.forEach((x,i)=>{console.log(i+':',x.titulo,'|',x.subtitulo,'|',x.dato_extra,'|',x.imagen);});
