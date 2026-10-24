const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\styles.css','utf8');
d = d.split('box-shadow: 0 26px 60px rgba(6,14,30,.42)').join('box-shadow: 0 22px 50px rgba(6,14,30,.38)');
d = d.split('transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s, filter .35s').join('transition: transform .28s cubic-bezier(.25,.8,.25,1), box-shadow .28s, filter .28s');
fs.writeFileSync('F:\\proyec-diamons\\static\\styles.css',d);
console.log('ok');
