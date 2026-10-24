const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');
const p=d.indexOf('"equipos"');
console.log(d.slice(p,p+1500));
