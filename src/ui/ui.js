// UI logic for Football Manager navigation and sidebar switching

console.log('🎮 Football Manager UI System Loading...');

const leftContent = document.getElementById('sidebar-left-content');
const rightContent = document.getElementById('sidebar-right-content');
const navButtons = document.querySelectorAll('.nav-btn');

console.log(`📊 UI Elements found - Left: ${!!leftContent}, Right: ${!!rightContent}, Nav Buttons: ${navButtons.length}`);

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

// Make setSection globally accessible
window.setSection = function(section) {
  // Clear previous content
  leftContent.innerHTML = '';
  rightContent.innerHTML = '';

  switch(section) {
    case 'home':
      leftContent.innerHTML = `
        <h2>📊 Dashboard</h2>
        <div class="info-card">
          <div class="info-card-header">Next Fixture</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Opponent:</span>
              <span class="dashboard-value">Manchester City</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Date:</span>
              <span class="dashboard-value">Oct 15, 2025</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Venue:</span>
              <span class="dashboard-value">Home</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Recent Results</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">vs Liverpool</span>
              <span class="dashboard-value status-good">W 2-1</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">vs Chelsea</span>
              <span class="dashboard-value status-warning">D 1-1</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">vs Tottenham</span>
              <span class="dashboard-value status-good">W 3-0</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Team Status</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Squad Morale:</span>
              <span class="dashboard-value">Excellent</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-warning"></span>Injuries:</span>
              <span class="dashboard-value">2 Players</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Fitness:</span>
              <span class="dashboard-value">92%</span>
            </div>
          </div>
        </div>
      `;
      rightContent.innerHTML = `
        <h2>⚡ Quick Actions</h2>
        <div class="quick-action" data-action="team">
          🏃‍♂️ Manage Team
        </div>
        <div class="quick-action" data-action="club">
          🏟️ Club Overview
        </div>
        <div class="quick-action" data-action="stats">
          📈 View Statistics
        </div>
        <div class="quick-action" data-action="world">
          🌍 Explore World
        </div>
        
        <div class="info-card">
          <div class="info-card-header">League Position</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Position:</span>
              <span class="dashboard-value">3rd</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Points:</span>
              <span class="dashboard-value">58</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Goal Difference:</span>
              <span class="dashboard-value">+15</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Latest News</div>
          <div class="info-card-content">
            📰 Transfer window opens in 2 weeks<br>
            🏆 Cup final draw announced<br>
            ⚽ Player of the month voting
          </div>
        </div>
      `;
      break;
    case 'team':
      leftContent.innerHTML = `
        <h2>⚽ Team Management</h2>
        <div class="info-card">
          <div class="info-card-header">Squad Overview</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Total Players:</span>
              <span class="dashboard-value">25</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Available:</span>
              <span class="dashboard-value">23</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Injured:</span>
              <span class="dashboard-value">2</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Team Morale</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Overall:</span>
              <span class="dashboard-value">Excellent</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Recent Form:</span>
              <span class="dashboard-value">W-D-W-W-L</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Fitness Report</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Squad Average:</span>
              <span class="dashboard-value">92%</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Training Intensity:</span>
              <span class="dashboard-value">High</span>
            </div>
          </div>
        </div>
      `;
      rightContent.innerHTML = `
        <h2>👥 Squad Management</h2>
        <div class="quick-action">
          📋 View Full Squad
        </div>
        <div class="quick-action">
          ⭐ Select Starting XI
        </div>
        <div class="quick-action">
          🔄 Make Substitutions
        </div>
        
        <h3>🎯 Tactics</h3>
        <div class="info-card">
          <div class="info-card-header">Current Formation</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Formation:</span>
              <span class="dashboard-value">4-3-3</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Style:</span>
              <span class="dashboard-value">Attacking</span>
            </div>
          </div>
        </div>
        
        <h3>🏃‍♂️ Training</h3>
        <div class="quick-action">
          📅 Training Schedule
        </div>
        <div class="quick-action">
          🎯 Set Piece Practice
        </div>
        <div class="quick-action">
          💪 Fitness Program
        </div>
      `;
      break;
    case 'club':
      leftContent.innerHTML = `
        <h2>🏟️ Club Overview</h2>
        <div class="info-card">
          <div class="info-card-header">Club Information</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Founded:</span>
              <span class="dashboard-value">1886</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Stadium:</span>
              <span class="dashboard-value">Emirates Stadium</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Capacity:</span>
              <span class="dashboard-value">60,704</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Reputation</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Domestic:</span>
              <span class="dashboard-value">World Class</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>European:</span>
              <span class="dashboard-value">Elite</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">World Ranking:</span>
              <span class="dashboard-value">#8</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Recent History</div>
          <div class="info-card-content">
            🏆 Premier League (2003-04)<br>
            🏆 FA Cup (2019-20)<br>
            🏆 Community Shield (2020)
          </div>
        </div>
      `;
      rightContent.innerHTML = `
        <h2>👨‍💼 Club Management</h2>
        <div class="info-card">
          <div class="info-card-header">Staff</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Assistant Coach:</span>
              <span class="dashboard-value">Available</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Head Scout:</span>
              <span class="dashboard-value">John Smith</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Physio:</span>
              <span class="dashboard-value">Dr. Johnson</span>
            </div>
          </div>
        </div>
        
        <h3>💰 Transfers</h3>
        <div class="quick-action">
          📤 Transfer List
        </div>
        <div class="quick-action">
          📥 Incoming Offers
        </div>
        <div class="quick-action">
          🔍 Scout Reports
        </div>
        
        <h3>🏗️ Facilities</h3>
        <div class="info-card">
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Training Ground:</span>
              <span class="dashboard-value">Excellent</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Youth Academy:</span>
              <span class="dashboard-value">World Class</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Medical Center:</span>
              <span class="dashboard-value">Good</span>
            </div>
          </div>
        </div>
      `;
      break;
    case 'board':
      leftContent.innerHTML = `
        <h2>🎯 Board Expectations</h2>
        <div class="info-card">
          <div class="info-card-header">Season Objectives</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Top 4 Finish:</span>
              <span class="dashboard-value">On Track</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-warning"></span>Cup Progress:</span>
              <span class="dashboard-value">Behind</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Youth Development:</span>
              <span class="dashboard-value">Excellent</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Job Security</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Board Confidence:</span>
              <span class="dashboard-value">High</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Contract:</span>
              <span class="dashboard-value">2 years left</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Performance Review</div>
          <div class="info-card-content">
            📈 Tactical approach: Excellent<br>
            👥 Player management: Good<br>
            🏆 Results: Very Good
          </div>
        </div>
      `;
      rightContent.innerHTML = `
        <h2>💰 Financial Overview</h2>
        <div class="info-card">
          <div class="info-card-header">Current Budget</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Transfer Budget:</span>
              <span class="dashboard-value">£45M</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Wage Budget:</span>
              <span class="dashboard-value">£180M/year</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Available:</span>
              <span class="dashboard-value">78%</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Financial Health</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label"><span class="status-indicator status-good"></span>Revenue:</span>
              <span class="dashboard-value">£350M</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Expenses:</span>
              <span class="dashboard-value">£285M</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Profit:</span>
              <span class="dashboard-value">£65M</span>
            </div>
          </div>
        </div>
        
        <h3>🏛️ Boardroom</h3>
        <div class="quick-action">
          📅 Board Meeting
        </div>
        <div class="quick-action">
          🎯 Club Vision
        </div>
        <div class="quick-action">
          📊 Financial Report
        </div>
      `;
      break;
    case 'stats':
      leftContent.innerHTML = `
        <h2>📊 League Statistics</h2>
        <div class="info-card">
          <div class="info-card-header">Top Goalscorers</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">1. M. Salah (LIV)</span>
              <span class="dashboard-value">18 goals</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">2. E. Haaland (MCI)</span>
              <span class="dashboard-value">16 goals</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">3. H. Kane (BAY)</span>
              <span class="dashboard-value">14 goals</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Top Assists</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">1. K. De Bruyne (MCI)</span>
              <span class="dashboard-value">12 assists</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">2. B. Fernandes (MUN)</span>
              <span class="dashboard-value">10 assists</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">3. Son H-M (TOT)</span>
              <span class="dashboard-value">9 assists</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Clean Sheets</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">1. Alisson (LIV)</span>
              <span class="dashboard-value">8</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">2. Ederson (MCI)</span>
              <span class="dashboard-value">7</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">3. Ramsdale (ARS)</span>
              <span class="dashboard-value">6</span>
            </div>
          </div>
        </div>
        
        <div class="quick-action" data-action="advanced-stats">
          📈 Advanced Statistics Dashboard
        </div>
      `;
      rightContent.innerHTML = `
        <h2>🌍 Global Statistics</h2>
        <div class="info-card">
          <div class="info-card-header">Other Leagues</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">La Liga Leader:</span>
              <span class="dashboard-value">Barcelona</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Serie A Leader:</span>
              <span class="dashboard-value">Napoli</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Bundesliga Leader:</span>
              <span class="dashboard-value">Bayern Munich</span>
            </div>
          </div>
        </div>
        
        <div class="quick-action">
          🏆 View All Records
        </div>
        <div class="quick-action">
          📈 Advanced Analytics
        </div>
        <div class="quick-action">
          🌟 Player Comparisons
        </div>
        
        <h3>🏆 Records</h3>
        <div class="info-card">
          <div class="info-card-header">Club Records</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">Highest Win:</span>
              <span class="dashboard-value">7-0 vs Slavia</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Longest Win Streak:</span>
              <span class="dashboard-value">14 games</span>
            </div>
          </div>
        </div>
      `;
      
      // Add stats container to center content
      const centerContent = document.getElementById('center-content');
      if (centerContent && !document.getElementById('stats-container')) {
        const statsContainer = document.createElement('div');
        statsContainer.id = 'stats-container';
        statsContainer.style.display = 'none';
        centerContent.appendChild(statsContainer);
      }
      break;
    case 'world':
      leftContent.innerHTML = `
        <h2>🌍 World Browser</h2>
        <div class="info-card">
          <div class="info-card-header">Browse Leagues</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League:</span>
              <span class="dashboard-value">20 clubs</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">🇪🇸 La Liga:</span>
              <span class="dashboard-value">20 clubs</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">🇩🇪 Bundesliga:</span>
              <span class="dashboard-value">18 clubs</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">🇮🇹 Serie A:</span>
              <span class="dashboard-value">20 clubs</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">International</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">🌍 World Cup:</span>
              <span class="dashboard-value">2026 (USA)</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">🏆 Euros:</span>
              <span class="dashboard-value">2028 (TBD)</span>
            </div>
          </div>
        </div>
        
        <div class="quick-action">
          🔍 Search Competitions
        </div>
        <div class="quick-action">
          🗺️ League Map
        </div>
      `;
      rightContent.innerHTML = `
        <h2>📰 World News</h2>
        <div class="info-card">
          <div class="info-card-header">Latest Transfers</div>
          <div class="info-card-content">
            💰 Mbappé to Real Madrid (€200M)<br>
            ⚽ Bellingham extends at Dortmund<br>
            🔄 Pogba returns to Juventus
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Match Results</div>
          <div class="info-card-content">
            <div class="dashboard-item">
              <span class="dashboard-label">El Clásico:</span>
              <span class="dashboard-value">BAR 2-1 RMA</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Der Klassiker:</span>
              <span class="dashboard-value">BVB 0-3 BAY</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Derby d'Italia:</span>
              <span class="dashboard-value">JUV 1-2 INT</span>
            </div>
          </div>
        </div>
        
        <h3>🔍 Scouting Network</h3>
        <div class="quick-action">
          👤 Find Players
        </div>
        <div class="quick-action">
          👨‍💼 Find Staff
        </div>
        <div class="quick-action">
          🏟️ Club Profiles
        </div>
        
        <div class="info-card">
          <div class="info-card-header">Recommended</div>
          <div class="info-card-content">
            ⭐ Young talent in Brazil<br>
            🎯 Available free agents<br>
            💎 Hidden gems in Championship
          </div>
        </div>
      `;
      break;
  }
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    try {
      // Remove active state from all buttons
      navButtons.forEach(b => b.classList.remove('active'));
      // Add active state to clicked button
      btn.classList.add('active');
      // Set the section
      window.setSection(btn.dataset.section);
    } catch (error) {
      console.error('Error in navigation:', error);
    }
  });
});

