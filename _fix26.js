const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace('<button type=\"button\"', '<div role=\"button\" tabindex=\"0\"');
d = d.replace('</button>', '</div>');
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
