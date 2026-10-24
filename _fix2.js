const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d=d.replace(/esNeptun/g,'esNqptun');
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
console.log('ok');
