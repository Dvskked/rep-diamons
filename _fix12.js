const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
if(d.indexOf('--staff-bg:url')>=0) console.log('has'); else console.log('no');
