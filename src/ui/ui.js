// UI logic for Football Manager navigation and sidebar switching

const leftContent = document.getElementById('sidebar-left-content');
const rightContent = document.getElementById('sidebar-right-content');
const navButtons = document.querySelectorAll('.nav-btn');

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
