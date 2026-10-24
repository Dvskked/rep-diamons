const fs=require('fs');const d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');const idx=d.indexOf('EQUIPO');console.log(idx);if(idx>=0){console.log(d.slice(idx,idx+500));}
