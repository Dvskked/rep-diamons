const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
try{
  // quick syntax check
  new Function(d);
  console.log('jsok');
}catch(e){console.log('jserr');}
