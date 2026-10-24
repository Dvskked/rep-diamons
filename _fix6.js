const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
const start=d.indexOf('function renderStaffHTML');
if(start>=0){
  let brace=0; let i=start;
  for(;i<d.length;i++){ if(d[i]==='{'){brace++;} if(d[i]==='}'){brace--; if(brace===0 && d[i+1]===';'){i+=1;break;} if(brace===0){break;}}}
  const neu = const ROL_AURA = {\n  fundadores: 'rgba(255,107,240,.45)',\n  staff: 'rgba(32,123,228,.45)',\n  arbitros: 'rgba(235,240,90,.42)',\n  disenadores: 'rgba(28,221,255,.42)',\n  programador: 'rgba(119,28,255,.42)'\n};\nfunction renderStaffHTML(p, grupoInfo) {\n  const info = infoRol(p.dato_extra);\n  const g = grupoInfo || GRUPOS_EQUIPO.find((x) => x.clave === info.grupo) || { color: '#207be4', titulo: info.etiqueta };\n  const foto = p.imagen\n    ? \<img src=\"/static/\\" alt=\"Foto de \\" loading=\"lazy\" decoding=\"async\">\\n    : iniciales(p.titulo);\n  const sub = p.subtitulo ? esc(p.subtitulo).replace(/^[A-Z]{3}\\s*\\|\\s*/i, '') : '';\n  const user = sub ? \<p class=\"staff-user\">Discord · \</p>\ : '';\n  const texto = p.texto ? \<p class=\"staff-texto\">\</p>\ : '';\n  const titulo = p.titulo ? esc(p.titulo).replace(/^[A-Z]{3}\\s*\\|\\s*/i, '') : '';\n  const esSami = /sami/i.test(\\ \\);\n  const esNqptun = /nqptun/i.test(\\ \\);\n  const auraColor = esNqptun ? 'rgba(168,85,247,.55)' : (ROL_AURA[info.grupo] || g.color + '55');\n  const aura = \<span class=\"staff-aura\" style=\"--aura:\\" aria-hidden=\"true\"></span>\;\n  let fondo = '';\n  if (esSami && p.imagen) {\n    fondo = \ style=\"--staff-bg:url('/static/\')\"\;\n  }\n  return \<article class=\"staff-card \\\ reveal\" style=\"--rol:\\"\>\n    \\n    <div class=\"staff-avatar\">\</div>\n    <div class=\"staff-info\">\n      <span class=\"staff-rol\">\</span>\n      <h4>\</h4>\n      \\\n    </div>\n  </article>\;\n};
  d = d.slice(0,start) + neu + d.slice(i+1);
  fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
  console.log('ok');
} else console.log('no');
