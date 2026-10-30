const fs = require('fs');
const s = fs.readFileSync('static/app.js','utf8');
const idx = s.indexOf('"jornadas"');
if(idx === -1){ console.log('no'); process.exit(); }
console.log(idx);
const start = Math.max(0, idx-150);
const end = Math.min(s.length, idx+800);
console.log(s.slice(start,end));
