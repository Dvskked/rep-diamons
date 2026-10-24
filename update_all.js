const fs = require('fs');
const path = 'F:\\proyec-diamons\\static\\data.js';
let raw = fs.readFileSync(path, 'utf8');
const d = JSON.parse(raw.replace('window.SITIO = ', ''));

function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');}
function findEquipo(name){
  const s = slug(name);
  let e = d.equipos.find(x=> slug(x.nombre)===s);
  if(!e) e = d.equipos.find(x=> slug(x.nombre).includes(s) || s.includes(slug(x.nombre)));
  if(!e) e = d.equipos.find(x=> x.sigla && slug(x.sigla)===s);
  return e;
}
function ensureJugador(eq, nombre){
  if(!eq.jugadores) eq.jugadores=[];
  let j = eq.jugadores.find(x=> slug(x.nombre)===slug(nombre));
  if(!j){
    j = {id: Date.now()+Math.floor(Math.random()*100000), equipo_id: eq.id, nombre: nombre, dorsal:null, posicion:'', goles:0, asistencias:0, autogoles:0, cs:0, minutos_cs:0, equipo_sigla:eq.sigla, equipo_nombre:eq.nombre, equipo_color:eq.color};
    eq.jugadores.push(j);
  }
  j.equipo_id = eq.id; j.equipo_sigla = eq.sigla; j.equipo_nombre = eq.nombre; j.equipo_color = eq.color;
  return j;
}

const gkD1 = [
  {eq:'ORENSE', name:'Chucky', min:'01:05'},
  {eq:'DEPORTIVO PEREIRA', name:'Mob', min:'03:45'},
  {eq:'IGUANITAS FC', name:'grgr', min:'4:04'},
  {eq:'MYSTIC STORM', name:'Ker', min:'5:31'},
  {eq:'JUAN AURICH', name:'dick', min:'6:13'},
  {eq:'NOVA SQUAD 404', name:'???????????? ´ ?  ??????', min:'0:18'},
  {eq:'DEPORTIVO PEREIRA', name:'Mobsito', min:'1:47'},
  {eq:'DOMINION FC', name:'Crx', min:'12:40'},
  {eq:'DEPORTIVO PEREIRA', name:'????????', min:'5:43'},
  {eq:'MAFIA', name:'GKMedioMalo', min:'1:47'},
  {eq:'ORENSE', name:'Chanvi', min:'5:44'},
  {eq:'MELGAR', name:'LxNyther19', min:'2:34'},
  {eq:'JUAN AURICH', name:'giooooooooooooo', min:'9:11'},
  {eq:'IGUANITAS FC', name:'ramma--', min:'0:29'},
  {eq:'JUAN AURICH', name:'lux', min:'7:21'},
  {eq:'DEPORTIVO PASTO', name:'bruh', min:'2:29'},
  {eq:'KLOKAN FC', name:'Alexandre Pato', min:'9:37'},
  {eq:'NOVA SQUAD 404', name:'zsher', min:'1:34'},
  {eq:'DEPORTIVO PEREIRA', name:'??lNecrofilia', min:'3:12'},
];
const gkD2 = [
  {eq:'CD ALIANZA PLATANERA', name:'MAMIFERO', min:'00:27'},
  {eq:'DEPORTIVO SPIDER', name:'Zurdo OPM', min:'07:47'},
  {eq:'VISAJOSOS', name:'Yox', min:'5:00'},
  {eq:'ASSOCIACAO ESPORTIVA FENIX', name:'Carvajal', min:'3:27'},
  {eq:'DIAMOND BLANK', name:'s4nt1dosky MODO SERIO 67', min:'2:04'},
  {eq:'MAFIA', name:'GKMedioMalo', min:'1:53'},
  {eq:'DEPORTIVO PASTO', name:'.?.? ?????????????? ?.?.', min:'9:17'},
  {eq:'ASSOCIACAO ESPORTIVA FENIX', name:'feid (casta)', min:'10:31'},
  {eq:'CD ALIANZA PLATANERA', name:'Sucic', min:'3:09'},
  {eq:'ASSOCIACAO ESPORTIVA FENIX', name:'blue, c s', min:'02:25'},
  {eq:'DEPORTIVO SPIDER', name:'P2', min:'0:37'},
  {eq:'POLLOLANDIA CH', name:'Jonz', min:'09:50'},
  {eq:'DISTRITO EVOLUTION', name:'Sami', min:'00:24'},
  {eq:'DEPORTIVO SPIDER', name:'TUKU LEON', min:'21:00'},
];
function addGK(list){ list.forEach(g=>{ const eq=findEquipo(g.eq); if(!eq) return; const j=ensureJugador(eq,g.name); j.posicion = j.posicion||'GK'; if(g.min) j.gk_minutos = g.min; }); }
addGK(gkD1); addGK(gkD2);

