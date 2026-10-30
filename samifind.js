const fs=require('fs');
const s=fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const m=s.match(/window\.SITIO\s*=\s*([\s\S]*);/);
const data=eval('('+m[1]+')');
const sami=data.contenidos.equipo.find(x=>/sami/i.test(x.titulo));
console.log(JSON.stringify(sami));
