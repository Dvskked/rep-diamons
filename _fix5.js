const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
const start=d.indexOf('function pintarEquipo()');
const end=d.indexOf('function renderStaffHTML',start);
console.log(start,end);
