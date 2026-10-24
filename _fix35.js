const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace(\"<span class=\\\"staff-aura\\\" aria-hidden=\\\"true\\\"></span>\", \"<span class=\\\"staff-aura\\\" style=\\\"--aura:rgba(168,85,247,.58)\\\" aria-hidden=\\\"true\\\"></span>\");
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
