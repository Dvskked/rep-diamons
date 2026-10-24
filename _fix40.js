const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\index.html','utf8');
const i=d.lastIndexOf('<script');
console.log(d.slice(i,i+220));
