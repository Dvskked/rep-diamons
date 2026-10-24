const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');
JSON.parse(d.replace('window.SITIO = ',''));
console.log('jsonok');
