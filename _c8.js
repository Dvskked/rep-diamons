const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\styles.css','utf8');
const i=d.indexOf('.staff-user');
console.log(d.slice(i,i+140));
