const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
const neu = unction pintarEquipo() {\n  const caja = #equipoGrid;\n  if (!caja) return;\n  const items = cont('equipo').filter((p) => !ROLES_OCULTOS.has(String(p.dato_extra || '').toUpperCase()));\n  if (!items.length) { caja.innerHTML = vacio('Equipo no publicado.'); return; }\n  const porGrupo = { fundadores: [], staff: [], arbitros: [], disenadores: [], programador: [] };\n  items.forEach((p) => {\n    const g = infoRol(p.dato_extra).grupo;\n    if (porGrupo[g]) porGrupo[g].push(p);\n    else porGrupo.staff.push(p);\n  });\n  const esNqptun = (p) => /nqptun/i.test(\\ \\);\n  porGrupo.staff.sort((a, b) => (esNqptun(b) ? 1 : 0) - (esNqptun(a) ? 1 : 0));\n  const ordenado = [];\n  GRUPOS_EQUIPO.filter((g) => porGrupo[g.clave].length).forEach((g) => {\n    porGrupo[g.clave].forEach((p) => ordenado.push({ p, g }));\n  });\n  caja.innerHTML = \<div class=\"equipo-filas\">\</div>\;\n  revelar();\n};
const start = d.indexOf('function pintarEquipo()');
if(start>=0){
  let end = d.indexOf('function renderStaffHTML', start);
  if(end>=0){
    d = d.slice(0,start) + neu + '\n' + d.slice(end);
    fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
    console.log('ok');
  } else console.log('noend');
} else console.log('nostart');
