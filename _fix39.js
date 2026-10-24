const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\index.html','utf8');
console.log(d.match(/data\.js|app\.js/g));
