const fs = require('fs');
const s = fs.readFileSync('static/app.js','utf8');
let i=0, c=0;
while(true){ const idx=s.indexOf('JORNADA',i); if(idx===-1) break; c++; console.log(c+':', idx); if(c>=3) break; i=idx+1; }
