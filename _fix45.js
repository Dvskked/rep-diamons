const fs=require('fs');
const html=fs.readFileSync('F:\\proyec-diamons\\index.html','utf8');
const d=html.indexOf('data.js'); const a=html.indexOf('app.js');
console.log(d<a);
