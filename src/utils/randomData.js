// randomData.js - Generate random teams and players for hyper-complex football manager
import { Player } from '../player/player.js';
import { Team } from '../team/team.js';


// 4-2-3-1 positions (2 per position)
const formation = [
  { pos: 'GK', count: 2 },
  { pos: 'RB', count: 2 },
  { pos: 'LB', count: 2 },
  { pos: 'CB', count: 4 },
  { pos: 'DM', count: 2 },
  { pos: 'CM', count: 2 },
  { pos: 'RW', count: 2 },
  { pos: 'LW', count: 2 },
  { pos: 'AM', count: 2 },
  { pos: 'ST', count: 2 },
];

const teamColors = [
  '#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe',
  '#008080','#e6beff','#9a6324','#fffac8','#800000','#aaffc3','#808000','#ffd8b1','#000075','#808080'
];

// Nationality-based name pools
const namePools = [
  {
    nationality: 'Ireland',
    first: ['Sean','Cian','Oisin','Eoin','Conor','Liam','Darragh','Fionn','Padraig','Ronan'],
    last: ['Murphy','Kelly','Byrne','Ryan','OBrien','Walsh','OConnor','Doyle','McCarthy','Gallagher']
  },
  {
    nationality: 'England',
    first: ['Jack','Harry','Oliver','George','Charlie','Alfie','Freddie','Archie','Henry','Thomas'],
    last: ['Smith','Jones','Taylor','Brown','Williams','Wilson','Johnson','Davies','Robinson','Wright']
  },
  {
    nationality: 'Scotland',
    first: ['Callum','Lewis','Finlay','Euan','Fraser','Angus','Cameron','Blair','Ross','Murray'],
    last: ['Campbell','Stewart','Robertson','MacDonald','Anderson','Scott','Murray','Clark','Reid','Walker']
  },
  {
    nationality: 'Wales',
    first: ['Dylan','Rhys','Morgan','Osian','Gethin','Iwan','Harri','Elis','Gruffydd','Ioan'],
    last: ['Evans','Thomas','Roberts','Lewis','Hughes','Morgan','Jenkins','Owen','Price','Davies']
  },
  {
    nationality: 'France',
    first: ['Lucas','Hugo','Louis','Jules','Arthur','Leo','Nathan','Gabriel','Theo','Mathis'],
    last: ['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Moreau','Laurent','Simon']
  },
  {
    nationality: 'Spain',
    first: ['Alejandro','Pablo','Hugo','Daniel','Diego','Javier','Marcos','Adrian','Sergio','Raul'],
    last: ['Garcia','Fernandez','Gonzalez','Rodriguez','Lopez','Martinez','Sanchez','Perez','Gomez','Diaz']
  },
  {
    nationality: 'Germany',
    first: ['Leon','Paul','Jonas','Elias','Finn','Noah','Luis','Felix','Emil','Max'],
    last: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schäfer']
  },
  {
    nationality: 'Italy',
    first: ['Alessandro','Matteo','Lorenzo','Andrea','Francesco','Marco','Davide','Luca','Gabriele','Riccardo'],
    last: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco']
  },
  {
    nationality: 'Netherlands',
    first: ['Daan','Sem','Milan','Levi','Bram','Lars','Finn','Jesse','Luuk','Thijs'],
    last: ['de Jong','Jansen','de Vries','van den Berg','Bakker','van Dijk','Visser','Smit','Meijer','de Boer']
  },
  {
    nationality: 'Portugal',
    first: ['João','Rodrigo','Martim','Santiago','Tomás','Afonso','Francisco','Miguel','Rafael','Gabriel'],
    last: ['Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Martins','Rodrigues','Sousa','Fernandes']
  },
  {
    nationality: 'Brazil',
    first: ['Lucas','Gabriel','Matheus','Pedro','Guilherme','Rafael','Felipe','Gustavo','Vinicius','Daniel'],
    last: ['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Rodrigues','Almeida','Barbosa']
  },
  {
    nationality: 'Argentina',
    first: ['Mateo','Santiago','Thiago','Bautista','Benjamín','Juan','Tomás','Francisco','Agustín','Lautaro'],
    last: ['González','Rodríguez','Gómez','Fernández','López','Díaz','Martínez','Pérez','Romero','Sosa']
  },
  {
    nationality: 'Nigeria',
    first: ['Chinedu','Emeka','Ifeanyi','Uche','Chukwu','Olumide','Tunde','Segun','Ayo','Kelechi'],
    last: ['Okafor','Obi','Adeyemi','Eze','Okoye','Abiola','Balogun','Chukwu','Ogunleye','Nwosu']
  },
  {
    nationality: 'USA',
    first: ['Mason','Logan','Carter','Jackson','Aiden','Grayson','Lucas','Benjamin','Elijah','James'],
    last: ['Smith','Johnson','Williams','Brown','Jones','Miller','Davis','Garcia','Rodriguez','Martinez']
  },
];

function randomNationality() {
  // Weighted: Ireland/UK more likely, then Europe, then rest
  const weights = [5,5,3,2,3,3,3,3,2,2,2,2,2,1,1];
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for (let i=0;i<weights.length;i++) {
    if (r < weights[i]) return namePools[i];
    r -= weights[i];
  }
  return namePools[0];
}

function randomNameAndNationality() {
  const pool = randomNationality();
  const first = pool.first[Math.floor(Math.random()*pool.first.length)];
  const last = pool.last[Math.floor(Math.random()*pool.last.length)];
  return { name: `${first} ${last}`, nationality: pool.nationality };
}

function randomAttributes(position) {
  // Use Player.initAttributes to get all keys, then randomize
  const base = Player.initAttributes();
  const attrs = {};
  for (const key in base) {
    // GK gets higher GK stats, outfield gets higher outfield stats
    if (position === 'GK' && key.startsWith('gk')) {
      attrs[key] = Math.floor(Math.random()*40)+60;
    } else if (position === 'GK') {
      attrs[key] = Math.floor(Math.random()*30)+1;
    } else if (key.startsWith('gk')) {
      attrs[key] = Math.floor(Math.random()*10)+1;
    } else {
      attrs[key] = Math.floor(Math.random()*60)+30;
    }
  }
  return attrs;
}

export function generateRandomTeams(numTeams = 20, playersPerTeam = 22) {
  const teams = [];
  for (let t = 0; t < numTeams; t++) {
    const teamName = `Team ${t+1}`;
    const color = teamColors[t % teamColors.length];
    const players = [];
    let posList = [];
    // 2 per position in 4-2-3-1
    formation.forEach(f => {
      for (let i = 0; i < f.count; i++) posList.push(f.pos);
    });
    // Shuffle posList
    for (let i = posList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posList[i], posList[j]] = [posList[j], posList[i]];
    }
    for (let p = 0; p < playersPerTeam; p++) {
      const pos = posList[p % posList.length];
      const { name, nationality } = randomNameAndNationality();
      players.push(new Player({
        name,
        age: Math.floor(Math.random()*15)+17,
        position: pos,
        attributes: randomAttributes(pos),
        nationality,
        traits: [],
      }));
    }
    teams.push(new Team({ name: teamName, color, players }));
  }
  return teams;
}
