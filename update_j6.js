const fs = require('fs');
const path = 'F:/proyec-diamons/static/data.js';
let content = fs.readFileSync(path, 'utf8');
const start = content.indexOf('window.SITIO');
const brace = content.indexOf('{', start);
let depth = 1;
let end = -1;
for (let k = brace + 1; k < content.length; k++) {
  if (content[k] === '{') depth++;
  else if (content[k] === '}') {
    depth--;
    if (depth === 0) { end = k + 1; break; }
  }
}
const obj = JSON.parse(content.slice(brace, end));
const partidos = obj.contenidos.liga;

// Results mapping by team names from fixture
// Partido 1: Deportivo Pereira (PER) vs Mystic Storm (MYS) -> 7-4
// Partido 2: Liga Deportiva Alajuense (LDA) vs Melgar F.C (MEL) -> 11-7
// Partido 3: Mafia FC (MCF) vs Lanza Piedras de Cabudare (LPC) -> 3-3
// Partido 4: Nova Squad 404 (NS) vs Orense (ORE) -> 0-0
// Partido 5: Dominion fc (DOM) vs Lexington (LEX) -> 3-2
// Partido 6: Juan Aurich (JUA) vs Klokan F.C (KLO) -> 3-3

function updateMatch(cond, updater) {
  for (let i = 0; i < partidos.length; i++) {
    if (cond(partidos[i])) {
      updater(partidos[i]);
      console.log('Updated match', partidos[i].id, partidos[i].equipo_a, 'vs', partidos[i].equipo_b);
      return true;
    }
  }
  return false;
}

// 1. Pereira vs Mystic Storm (J6)
updateMatch(p => p.jornada === 'JORNADA 6' && ((p.equipo_a.includes('Pereira') || p.equipo_b.includes('Pereira')) && (p.equipo_a.includes('Mystic') || p.equipo_b.includes('Mystic'))), p => {
  // Determine sides
  if (p.equipo_a.includes('Pereira')) {
    p.goles_a = 7; p.goles_b = 4;
    p.goleadores = [
      {jugador_id: 999001, nombre: "PER · Ivn´z", equipo: "a", goles: 2},
      {jugador_id: 999002, nombre: "PER · pirlosky", equipo: "a", goles: 2},
      {jugador_id: 999003, nombre: "PER · zetaxz", equipo: "a", goles: 3}
    ];
    p.asistencias = [
      {jugador_id: 999004, nombre: "PER · Fxz!", equipo: "a", asistencias: 3},
      {jugador_id: 999002, nombre: "PER · pirlosky", equipo: "a", asistencias: 2},
      {jugador_id: 999003, nombre: "PER · zetaxz", equipo: "a", asistencias: 3}
    ];
  } else {
    p.goles_a = 4; p.goles_b = 7;
    p.goleadores = [
      {jugador_id: 999001, nombre: "PER · Ivn´z", equipo: "b", goles: 2},
      {jugador_id: 999002, nombre: "PER · pirlosky", equipo: "b", goles: 2},
      {jugador_id: 999003, nombre: "PER · zetaxz", equipo: "b", goles: 3}
    ];
    p.asistencias = [
      {jugador_id: 999004, nombre: "PER · Fxz!", equipo: "b", asistencias: 3},
      {jugador_id: 999002, nombre: "PER · pirlosky", equipo: "b", asistencias: 2},
      {jugador_id: 999003, nombre: "PER · zetaxz", equipo: "b", asistencias: 3}
    ];
  }
  p.goleadores.push(
    {jugador_id: 999010, nombre: "MYS · Tesu", equipo: p.equipo_a.includes('Mystic') ? 'a' : 'b', goles: 2},
    {jugador_id: 999011, nombre: "MYS · sheraphim", equipo: p.equipo_a.includes('Mystic') ? 'a' : 'b', goles: 2}
  );
  p.asistencias.push(
    {jugador_id: 999010, nombre: "MYS · Tesu", equipo: p.equipo_a.includes('Mystic') ? 'a' : 'b', asistencias: 2},
    {jugador_id: 999012, nombre: "MYS · barry", equipo: p.equipo_a.includes('Mystic') ? 'a' : 'b', asistencias: 2}
  );
  p.autogoles = [];
  p.jugado = true;
});

