const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace("fondo = ' style=\"--staff-bg:url(/static/' + esc(p.imagen) + ')\"'", "fondo = ' style=\"--staff-bg:url(\\'/static/' + esc(p.imagen) + '\\')\"'");
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
console.log('ok');
