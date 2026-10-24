const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace(/<button class=\"fc-card[^\"]*\"[^>]*>/g, function(m){ if(m.includes('data-id')) return m; return m; });
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
