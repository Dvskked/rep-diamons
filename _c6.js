const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\styles.css','utf8');
const i=d.indexOf('.staff-avatar');
console.log(d.slice(i-20,i+160));
const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');
const p=d.indexOf('"equipos"');
console.log(d.slice(p,p+1500));