// 2. LDA vs Melgar
updateMatch(p => p.jornada === 'JORNADA 6' && ((p.equipo_a.includes('Alajuense') || p.equipo_b.includes('Alajuense')) && (p.equipo_a.includes('Melgar') || p.equipo_b.includes('Melgar'))), p => {
  if (p.equipo_a.includes('Alajuense')) {
    p.goles_a = 11; p.goles_b = 7;
    p.goleadores = [
      {jugador_id: 999020, nombre: "LDA · chepe", equipo: "a", goles: 2},
      {jugador_id: 999021, nombre: "LDA · frznn", equipo: "a", goles: 2},
      {jugador_id: 999022, nombre: "LDA · minee", equipo: "a", goles: 2},
      {jugador_id: 999023, nombre: "LDA · montiel", equipo: "a", goles: 3}
    ];
    p.asistencias = [
      {jugador_id: 999020, nombre: "LDA · chepe", equipo: "a", asistencias: 2},
      {jugador_id: 999024, nombre: "LDA · failed_carrot", equipo: "a", asistencias: 1},
      {jugador_id: 999021, nombre: "LDA · frznn", equipo: "a", asistencias: 1},
      {jugador_id: 999022, nombre: "LDA · minee", equipo: "a", asistencias: 2},
      {jugador_id: 999023, nombre: "LDA · montiel", equipo: "a", asistencias: 2}
    ];
  } else {
    p.goles_a = 7; p.goles_b = 11;
    p.goleadores = [
      {jugador_id: 999020, nombre: "LDA · chepe", equipo: "b", goles: 2},
      {jugador_id: 999021, nombre: "LDA · frznn", equipo: "b", goles: 2},
      {jugador_id: 999022, nombre: "LDA · minee", equipo: "b", goles: 2},
      {jugador_id: 999023, nombre: "LDA · montiel", equipo: "b", goles: 3}
    ];
    p.asistencias = [
      {jugador_id: 999020, nombre: "LDA · chepe", equipo: "b", asistencias: 2},
      {jugador_id: 999024, nombre: "LDA · failed_carrot", equipo: "b", asistencias: 1},
      {jugador_id: 999021, nombre: "LDA · frznn", equipo: "b", asistencias: 1},
      {jugador_id: 999022, nombre: "LDA · minee", equipo: "b", asistencias: 2},
      {jugador_id: 999023, nombre: "LDA · montiel", equipo: "b", asistencias: 2}
    ];
  }
  p.goleadores.push(
    {jugador_id: 999030, nombre: "MEL · alesitoo", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', goles: 2},
    {jugador_id: 999031, nombre: "MEL · cuevita", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', goles: 1},
    {jugador_id: 999032, nombre: "MEL · zlito", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', goles: 3}
  );
  p.asistencias.push(
    {jugador_id: 999033, nombre: "MEL · Bryan Reyna", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', asistencias: 1},
    {jugador_id: 999030, nombre: "MEL · alesitoo", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', asistencias: 1},
    {jugador_id: 999031, nombre: "MEL · cuevita", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', asistencias: 2},
    {jugador_id: 999032, nombre: "MEL · zlito", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', asistencias: 2}
  );
  p.autogoles = [
    {jugador_id: 999020, nombre: "LDA · chepe", equipo: p.equipo_a.includes('Alajuense') ? 'a' : 'b', autogoles: 1},
    {jugador_id: 999034, nombre: "MEL · OkVecino", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', autogoles: 1},
    {jugador_id: 999030, nombre: "MEL · alesitoo", equipo: p.equipo_a.includes('Melgar') ? 'a' : 'b', autogoles: 1}
  ];
  p.jugado = true;
});

// 3. Mafia vs Lanza Piedras
updateMatch(p => p.jornada === 'JORNADA 6' && ((p.equipo_a.includes('Mafia') || p.equipo_b.includes('Mafia')) && (p.equipo_a.includes('Lanza') || p.equipo_b.includes('Lanza'))), p => {
  if (p.equipo_a.includes('Mafia')) {
    p.goles_a = 3; p.goles_b = 3;
    p.goleadores = [
      {jugador_id: 999040, nombre: "MCF · wervy", equipo: "a", goles: 2}
    ];
    p.asistencias = [
      {jugador_id: 999041, nombre: "MCF · hoper", equipo: "a", asistencias: 1},
      {jugador_id: 999042, nombre: "MCF · mxteo", equipo: "a", asistencias: 2}
    ];
  } else {
    p.goles_a = 3; p.goles_b = 3;
    p.goleadores = [
      {jugador_id: 999040, nombre: "MCF · wervy", equipo: "b", goles: 2}
    ];
    p.asistencias = [
      {jugador_id: 999041, nombre: "MCF · hoper", equipo: "b", asistencias: 1},
      {jugador_id: 999042, nombre: "MCF · mxteo", equipo: "b", asistencias: 2}
    ];
  }
  p.goleadores.push(
    {jugador_id: 999050, nombre: "LPC · cris", equipo: p.equipo_a.includes('Lanza') ? 'a' : 'b', goles: 1},
    {jugador_id: 999051, nombre: "LPC · paxhinn", equipo: p.equipo_a.includes('Lanza') ? 'a' : 'b', goles: 2}
  );
  p.asistencias.push(
    {jugador_id: 999050, nombre: "LPC · cris", equipo: p.equipo_a.includes('Lanza') ? 'a' : 'b', asistencias: 1},
    {jugador_id: 999051, nombre: "LPC · paxhinn", equipo: p.equipo_a.includes('Lanza') ? 'a' : 'b', asistencias: 1}
  );
  p.autogoles = [];
  p.jugado = true;
});

// 4. Nova Squad vs Orense
updateMatch(p => p.jornada === 'JORNADA 6' && ((p.equipo_a.includes('Nova') || p.equipo_b.includes('Nova')) && (p.equipo_a.includes('Orense') || p.equipo_b.includes('Orense'))), p => {
  p.goles_a = 0; p.goles_b = 0;
  p.goleadores = [];
  p.asistencias = [];
  p.autogoles = [];
  p.jugado = true;
});

// 5. Dominion vs Lexington
updateMatch(p => p.jornada === 'JORNADA 6' && ((p.equipo_a.includes('Dominion') || p.equipo_b.includes('Dominion')) && (p.equipo_a.includes('Lexington') || p.equipo_b.includes('Lexington'))), p => {
  if (p.equipo_a.includes('Dominion')) {
    p.goles_a = 3; p.goles_b = 2;
    p.goleadores = [
      {jugador_id: 999060, nombre: "DOM · Rg", equipo: "a", goles: 1},
      {jugador_id: 999061, nombre: "DOM · bufe", equipo: "a", goles: 2}
    ];
    p.asistencias = [
      {jugador_id: 999062, nombre: "DOM · Maxisc", equipo: "a", asistencias: 1},
      {jugador_id: 999060, nombre: "DOM · Rg", equipo: "a", asistencias: 2}
    ];
  } else {
    p.goles_a = 2; p.goles_b = 3;
    p.goleadores = [
      {jugador_id: 999060, nombre: "DOM · Rg", equipo: "b", goles: 1},
      {jugador_id: 999061, nombre: "DOM · bufe", equipo: "b", goles: 2}
    ];
    p.asistencias = [
      {jugador_id: 999062, nombre: "DOM · Maxisc", equipo: "b", asistencias: 1},
      {jugador_id: 999060, nombre: "DOM · Rg", equipo: "b", asistencias: 2}
    ];
  }
  p.goleadores.push(
    {jugador_id: 999070, nombre: "LEX · flips", equipo: p.equipo_a.includes('Lexington') ? 'a' : 'b', goles: 1},
    {jugador_id: 999071, nombre: "LEX · maestro", equipo: p.equipo_a.includes('Lexington') ? 'a' : 'b', goles: 1}
  );
  p.asistencias.push(
    {jugador_id: 999072, nombre: "LEX · mike", equipo: p.equipo_a.includes('Lexington') ? 'a' : 'b', asistencias: 1},
    {jugador_id: 999071, nombre: "LEX · maestro", equipo: p.equipo_a.includes('Lexington') ? 'a' : 'b', asistencias: 1}
  );
  p.autogoles = [];
  p.jugado = true;
});

// 6. Juan Aurich vs Klokan
updateMatch(p => p.jornada === 'JORNADA 6' && ((p.equipo_a.includes('Juan') || p.equipo_b.includes('Juan')) && (p.equipo_a.includes('Klokan') || p.equipo_b.includes('Klokan'))), p => {
  if (p.equipo_a.includes('Juan')) {
    p.goles_a = 3; p.goles_b = 3;
    p.goleadores = [
      {jugador_id: 999080, nombre: "JUA · sampxz", equipo: "a", goles: 1},
      {jugador_id: 999081, nombre: "JUA · vneko", equipo: "a", goles: 1}
    ];
    p.asistencias = [
      {jugador_id: 999081, nombre: "JUA · vneko", equipo: "a", asistencias: 2}
    ];
  } else {
    p.goles_a = 3; p.goles_b = 3;
    p.goleadores = [
      {jugador_id: 999080, nombre: "JUA · sampxz", equipo: "b", goles: 1},
      {jugador_id: 999081, nombre: "JUA · vneko", equipo: "b", goles: 1}
    ];
    p.asistencias = [
      {jugador_id: 999081, nombre: "JUA · vneko", equipo: "b", asistencias: 2}
    ];
  }
  p.goleadores.push(
    {jugador_id: 999090, nombre: "KLO · Samdarp", equipo: p.equipo_a.includes('Klokan') ? 'a' : 'b', goles: 2},
    {jugador_id: 999091, nombre: "KLO · yasser", equipo: p.equipo_a.includes('Klokan') ? 'a' : 'b', goles: 1}
  );
  p.asistencias.push(
    {jugador_id: 999090, nombre: "KLO · Samdarp", equipo: p.equipo_a.includes('Klokan') ? 'a' : 'b', asistencias: 1},
    {jugador_id: 999092, nombre: "KLO · Sunny", equipo: p.equipo_a.includes('Klokan') ? 'a' : 'b', asistencias: 1},
    {jugador_id: 999091, nombre: "KLO · yasser", equipo: p.equipo_a.includes('Klokan') ? 'a' : 'b', asistencias: 1}
  );
  p.autogoles = [];
  p.jugado = true;
});

const newContent = content.slice(0, brace) + JSON.stringify(obj) + content.slice(end);
fs.writeFileSync(path, newContent);
console.log('Done');
