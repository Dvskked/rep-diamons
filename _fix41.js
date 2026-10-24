const fs=require('fs');
const d=fs.readFileSync('F:\\proyec-diamons\\static\\data.js','utf8');
try{
  const j=JSON.parse(d.replace('window.SITIO = ',''));
  console.log('ok', j.equipos.length);
}catch(e){console.log('err');}
