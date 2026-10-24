const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
if(d.indexOf('<button')>=0){ console.log('btn'); } else { console.log('nobtn'); }
