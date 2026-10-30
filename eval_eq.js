const fs = require('fs');
global.window = {};
eval(fs.readFileSync('static/data.js','utf8'));
const eq = window.SITIO && window.SITIO.contenidos ? window.SITIO.contenidos.equipo : [];
console.log(eq.length);
if(eq.length){
  eq.forEach((e,i)=>{ if(i<15) console.log(i+':', e.titulo, '|', e.subtitulo, '|', e.dato_extra, '|', e.imagen); });
}
