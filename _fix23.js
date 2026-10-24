const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
if(d.indexOf(\"fc-card[data-id]\")>=0){ console.log('ok'); } else { console.log('no'); }
