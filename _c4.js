const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\styles.css','utf8');
const i=d.indexOf('EQUIPO');
console.log(d.slice(i,i+900));
