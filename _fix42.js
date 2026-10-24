const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\index.html','utf8');
const v=Date.now();
d = d.replace('<script src=\"/static/data.js\"></script>', '<script src=\"/static/data.js?v='+v+'\"></script>');
d = d.replace('<script src=\"/static/app.js\" defer></script>', '<script src=\"/static/app.js?v='+v+'\" defer></script>');
fs.writeFileSync('F:\\proyec-diamons\\index.html',d);
console.log('ok');