// Set default section and activate home button
try {
  window.setSection('home');
  const homeButton = document.querySelector('[data-section="home"]');
  if (homeButton) {
    homeButton.classList.add('active');
  }
} catch (error) {
  console.error('Error setting default section:', error);
}

// Global click handler for quick actions and interactive elements
document.addEventListener('click', function(e) {
  // Handle quick action clicks and nav-tab with data-action
  if (e.target.classList.contains('quick-action') || (e.target.classList.contains('nav-tab') && e.target.dataset.action)) {
    const text = e.target.textContent.trim();
    const action = e.target.dataset.action;
    
    console.log(`Action clicked: ${text}`);
    
    // Add visual feedback
    e.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.target.style.transform = 'scale(1.02)';
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
      }, 150);
    }, 100);
    
    // Handle special actions
    if (action === 'advanced-stats') {
      window.showAdvancedStats();
      return;
    }
    
    if (action === 'close-stats') {
      window.closeAdvancedStats();
      return;
    }
    
    // Handle navigation actions
    if (action && typeof window.setSection === 'function') {
      // Update navigation button states
      const navButtons = document.querySelectorAll('.nav-btn');
      navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === action) {
          btn.classList.add('active');
        }
      });
      
      // Navigate to the section
      window.setSection(action);
    }
  }
  
  // Handle dashboard item clicks
  if (e.target.classList.contains('dashboard-item') || e.target.closest('.dashboard-item')) {
    const item = e.target.closest('.dashboard-item') || e.target;
    console.log(`Dashboard item clicked:`, item.textContent);
    
    // Add visual feedback
    item.style.background = 'rgba(74, 158, 255, 0.2)';
    setTimeout(() => {
      item.style.background = '';
    }, 300);
  }
});

