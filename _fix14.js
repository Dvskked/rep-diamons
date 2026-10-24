const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace("style=\"--staff-bg:url('/static/' + esc(p.imagen) + ')')\"", "style=\"--staff-bg:url('/static/' + esc(p.imagen) + ')')\"");
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
