const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
if(!d.includes('ordenado.map((x) => renderStaffHTML(x.p, x.g))')){
  const old =   porGrupo.staff.sort((a, b) => (esNqptun(b) ? 1 : 0) - (esNqptun(a) ? 1 : 0));\n  caja.innerHTML = GRUPOS_EQUIPO.filter((g) => porGrupo[g.clave].length).map((g) => {\n    const tarjetas = porGrupo[g.clave].map(renderStaffHTML).join('');\n    return \<section class=\"equipo-grupo \\" style=\"--rol:\\">\n      <h3 class=\"equipo-seccion-titulo\">\</h3>\n      <div class=\"equipo-filas\">\</div>\n    </section>\;\n  }).join('');;
  const neu =   porGrupo.staff.sort((a, b) => (esNqptun(b) ? 1 : 0) - (esNqptun(a) ? 1 : 0));\n  const ordenado = [];\n  GRUPOS_EQUIPO.filter((g) => porGrupo[g.clave].length).forEach((g) => {\n    porGrupo[g.clave].forEach((p) => ordenado.push({ p, g }));\n  });\n  caja.innerHTML = \<div class=\"equipo-filas\">\</div>\;;
  if(d.includes(old)){
    d = d.split(old).join(neu);
    console.log('replaced');
  } else {
    console.log('not found');
  }
  fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
}
