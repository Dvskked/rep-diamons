const fs = require('fs');
const s = fs.readFileSync('static/app.js','utf8');
const idx = s.indexOf('JORNADA 6');
if(idx === -1){ console.log('no'); process.exit(); }
const start = Math.max(0, idx-200);
const end = Math.min(s.length, idx+600);
console.log(s.slice(start,end));