// Advanced Statistics Function
window.showAdvancedStats = function() {
  console.log('🏆 Opening Advanced Statistics Dashboard');
  
  const canvas = document.getElementById('pitch');
  const statsContainer = document.getElementById('stats-container');
  
  if (statsContainer) {
    // Hide canvas, show stats
    canvas.style.display = 'none';
    statsContainer.style.display = 'block';
    
    // Load comprehensive statistics display
    statsContainer.innerHTML = `
      <div class="stats-dashboard">
        <div class="dashboard-header">
          <h2 class="team-title">Advanced Statistics Dashboard</h2>
          <div class="dashboard-nav">
            <button class="nav-tab active" data-view="overview">Overview</button>
            <button class="nav-tab" data-view="players">Players</button>
            <button class="nav-tab" data-view="teams">Teams</button>
            <button class="nav-tab" data-view="league">League</button>
            <button class="nav-tab" data-action="close-stats">✕ Close</button>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="card-header">
              <h3>🏆 Season Overview</h3>
            </div>
            <div class="card-content">
              <div class="dashboard-item">
                <span class="dashboard-label">Games Played:</span>
                <span class="dashboard-value">28</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Current Position:</span>
                <span class="dashboard-value">3rd</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Points Per Game:</span>
                <span class="dashboard-value">2.07</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="card-header">
              <h3>⚽ Attack Statistics</h3>
            </div>
            <div class="card-content">
              <div class="dashboard-item">
                <span class="dashboard-label">Goals Scored:</span>
                <span class="dashboard-value">64</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Expected Goals (xG):</span>
                <span class="dashboard-value">58.7</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Shots per Game:</span>
                <span class="dashboard-value">16.2</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Shot Accuracy:</span>
                <span class="dashboard-value">47.8%</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="card-header">
              <h3>🛡️ Defense Statistics</h3>
            </div>
            <div class="card-content">
              <div class="dashboard-item">
                <span class="dashboard-label">Goals Conceded:</span>
                <span class="dashboard-value">31</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Clean Sheets:</span>
                <span class="dashboard-value">12</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Tackles per Game:</span>
                <span class="dashboard-value">18.4</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Tackle Success:</span>
                <span class="dashboard-value">71.2%</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="card-header">
              <h3>⚡ Performance Metrics</h3>
            </div>
            <div class="card-content">
              <div class="dashboard-item">
                <span class="dashboard-label">Pass Completion:</span>
                <span class="dashboard-value">84.5%</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Possession Average:</span>
                <span class="dashboard-value">62.8%</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Distance Covered:</span>
                <span class="dashboard-value">112.3 km/game</span>
              </div>
              <div class="dashboard-item">
                <span class="dashboard-label">Sprint Distance:</span>
                <span class="dashboard-value">6.8 km/game</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-section">
          <h3>🌟 Top Performers This Season</h3>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Position</th>
                  <th>Apps</th>
                  <th>Goals</th>
                  <th>Assists</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr class="player-row">
                  <td class="player-name">Martin Ødegaard</td>
                  <td class="position">CAM</td>
                  <td>26</td>
                  <td class="goals">8</td>
                  <td class="assists">12</td>
                  <td class="per90">7.8</td>
                </tr>
                <tr class="player-row">
                  <td class="player-name">Bukayo Saka</td>
                  <td class="position">RW</td>
                  <td>28</td>
                  <td class="goals">14</td>
                  <td class="assists">8</td>
                  <td class="per90">7.6</td>
                </tr>
                <tr class="player-row">
                  <td class="player-name">Gabriel Jesus</td>
                  <td class="position">ST</td>
                  <td>24</td>
                  <td class="goals">18</td>
                  <td class="assists">6</td>
                  <td class="per90">7.4</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};

// Function to close advanced stats
window.closeAdvancedStats = function() {
  const canvas = document.getElementById('pitch');
  const statsContainer = document.getElementById('stats-container');
  
  if (statsContainer && canvas) {
    canvas.style.display = 'block';
    statsContainer.style.display = 'none';
    statsContainer.innerHTML = '';
  }
};
