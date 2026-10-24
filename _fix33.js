const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace(\"esNqptun ? 'rgba(168,85,247,.55)'\", \"esNqptun ? 'rgba(168,85,247,.58)'\"");
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
