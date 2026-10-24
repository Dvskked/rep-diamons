const fs=require('fs');const d=fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');const p=d.indexOf('contenidos');console.log(d.slice(p,p+900));
