const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
console.log(d.indexOf(\".fc-card[data-id]\"));
