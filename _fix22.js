const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
if(d.indexOf('<button type=\"button\" class=\"fc-card')>=0){ console.log('hasbtn'); } else { console.log('nobtn'); }
