const fs = require('fs');
const s = fs.readFileSync('static/app.js','utf8');
console.log((s.match(/JORNADA/g)||[]).length);
