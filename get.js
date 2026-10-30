const fs = require('fs');
const a = fs.readFileSync('static/app.js','utf8');
console.log(a.indexOf('equipo-filas'));
console.log(a.indexOf('admin-grid'));
