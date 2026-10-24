const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace(\"document.querySelectorAll('.fc-card[data-id]')\", \"document.querySelectorAll('.fc-card[data-id]')\");
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
