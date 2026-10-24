const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\index.html','utf8');
console.log(d.indexOf('data.js?v'), d.indexOf('app.js?v'));
