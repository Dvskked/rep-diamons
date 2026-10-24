const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\styles.css','utf8');
const i=d.indexOf('.fc-card:hover');
if(i>=0){ console.log(d.slice(i,i+120)); }
