const fs = require('fs');
const raw = fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');
const d = JSON.parse(raw.replace('window.SITIO = ', ''));
console.log('modulos:', d.modulos.map(m=>m.clave).join(','));
console.log('equipos:', d.equipos.length);
d.equipos.forEach(e=>{
  if(e.jugadores && e.jugadores.length>0){
    console.log(e.id, e.nombre, e.division, 'j:'+e.jugadores.length);
  }
});
if(d.contenidos && d.contenidos.equipo){
  console.log('equipo_cont:', d.contenidos.equipo.length);
  d.contenidos.equipo.forEach(p=>console.log(' ', p.titulo, '|', p.subtitulo, '|', p.dato_extra));
}