const lanzapiedras = ['avctvo','Mqrcos','keyn_253','colaboremeconelsilencio','ziha22','dick_aura','rokicuncun','paxhin'];
let eqLp = findEquipo('Lanzapiedras');
if(!eqLp){ /* create if missing */ eqLp = {id: Date.now()+2000, nombre:'Lanzapiedras', sigla:'LZP', division:'D1', color:'#0f2a4a', escudo:'', jugadores:[]}; d.equipos.push(eqLp); }
eqLp.color = '#0f2a4a';
lanzapiedras.forEach(n=> ensureJugador(eqLp,n));

const iguanitas = ['Mateozzz','4ntu.','cmamut','vislumbrate','brucepower1','franciscoandree'];
const eqIg = findEquipo('Iguanitas');
if(eqIg){ eqIg.color = '#1fbf3f'; iguanitas.forEach(n=> ensureJugador(eqIg,n)); }

const eqJa = findEquipo('Juan Aurich');
if(eqJa){ if(!eqJa.jugadores) eqJa.jugadores=[]; if(!eqJa.jugadores.find(x=>slug(x.nombre)==='kl0se')){ eqJa.jugadores.push({id:Date.now()+3000,equipo_id:eqJa.id,nombre:'kl0se',dorsal:null,posicion:'',goles:0,asistencias:0,autogoles:0,cs:0,minutos_cs:0,equipo_sigla:eqJa.sigla,equipo_nombre:eqJa.nombre,equipo_color:eqJa.color}); } }

['MAFIA'].forEach(n=>{ const eq=findEquipo(n); if(eq) ensureJugador(eq,'GKMedioMalo'); });

function addFromReport(){
  const ap=findEquipo('CD ALIANZA PLATANERA'); if(ap){ ['Roxtar','Milan','Alesz','Angox','Lulo','Mamifero','Medianoch','Medicensebas','Spencer','Sucic'].forEach(n=>ensureJugador(ap,n)); if(ap.color!=='#f5a623') ap.color='#f5a623'; }
  const pl=findEquipo('POLLOLANDIA CH'); if(pl){ ['barqi','Skey','FantaRosario','Coca 3 Litros','Kabri-nha','Kabrinha','Miky Woodz','Przzzzzzzzzzz','hw','Jonz'].forEach(n=>ensureJugador(pl,n)); }
  const dp=findEquipo('DEPORTIVO PASTO'); if(dp){ ['RiveraX!+','Trx!','raz','mz','milan','.o.? AngelXD ?.o.','Barin','Javkz','Vupaz','feid (casta)','gg','gota','bruh'].forEach(n=>ensureJugador(dp,n)); }
  const de=findEquipo('DISTRITO EVOLUTION'); if(de){ ['Sami','Dan','juan','quienseraforest','4way','Dio Kush','Goretzka','Nick','Nyx','Roki','belli ssj5','fac'].forEach(n=>ensureJugador(de,n)); }
  const fen=findEquipo('ASSOCIACAO ESPORTIVA FENIX'); if(fen){ ['Carvajal','feid (casta)','blue, c s'].forEach(n=>ensureJugador(fen,n)); }
  const vis=findEquipo('VISAJOSOS'); if(vis){ ['BKM','Dybala pau','Jhon duran','L','Wosito','Yox'].forEach(n=>ensureJugador(vis,n)); }
  const dsp=findEquipo('DEPORTIVO SPIDER'); if(dsp){ ['Champu','Crazy','bh','Tuca','Tuku leon','Latapop','P2','Puchungo','Zurdo OPM'].forEach(n=>ensureJugador(dsp,n)); }
}
addFromReport();

