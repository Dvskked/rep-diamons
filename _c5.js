const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\styles.css','utf8');
const i=d.indexOf('.staff-card');
console.log(i);
if(i>=0) console.log(d.slice(i,i+800));
