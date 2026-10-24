const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');
const p=d.indexOf('La patrona Sami');
if(p>=0){ console.log(d.slice(p,p+220)); }
