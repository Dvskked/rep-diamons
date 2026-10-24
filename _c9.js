const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
const i=d.indexOf('function pintarEquipo');
console.log(d.slice(i,i+320));
