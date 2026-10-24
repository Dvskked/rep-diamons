const fs=require('fs');
let d=JSON.parse(fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8').replace('window.SITIO = ',''));
d.contenidos.equipo.forEach(p=>{ if(/sami|nqptun|tanuz|hakari|risu|juli|kid/i.test(p.titulo)) console.log(p.titulo+'|'+p.dato_extra+'|'+p.subtitulo); });
