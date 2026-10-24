const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');
const p=JSON.parse(d.replace('window.SITIO = ',''));
if(p.contenidos && p.contenidos.equipo){
  p.contenidos.equipo.forEach(x=>{
    if(/nqptun/i.test(x.titulo)){ x.titulo='nqptun'; x.dato_extra='STAFF'; x.subtitulo=x.subtitulo||'andresneptunzinho'; }
    if(/sami/i.test(x.titulo)){ x.titulo='La patrona Sami'; x.dato_extra='OWNER'; x.subtitulo='La patrona Sami'; if(!x.imagen) x.imagen='uploads/equipodesarrollo/fondos/samifondo.png'; }
  });
}
fs.writeFileSync('F:\\proyec-diamons\\static\\data.js','window.SITIO = '+JSON.stringify(p));
console.log('ok');
