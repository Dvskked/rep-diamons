const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
d = d.replace(/<button type=\"button\" class=\"fc-card fc-[^\"]* reveal\" data-id=/g, '<div class=\"fc-card fc- reveal\" data-id=');
d = d.replace(/<button type=\"button\" class=\"fc-card fc-([^\"]*) reveal\" data-id=/g, '<div role=\"button\" tabindex=\"0\" class=\"fc-card fc- reveal\" data-id=');
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
