const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
if(d.indexOf(\"--staff-bg:url('/static/\")>=0){ console.log('ok'); } else { console.log('no'); }