if(!d.contenidos.equipo) d.contenidos.equipo = [];
const equipo = d.contenidos.equipo;
function getOrCreate(titulo){ let p = equipo.find(x=> slug(x.titulo)===slug(titulo)); if(!p){ p={id:Date.now()+Math.floor(Math.random()*100000),modulo:'equipo',titulo:titulo,subtitulo:'',texto:'',enlace:'',imagen:'',dato_extra:'STAFF',categoria:'',fecha:null,orden:99,visible:1}; equipo.push(p);} return p; }

let sami = equipo.find(x=> /sami/i.test(x.titulo));
if(!sami) sami = getOrCreate('La patrona Sami');
sami.titulo='La patrona Sami'; sami.subtitulo='La patrona Sami'; sami.dato_extra='OWNER'; sami.imagen='uploads/equipodesarrollo/fondos/samifondo.png'; sami.orden=1;

let nqptun = equipo.find(x=> /nqptun|neptun/i.test(x.titulo));
if(!nqptun) nqptun = getOrCreate('nqptun');
nqptun.titulo='nqptun'; nqptun.subtitulo='andresneptunzinho'; nqptun.dato_extra='STAFF'; nqptun.orden=2;

[ ['tanuz','.tanuz.',3], ['susic','isawt._.',4], ['hakari','kid_27pr',5], ['hall jornamister deny','messi048786',6], ['danyaw','.danyawyl',7] ].forEach(x=>{ let p=equipo.find(y=>slug(y.titulo)===slug(x[0])); if(!p)p=getOrCreate(x[0]); p.titulo=x[0]; p.subtitulo=x[1]; p.dato_extra='STAFF'; p.orden=x[2]; });

let sc = equipo.find(x=> /sucic/i.test(x.titulo));
if(!sc) sc = getOrCreate('sucic'); sc.titulo='sucic'; sc.subtitulo='awt._.'; sc.dato_extra='ARBITRO'; sc.orden=10;
let kid = equipo.find(x=> /KID/i.test(x.titulo) && !/Jorna/i.test(x.titulo));
if(!kid) kid = getOrCreate('KID'); kid.titulo='KID'; kid.subtitulo='kid__2'; kid.dato_extra='ARBITRO'; kid.orden=11;

[ ['juli','juliii_ra',20], ['risu','risuhina',21], ['napsisky','se.queira',22], ['noreik3','noreik3',23], ['romani','elperuviano_',24], ['joaoxz','alexyt_17',25], ['michael jackson','mjackson_07',26] ].forEach(x=>{ let p=equipo.find(y=>slug(y.titulo).includes(slug(x[0]).replace('michael jackson','michael')) || (y.subtitulo&&y.subtitulo===x[1])); if(!p)p=getOrCreate(x[0]); p.titulo=x[0]; p.subtitulo=x[1]; p.dato_extra='DISEÑADOR'; p.orden=x[2]; });

equipo.forEach(p=>{ const t=slug(p.titulo); if(/neptun/.test(t) && !/nqptun/.test(t)) p.titulo='nqptun'; });
equipo.sort((a,b)=> (a.orden||99)-(b.orden||99));

fs.writeFileSync(path, 'window.SITIO = ' + JSON.stringify(d));
console.log('done');
