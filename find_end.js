const fs = require('fs');
const s = fs.readFileSync('F:/proyec-diamons/static/data.js','utf8');
const i = s.indexOf('window.SITIO');
const j = s.indexOf('{', i);
let d = 1;
for (let k = j+1; k < s.length; k++) {
  if (s[k] === '{') d++;
  else if (s[k] === '}') {
    d--;
    if (d === 0) { console.log(k); process.exit(0); }
  }
}
console.log(-1);
