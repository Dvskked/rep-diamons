const fs=require('fs');
let d=JSON.parse(fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8').replace('window.SITIO = ',''));
if(d.contenidos && d.contenidos.equipo){
  d.contenidos.equipo.forEach(p=>{
    if(/sami/i.test(p.titulo)){
      p.dato_extra='OWNER';
      p.subtitulo='La patrona Sami';
      if(!p.imagen){ p.imagen='uploads/equipodesarrollo/fondos/samifondo.png'; }
    }
    if(/nqptun/i.test(p.titulo)){ p.titulo='nqptun'; p.dato_extra='STAFF'; }
    if(/tanuz/i.test(p.titulo)){ p.titulo='tanuz'; p.subtitulo='.tanuz.'; p.dato_extra='STAFF'; }
    if(/susic/i.test(p.titulo)){ p.titulo='susic'; p.subtitulo='isawt._.'; p.dato_extra='STAFF'; }
    if(/hakari/i.test(p.titulo)){ p.titulo='hakari'; p.subtitulo='kid_27pr'; p.dato_extra='STAFF'; }
    if(/hall/i.test(p.titulo)){ p.titulo='hall jornamister deny'; p.subtitulo='messi048786'; p.dato_extra='STAFF'; }
    if(/danyaw/i.test(p.titulo)){ p.titulo='danyaw'; p.subtitulo='.danyawyl'; p.dato_extra='STAFF'; }
    if(p.titulo && /sucic/i.test(p.titulo) && !/noreik/i.test(p.titulo)){ p.titulo='sucic'; p.subtitulo='awt._.'; p.dato_extra='ARBITRO'; }
    if(/KID/i.test(p.titulo) && !/Jorna/i.test(p.titulo)){ p.titulo='KID'; p.subtitulo='kid__2'; p.dato_extra='ARBITRO'; }
    if(/juli/i.test(p.titulo)){ p.titulo='juli'; p.subtitulo='juliii_ra'; p.dato_extra='DISEÑADOR'; }
    if(/risu/i.test(p.titulo)){ p.titulo='risu'; p.subtitulo='risuhina'; p.dato_extra='DISEÑADOR'; }
    if(/napsisky/i.test(p.titulo)){ p.titulo='napsisky'; p.subtitulo='se.queira'; p.dato_extra='DISEÑADOR'; }
    if(/noreik3/i.test(p.titulo)){ p.titulo='noreik3'; p.subtitulo='noreik3'; p.dato_extra='DISEÑADOR'; }
    if(/romani/i.test(p.titulo)){ p.titulo='romani'; p.subtitulo='elperuviano_'; p.dato_extra='DISEÑADOR'; }
    if(/joaoxz/i.test(p.titulo)){ p.titulo='joaoxz'; p.subtitulo='alexyt_17'; p.dato_extra='DISEÑADOR'; }
    if(/michael/i.test(p.titulo)){ p.titulo='michael jackson'; p.subtitulo='mjackson_07'; p.dato_extra='DISEÑADOR'; }
  });
  d.contenidos.equipo.sort((a,b)=>(a.orden||99)-(b.orden||99));
}
fs.writeFileSync('F:\\proyec-diamons\\static\\data.js', 'window.SITIO = ' + JSON.stringify(d));
console.log('ok');
