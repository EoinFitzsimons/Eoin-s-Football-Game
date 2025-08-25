// UI logic for Football Manager navigation and sidebar switching

const leftContent = document.getElementById('sidebar-left-content');
const rightContent = document.getElementById('sidebar-right-content');
const navButtons = document.querySelectorAll('.nav-btn');

// Helper: group attributes by category
function groupAttributes(attributes) {
  const groups = {
    Attacking: [], Defending: [], Physical: [], Mental: [], Technical: [], Goalkeeping: [], Psychological: [], Miscellaneous: []
  };
  for (const key in attributes) {
    if ([
      'finishing','composure','offball','technique','flair','crossing','dribbling','firsttouch','longshots','passing','vision','heading','movement','creativity','anticipation','volley','curve','throughball','cutback','chip','lob','onevone','poaching','tapin','setpiece','freekick','penalty','corner','shotpower','shotaccuracy','finishingangle','composurebox','instinct','reaction'
    ].includes(key)) groups.Attacking.push([key, attributes[key]]);
    else if ([
      'marking','tackling','positioning','aggression','bravery','concentration','decisions','teamwork','interceptions','workrate','composuredef','strength','balance','block','clearance','slide','stand','aerialduel','anticipationdef','cover','press','tracking','recoveryrun','discipline'
    ].includes(key)) groups.Defending.push([key, attributes[key]]);
    else if ([
      'pace','acceleration','stamina','strength','balance','agility','jumping','naturalfitness','injuryproneness','recovery','flexibility','resilience','sprint','burst','core','upperbody','lowerbody','reach','reactiontime','quickness','explosiveness'
    ].includes(key)) groups.Physical.push([key, attributes[key]]);
    else if ([
      'determination','leadership','workrate','composuremental','vision','flair','anticipationmental','decisions','concentration','positioningmental','influence','discipline','temperament','pressure','focus','confidence','aggressionmental','consistency','adaptability','ambition','professionalism','controversy','sportsmanship','loyalty','temperamentbig'
    ].includes(key)) groups.Mental.push([key, attributes[key]]);
    else if ([
      'ballcontrol','dribblingclose','dribblingopen','passinglong','passingshort','passingvision','crossingearly','crossinglate','shootingdistance','shootingclose','touch','trapping','feint','nutmeg','flick','backheel','rabona','outsidefoot','volleytech','chiptech','lobtech'
    ].includes(key)) groups.Technical.push([key, attributes[key]]);
    else if (key.startsWith('gk')) groups.Goalkeeping.push([key, attributes[key]]);
    else if ([
      'morale','form','pressurehandling','crowd','rivalry','clutch','bigmatch','nerves'
    ].includes(key)) groups.Psychological.push([key, attributes[key]]);
    else groups.Miscellaneous.push([key, attributes[key]]);
  }
  return groups;
}

// Player profile page logic
export function showPlayerProfile(player) {
  // Player info: name, position, nationality, age, height, weight, preferred foot
  // Height: 165-200cm, Weight: 60-100kg, Preferred foot: random
  const height = player.height || (Math.floor(Math.random()*36)+165);
  const weight = player.weight || (Math.floor(Math.random()*41)+60);
  const foot = player.foot || (Math.random()<0.45 ? 'Right' : (Math.random()<0.5 ? 'Left' : 'Both'));
  leftContent.innerHTML = `
    <h2>${player.name}</h2>
    <div><b>Position:</b> ${player.position}</div>
    <div><b>Nationality:</b> ${player.nationality}</div>
    <div><b>Age:</b> ${player.age}</div>
    <div><b>Height:</b> ${height} cm</div>
    <div><b>Weight:</b> ${weight} kg</div>
    <div><b>Preferred Foot:</b> ${foot}</div>
    <div><b>Traits:</b> ${player.traits && player.traits.length ? player.traits.join(', ') : 'None'}</div>
    <hr>
    <h3>Attributes (1-99)</h3>
  `;
  // Group and display attributes by category
  const groups = groupAttributes(player.attributes);
  for (const cat in groups) {
    if (groups[cat].length) {
      leftContent.innerHTML += `<b>${cat}</b><div class="attr-group">`;
      groups[cat].forEach(([k,v]) => {
        leftContent.innerHTML += `<div class="attr-row"><span class="attr-name">${k}</span><span class="attr-bar"><span style="display:inline-block;background:#4682b4;height:10px;width:${v}%;min-width:10px;"></span></span><span class="attr-val">${v}</span></div>`;
      });
      leftContent.innerHTML += `</div>`;
    }
  }
  rightContent.innerHTML = '';
}

function setSection(section) {
  // Clear previous content
  leftContent.innerHTML = '';
  rightContent.innerHTML = '';

  switch(section) {
    case 'home':
      leftContent.innerHTML = `
        <h2>Dashboard</h2>
        <div>Next Fixture</div>
        <div>Recent Results</div>
        <div>League Position</div>
        <div>News</div>
      `;
      rightContent.innerHTML = `
        <h2>Quick Links</h2>
        <div>Go to Team</div>
        <div>Go to Club</div>
        <div>Go to Board</div>
        <div>Go to Stats</div>
      `;
      break;
    case 'team':
      leftContent.innerHTML = `
        <h2>Team Overview</h2>
        <div>Morale</div>
        <div>Injuries</div>
        <div>Fitness</div>
      `;
      rightContent.innerHTML = `
        <h2>Squad</h2>
        <div>Player List</div>
        <h2>Tactics</h2>
        <div>Formation</div>
        <h2>Training</h2>
        <div>Schedule</div>
      `;
      break;
    case 'club':
      leftContent.innerHTML = `
        <h2>Club Overview</h2>
        <div>History</div>
        <div>Reputation</div>
      `;
      rightContent.innerHTML = `
        <h2>Staff</h2>
        <div>Coaches</div>
        <div>Scouts</div>
        <h2>Transfers</h2>
        <div>Transfer List</div>
        <h2>Club Info</h2>
        <div>Stadium</div>
        <div>Kits</div>
        <div>Facilities</div>
      `;
      break;
    case 'board':
      leftContent.innerHTML = `
        <h2>Board Expectations</h2>
        <div>Objectives</div>
        <div>Job Security</div>
      `;
      rightContent.innerHTML = `
        <h2>Finances</h2>
        <div>Budget</div>
        <div>Income/Expenses</div>
        <h2>Boardroom</h2>
        <div>Meetings</div>
        <div>Vision</div>
      `;
      break;
    case 'stats':
      leftContent.innerHTML = `
        <h2>League Stats</h2>
        <div>Top Scorers</div>
        <div>Assists</div>
        <div>Clean Sheets</div>
      `;
      rightContent.innerHTML = `
        <h2>Global Stats</h2>
        <div>Other Leagues</div>
        <div>Nations</div>
        <div>World Rankings</div>
        <h2>Records</h2>
        <div>Club</div>
        <div>League</div>
        <div>World</div>
      `;
      break;
    case 'world':
      leftContent.innerHTML = `
        <h2>Browse</h2>
        <div>Leagues</div>
        <div>Nations</div>
        <div>Competitions</div>
      `;
      rightContent.innerHTML = `
        <h2>News</h2>
        <div>Transfers</div>
        <div>Results</div>
        <div>Awards</div>
        <h2>Scouting</h2>
        <div>Players</div>
        <div>Staff</div>
        <div>Clubs</div>
      `;
      break;
  }
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setSection(btn.dataset.section);
  });
});

// Set default section
setSection('home');
