const fs = require('fs');
const files = ['app.js','data.js'];
files.forEach(f=>{
  const d = fs.readFileSync('F:\\proyec-diamons\\static\\'+f,'utf8');
  const m = d.match(/(equipo.*desarrollo|STAFF|ARBITRO|DISENADOR|nqptun|tanuz|susi|hakari|mess|risu|noreik|romani|joaoxz)/i);
  if(m){ console.log(f+': '+m[0]); }
});
