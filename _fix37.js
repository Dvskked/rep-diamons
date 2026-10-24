const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
const i=d.indexOf('staff-aura');
console.log(d.slice(i-15,i+90));
