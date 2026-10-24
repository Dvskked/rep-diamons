const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\styles.css','utf8');
d = d.split('translateY(-10px)').join('translateY(-8px)');
d = d.split('0 36px 76px rgba(6,14,30,.52)').join('0 28px 64px rgba(6,14,30,.46)');
fs.writeFileSync('F:\\proyec-diamons\\static\\styles.css',d);
