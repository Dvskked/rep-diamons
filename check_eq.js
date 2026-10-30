const fs = require('fs');
const s = fs.readFileSync('static/data.js','utf8');
const i = s.indexOf('"equipo"');
if(i === -1){ console.log('none'); process.exit(); }
console.log('found at', i);
const start = Math.max(0, i-50);
const end = Math.min(s.length, i+800);
console.log(s.slice(start,end));
