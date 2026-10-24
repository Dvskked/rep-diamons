const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace(\"rgba(168,85,247,.55)\", \"rgba(168,85,247,.58)\");
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
