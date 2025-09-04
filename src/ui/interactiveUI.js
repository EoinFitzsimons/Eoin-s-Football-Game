/**
 * Enhanced Interactive UI System - Connected to Game State
 * Provides full interactivity with real game data integration
 */

class InteractiveUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.leftContent = document.getElementById('sidebar-left-content');
    this.rightContent = document.getElementById('sidebar-right-content');
    this.navButtons = document.querySelectorAll('.nav-btn');
    this.currentSection = 'home';
    this.selectedPlayer = null;
    this.selectedTeam = null;
    
    // Event listeners for interactivity
    this.setupEventListeners();
    
    // Initialize with game data
    this.updateUI();
    
    console.log('🎮 Interactive UI System initialized with game state connection');
  }

  setupEventListeners() {
    // Navigation buttons
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.target.dataset.section || e.target.textContent.toLowerCase().trim();
        this.setSection(section);
      });
    });

    // Dynamic event delegation for interactive elements
    document.addEventListener('click', (e) => {
      this.handleDynamicClick(e);
    });

    // Game state change listeners
    if (this.gameState.eventCallbacks) {
      this.gameState.eventCallbacks.uiUpdate = () => this.updateUI();
      this.gameState.eventCallbacks.playerUpdate = (player) => this.updatePlayerInfo(player);
      this.gameState.eventCallbacks.teamUpdate = (team) => this.updateTeamInfo(team);
    }
  }

  handleDynamicClick(e) {
    const element = e.target;
    
    // Quick actions
    if (element.classList.contains('quick-action')) {
      const action = element.dataset.action;
      this.executeQuickAction(action);
    }
    
    // Player selection
    if (element.classList.contains('player-item')) {
      const playerId = element.dataset.playerId;
      this.selectPlayer(playerId);
    }
    
    // Team selection  
    if (element.classList.contains('team-item')) {
      const teamId = element.dataset.teamId;
      this.selectTeam(teamId);
    }

    // Transfer actions
    if (element.classList.contains('transfer-btn')) {
      const action = element.dataset.action;
      const playerId = element.dataset.playerId;
      this.handleTransferAction(action, playerId);
    }

    // Match actions
    if (element.classList.contains('match-action')) {
      const action = element.dataset.action;
      this.handleMatchAction(action);
    }

    // Formation changes
    if (element.classList.contains('formation-btn')) {
      const formation = element.dataset.formation;
      this.changeFormation(formation);
    }

    // Tactical changes
    if (element.classList.contains('tactic-btn')) {
      const tactic = element.dataset.tactic;
      const value = element.dataset.value;
      this.changeTactics(tactic, value);
    }
  }

  setSection(section) {
    this.currentSection = section;
    
    // Update navigation buttons
    this.navButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.section === section || 
          btn.textContent.toLowerCase().trim() === section) {
        btn.classList.add('active');
      }
    });

    // Load section content
    this.loadSectionContent(section);
  }

  loadSectionContent(section) {
    this.leftContent.innerHTML = '';
    this.rightContent.innerHTML = '';

    switch(section) {
      case 'home':
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'team':
      case 'squad':
        this.loadTeamManagement();
        break;
      case 'transfers':
      case 'market':
        this.loadTransferMarket();
        break;
      case 'matches':
      case 'fixtures':
        this.loadMatchCenter();
        break;
      case 'league':
      case 'standings':
        this.loadLeagueView();
        break;
      case 'stats':
      case 'statistics':
        this.loadStatistics();
        break;
      case 'club':
      case 'finances':
        this.loadClubManagement();
        break;
      case 'world':
        this.loadWorldView();
        break;
      default:
        this.loadDashboard();
    }
  }

  loadDashboard() {
    const nextMatch = this.getNextMatch();
    const recentResults = this.getRecentResults();
    const teamStats = this.getTeamStats();
    
    // Extract venue type to avoid nested ternary
    const getVenueText = (match) => match.isHome ? 'Home' : 'Away';

    this.leftContent.innerHTML = `
      <h2>📊 Dashboard</h2>
      <div class="info-card">
        <div class="info-card-header">Next Fixture</div>
        <div class="info-card-content">
          ${nextMatch ? `
            <div class="dashboard-item">
              <span class="dashboard-label">Opponent:</span>
              <span class="dashboard-value">${nextMatch.opponent}</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Date:</span>
              <span class="dashboard-value">${new Date(nextMatch.date).toLocaleDateString()}</span>
            </div>
            <div class="dashboard-item">
              <span class="dashboard-label">Venue:</span>
              <span class="dashboard-value">${getVenueText(nextMatch)}</span>
            </div>
            <button class="btn btn-primary match-action" data-action="prepare">Prepare Team</button>
          ` : '<div>No upcoming matches</div>'}
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-card-header">Recent Results</div>
        <div class="info-card-content">
          ${recentResults.map(result => `
            <div class="dashboard-item">
              <span class="dashboard-label">vs ${result.opponent}</span>
              <span class="dashboard-value status-${result.status}">${result.score}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-card-header">Team Status</div>
        <div class="info-card-content">
          <div class="dashboard-item">
            <span class="dashboard-label"><span class="status-indicator status-${teamStats.moraleStatus}"></span>Squad Morale:</span>
            <span class="dashboard-value">${teamStats.morale}</span>
          </div>
          <div class="dashboard-item">
            <span class="dashboard-label"><span class="status-indicator status-${teamStats.injuryStatus}"></span>Injuries:</span>
            <span class="dashboard-value">${teamStats.injuries} Players</span>
          </div>
          <div class="dashboard-item">
            <span class="dashboard-label"><span class="status-indicator status-${teamStats.fitnessStatus}"></span>Fitness:</span>
            <span class="dashboard-value">${teamStats.fitness}%</span>
          </div>
        </div>
      </div>
    `;

    this.rightContent.innerHTML = `
      <h2>⚡ Quick Actions</h2>
      <div class="quick-action" data-action="team">
        🏃‍♂️ Manage Team
      </div>
      <div class="quick-action" data-action="transfers">
        💰 Transfer Market
      </div>
      <div class="quick-action" data-action="matches">
        ⚽ Match Center
      </div>
      <div class="quick-action" data-action="stats">
        📈 View Statistics
      </div>
      
      <div class="info-card">
        <div class="info-card-header">League Position</div>
        <div class="info-card-content">
          ${this.getLeaguePosition()}
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-card-header">Transfer News</div>
        <div class="info-card-content">
          ${this.getTransferNews()}
        </div>
      </div>
    `;
  }

  loadTeamManagement() {
    const userTeam = this.gameState.userTeam;
    if (!userTeam) {
      this.leftContent.innerHTML = '<div>No team selected</div>';
      return;
    }

    const players = userTeam.players || [];
    const formation = userTeam.formation || '4-4-2';
    
    // Helper function to get form icon
    const getFormIcon = (form) => {
      if (form > 80) return '🔥';
      if (form < 30) return '❄️';
      return '';
    };

    this.leftContent.innerHTML = `
      <h2>⚽ Team Management</h2>
      <div class="formation-selector">
        <h3>Formation: ${formation}</h3>
        <div class="formation-buttons">
          <button class="formation-btn ${formation === '4-4-2' ? 'active' : ''}" data-formation="4-4-2">4-4-2</button>
          <button class="formation-btn ${formation === '4-3-3' ? 'active' : ''}" data-formation="4-3-3">4-3-3</button>
          <button class="formation-btn ${formation === '3-5-2' ? 'active' : ''}" data-formation="3-5-2">3-5-2</button>
          <button class="formation-btn ${formation === '4-2-3-1' ? 'active' : ''}" data-formation="4-2-3-1">4-2-3-1</button>
        </div>
      </div>
      
      <div class="squad-list">
        <h3>Starting XI</h3>
        <div class="player-grid">
          ${players.slice(0, 11).map((player, index) => `
            <div class="player-item starting-xi" data-player-id="${player.id}">
              <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-position">${player.position}</div>
                <div class="player-rating">${this.getPlayerOverallRating(player)}</div>
                <div class="player-status">
                  ${player.injured ? '🚑' : ''}
                  ${player.fatigue > 80 ? '😴' : ''}
                  ${getFormIcon(player.form)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <h3>Substitutes</h3>
        <div class="player-grid">
          ${players.slice(11).map(player => `
            <div class="player-item substitute" data-player-id="${player.id}">
              <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-position">${player.position}</div>
                <div class="player-rating">${this.getPlayerOverallRating(player)}</div>
                <div class="player-status">
                  ${player.injured ? '🚑' : ''}
                  ${player.fatigue > 80 ? '😴' : ''}
                  ${getFormIcon(player.form)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.rightContent.innerHTML = `
      <h2>🎯 Tactics</h2>
      <div class="tactics-panel">
        <div class="tactic-option">
          <label>Mentality:</label>
          <select class="tactic-select" data-tactic="mentality">
            <option value="defensive">Defensive</option>
            <option value="balanced" selected>Balanced</option>
            <option value="attacking">Attacking</option>
          </select>
        </div>
        
        <div class="tactic-option">
          <label>Pressing:</label>
          <select class="tactic-select" data-tactic="pressing">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div class="tactic-option">
          <label>Width:</label>
          <select class="tactic-select" data-tactic="width">
            <option value="narrow">Narrow</option>
            <option value="normal" selected>Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>
        
        <div class="tactic-option">
          <label>Tempo:</label>
          <select class="tactic-select" data-tactic="tempo">
            <option value="slow">Slow</option>
            <option value="normal" selected>Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>
      
      ${this.selectedPlayer ? `
        <div class="info-card">
          <div class="info-card-header">Player Details</div>
          <div class="info-card-content">
            <div class="player-details">
              <h4>${this.selectedPlayer.name}</h4>
              <div>Position: ${this.selectedPlayer.position}</div>
              <div>Age: ${this.selectedPlayer.age}</div>
              <div>Form: ${this.selectedPlayer.form || 50}</div>
              <div>Fitness: ${this.selectedPlayer.fitness || 100}%</div>
              <div>Morale: ${this.selectedPlayer.morale || 50}</div>
            </div>
            <div class="player-actions">
              <button class="btn btn-small" onclick="ui.showPlayerProfile('${this.selectedPlayer.id}')">View Profile</button>
              <button class="btn btn-small transfer-btn" data-action="list" data-player-id="${this.selectedPlayer.id}">Transfer List</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    // Add change listeners for tactics
    this.rightContent.querySelectorAll('.tactic-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const tactic = e.target.dataset.tactic;
        const value = e.target.value;
        this.changeTactics(tactic, value);
      });
    });
  }

  loadTransferMarket() {
    if (!this.gameState.transferMarket) {
      this.leftContent.innerHTML = '<div>Transfer market not available</div>';
      return;
    }

    const availablePlayers = this.gameState.transferMarket.getAvailablePlayers({
      maxValue: 10000000 // Show players under 10M
    });

    this.leftContent.innerHTML = `
      <h2>💰 Transfer Market</h2>
      <div class="transfer-filters">
        <input type="text" id="player-search" placeholder="Search players..." />
        <select id="position-filter">
          <option value="">All Positions</option>
          <option value="GK">Goalkeepers</option>
          <option value="CB">Centre Backs</option>
          <option value="RB">Right Backs</option>
          <option value="LB">Left Backs</option>
          <option value="DM">Defensive Midfielders</option>
          <option value="CM">Central Midfielders</option>
          <option value="AM">Attacking Midfielders</option>
          <option value="RW">Right Wingers</option>
          <option value="LW">Left Wingers</option>
          <option value="ST">Strikers</option>
        </select>
        <input type="range" id="max-value" min="100000" max="50000000" step="100000" />
        <label for="max-value">Max Value: €<span id="value-display">10,000,000</span></label>
      </div>
      
      <div class="transfer-list">
        ${availablePlayers.slice(0, 20).map(item => `
          <div class="transfer-item" data-player-id="${item.player.id}">
            <div class="player-info">
              <div class="player-name">${item.player.name}</div>
              <div class="player-details">
                ${item.player.position} | ${item.player.age} years | ${item.player.nationality}
              </div>
              <div class="player-team">Currently at: ${item.currentTeam.name}</div>
            </div>
            <div class="transfer-values">
              <div class="market-value">Value: €${item.marketValue.toLocaleString()}</div>
              <div class="asking-price">Price: €${item.askingPrice.toLocaleString()}</div>
              <div class="demand-level">Demand: ${this.getDemandText(item.demand)}</div>
            </div>
            <div class="transfer-actions">
              <button class="btn btn-primary transfer-btn" data-action="bid" data-player-id="${item.player.id}">
                Make Bid
              </button>
              <button class="btn btn-secondary" onclick="ui.showPlayerProfile('${item.player.id}')">
                View Profile
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const activeTransfers = this.gameState.transferMarket.getActiveTransfers();
    this.rightContent.innerHTML = `
      <h2>📋 Active Transfers</h2>
      <div class="active-transfers">
        ${activeTransfers.length > 0 ? activeTransfers.map(transfer => `
          <div class="transfer-status-item">
            <div class="transfer-player">${transfer.player.name}</div>
            <div class="transfer-teams">${transfer.sellingTeam.name} → ${transfer.buyingTeam.name}</div>
            <div class="transfer-amount">€${transfer.bidAmount.toLocaleString()}</div>
            <div class="transfer-status status-${transfer.status}">${transfer.status.replace('_', ' ')}</div>
          </div>
        `).join('') : '<div>No active transfers</div>'}
      </div>
      
      <div class="info-card">
        <div class="info-card-header">Transfer Budget</div>
        <div class="info-card-content">
          <div class="budget-info">
            <div>Available: €${this.getTransferBudget().toLocaleString()}</div>
            <div>Wage Budget: €${this.getWageBudget().toLocaleString()}/week</div>
          </div>
        </div>
      </div>
    `;

    // Add interactive filters
    const searchInput = document.getElementById('player-search');
    const positionFilter = document.getElementById('position-filter');
    const maxValueSlider = document.getElementById('max-value');
    const valueDisplay = document.getElementById('value-display');

    [searchInput, positionFilter, maxValueSlider].forEach(element => {
      if (element) {
        element.addEventListener('input', () => this.filterTransferList());
      }
    });

    if (maxValueSlider && valueDisplay) {
      maxValueSlider.addEventListener('input', (e) => {
        valueDisplay.textContent = parseInt(e.target.value).toLocaleString();
      });
    }
  }

  // Game state integration methods
  getNextMatch() {
    if (!this.gameState.fixtures || this.gameState.fixtures.length === 0) {
      return null;
    }
    
    const nextMatch = this.gameState.fixtures.find(match => !match.played);
    if (!nextMatch) return null;

    return {
      opponent: nextMatch.awayTeam.name,
      date: nextMatch.date,
      isHome: nextMatch.homeTeam.id === this.gameState.userTeam?.id
    };
  }

  getRecentResults() {
    if (!this.gameState.matchHistory || this.gameState.matchHistory.length === 0) {
      return [];
    }

    return this.gameState.matchHistory.slice(-3).map(match => ({
      opponent: match.opponent,
      score: match.score,
      status: match.result // 'good', 'warning', 'danger'
    }));
  }

  getTeamStats() {
    const userTeam = this.gameState.userTeam;
    if (!userTeam) {
      return {
        morale: 'Unknown',
        moraleStatus: 'neutral',
        injuries: 0,
        injuryStatus: 'good',
        fitness: 100,
        fitnessStatus: 'good'
      };
    }

    const players = userTeam.players || [];
    const avgMorale = players.reduce((sum, p) => sum + (p.morale || 50), 0) / players.length;
    const injuries = players.filter(p => p.injured).length;
    const avgFitness = players.reduce((sum, p) => sum + (p.fitness || 100), 0) / players.length;

    // Helper functions to avoid nested ternaries
    const getMoraleText = (morale) => {
      if (morale > 70) return 'Excellent';
      if (morale > 50) return 'Good';
      return 'Poor';
    };

    const getMoraleStatus = (morale) => {
      if (morale > 70) return 'good';
      if (morale > 50) return 'warning';
      return 'danger';
    };

    const getInjuryStatus = (injuryCount) => {
      if (injuryCount === 0) return 'good';
      if (injuryCount < 3) return 'warning';
      return 'danger';
    };

    const getFitnessStatus = (fitness) => {
      if (fitness > 80) return 'good';
      if (fitness > 60) return 'warning';
      return 'danger';
    };

    return {
      morale: getMoraleText(avgMorale),
      moraleStatus: getMoraleStatus(avgMorale),
      injuries,
      injuryStatus: getInjuryStatus(injuries),
      fitness: Math.round(avgFitness),
      fitnessStatus: getFitnessStatus(avgFitness)
    };
  }

  getPlayerOverallRating(player) {
    if (!player.attributes) return 50;
    
    const attrs = Object.values(player.attributes);
    const avgRating = attrs.reduce((sum, attr) => sum + attr, 0) / attrs.length;
    return Math.round(avgRating);
  }

  getLeaguePosition() {
    const league = this.gameState.league;
    const userTeam = this.gameState.userTeam;
    
    if (!league || !userTeam) {
      return '<div>League data not available</div>';
    }

    const standings = league.getStandings();
    const position = standings.findIndex(team => team.id === userTeam.id) + 1;
    const teamStats = standings.find(team => team.id === userTeam.id);

    return `
      <div class="dashboard-item">
        <span class="dashboard-label">Position:</span>
        <span class="dashboard-value">${position}</span>
      </div>
      <div class="dashboard-item">
        <span class="dashboard-label">Points:</span>
        <span class="dashboard-value">${teamStats?.stats?.points || 0}</span>
      </div>
      <div class="dashboard-item">
        <span class="dashboard-label">Goal Difference:</span>
        <span class="dashboard-value">${(teamStats?.stats?.goalsFor || 0) - (teamStats?.stats?.goalsAgainst || 0)}</span>
      </div>
    `;
  }

  getTransferNews() {
    const transferHistory = this.gameState.transferMarket?.getTransferHistory() || [];
    const recentTransfers = transferHistory.slice(-3);

    if (recentTransfers.length === 0) {
      return '<div>No recent transfer activity</div>';
    }

    return recentTransfers.map(transfer => 
      `📰 ${transfer.player.name} joins ${transfer.buyingTeam.name} for €${transfer.bidAmount.toLocaleString()}`
    ).join('<br>');
  }

  // Action handlers
  executeQuickAction(action) {
    this.setSection(action);
  }

  selectPlayer(playerId) {
    const userTeam = this.gameState.userTeam;
    if (!userTeam) return;

    this.selectedPlayer = userTeam.players.find(p => p.id === playerId);
    this.updatePlayerInfo(this.selectedPlayer);
  }

  selectTeam(teamId) {
    if (this.gameState.worldSystem) {
      this.selectedTeam = this.gameState.worldSystem.allTeams.find(t => t.id === teamId);
      this.updateTeamInfo(this.selectedTeam);
    }
  }

  handleTransferAction(action, playerId) {
    switch(action) {
      case 'bid':
        this.makeBid(playerId);
        break;
      case 'list':
        this.listPlayerForTransfer(playerId);
        break;
    }
  }

  makeBid(playerId) {
    // Find player in transfer market
    const availablePlayers = this.gameState.transferMarket.getAvailablePlayers();
    const playerItem = availablePlayers.find(item => item.player.id === playerId);
    
    if (!playerItem) return;

    const bidAmount = prompt(`Enter bid amount for ${playerItem.player.name} (Asking: €${playerItem.askingPrice.toLocaleString()}):`);
    if (!bidAmount || isNaN(bidAmount)) return;

    const result = this.gameState.transferMarket.makeBid(
      this.gameState.userTeam,
      playerItem.currentTeam,
      playerItem.player,
      parseInt(bidAmount)
    );

    alert(result.success ? 'Bid submitted successfully!' : `Bid failed: ${result.reason}`);
    this.loadTransferMarket(); // Refresh the view
  }

  changeFormation(formation) {
    if (this.gameState.userTeam) {
      this.gameState.userTeam.formation = formation;
      this.loadTeamManagement(); // Refresh the view
    }
  }

  changeTactics(tactic, value) {
    if (this.gameState.userTeam) {
      if (!this.gameState.userTeam.tactics) {
        this.gameState.userTeam.tactics = {};
      }
      this.gameState.userTeam.tactics[tactic] = value;
    }
  }

  // Utility methods
  getDemandText(demand) {
    if (demand > 0.8) return 'Very High';
    if (demand > 0.6) return 'High';
    if (demand > 0.4) return 'Medium';
    if (demand > 0.2) return 'Low';
    return 'Very Low';
  }

  getTransferBudget() {
    const finances = this.gameState.transferMarket?.clubFinances?.get(this.gameState.userTeam?.id);
    return finances?.budget || 0;
  }

  getWageBudget() {
    const finances = this.gameState.transferMarket?.clubFinances?.get(this.gameState.userTeam?.id);
    if (!finances) return 0;
    
    return finances.wageLimit - finances.wages;
  }

  filterTransferList() {
    // Implementation for filtering transfer list based on search criteria
    this.loadTransferMarket();
  }

  updateUI() {
    // Refresh current section with updated data
    this.loadSectionContent(this.currentSection);
  }

  updatePlayerInfo(player) {
    // Update any displayed player information
    if (this.currentSection === 'team') {
      this.loadTeamManagement();
    }
  }

  updateTeamInfo(team) {
    // Update any displayed team information
    this.updateUI();
  }

  // Fully implemented sections
  loadMatchCenter() {
    const upcomingMatches = this.getUpcomingMatches();
    const recentMatches = this.getRecentMatches();
    
    this.leftContent.innerHTML = `
      <h2>⚽ Match Center</h2>
      
      <div class="match-center-content">
        <div class="upcoming-matches">
          <h3>Upcoming Fixtures</h3>
          ${upcomingMatches.length > 0 ? upcomingMatches.map(match => `
            <div class="match-card">
              <div class="match-header">
                <span class="match-date">${this.formatDate(match.date)}</span>
                <span class="venue-badge ${match.isHome ? 'home' : 'away'}">${match.isHome ? 'HOME' : 'AWAY'}</span>
              </div>
              <div class="match-teams">
                <div class="team ${match.isHome ? 'home-team' : 'away-team'}">
                  ${match.isHome ? this.gameState.userTeam.name : match.opponent}
                </div>
                <div class="vs">vs</div>
                <div class="team ${match.isHome ? 'away-team' : 'home-team'}">
                  ${match.isHome ? match.opponent : this.gameState.userTeam.name}
                </div>
              </div>
              <div class="match-actions">
                <button class="btn primary" onclick="window.gameUI.playMatch('${match.id}')">Play Match</button>
                <button class="btn secondary" onclick="window.gameUI.simulateMatch('${match.id}')">Simulate</button>
              </div>
            </div>
          `).join('') : '<p>No upcoming matches scheduled.</p>'}
        </div>
        
        <div class="recent-matches">
          <h3>Recent Results</h3>
          ${recentMatches.length > 0 ? recentMatches.map(match => `
            <div class="result-card ${match.result}">
              <div class="result-header">
                <span class="result-date">${this.formatDate(match.date)}</span>
                <span class="result-badge ${match.result}">${match.result.toUpperCase()}</span>
              </div>
              <div class="result-score">
                <span class="team-name">${match.homeTeam}</span>
                <span class="score">${match.homeScore} - ${match.awayScore}</span>
                <span class="team-name">${match.awayTeam}</span>
              </div>
              <button class="btn secondary small" onclick="this.viewMatchReport('${match.id}')">View Report</button>
            </div>
          `).join('') : '<p>No recent matches played.</p>'}
        </div>
      </div>
    `;
  }

  loadLeagueView() {
    const leagueTable = this.getLeagueTable();
    const topScorers = this.getTopScorers();
    const userTeamPosition = this.getUserTeamPosition();
    
    this.leftContent.innerHTML = `
      <h2>🏆 League Table</h2>
      
      <div class="league-content">
        <div class="user-team-highlight">
          <h3>Your Position</h3>
          <div class="position-card">
            <div class="position-number">${userTeamPosition.position}</div>
            <div class="position-details">
              <div class="team-name">${this.gameState.userTeam.name}</div>
              <div class="points">${userTeamPosition.points} points</div>
              <div class="record">P:${userTeamPosition.played} W:${userTeamPosition.won} D:${userTeamPosition.drawn} L:${userTeamPosition.lost}</div>
            </div>
          </div>
        </div>
        
        <div class="full-table">
          <h3>Full League Table</h3>
          <table class="league-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
                <th>Form</th>
              </tr>
            </thead>
            <tbody>
              ${leagueTable.map((team, index) => `
                <tr class="${team.id === this.gameState.userTeam.id ? 'user-team' : ''}">
                  <td>${index + 1}</td>
                  <td>${team.name}</td>
                  <td>${team.stats.played}</td>
                  <td>${team.stats.won}</td>
                  <td>${team.stats.drawn}</td>
                  <td>${team.stats.lost}</td>
                  <td>${team.stats.goalsFor}</td>
                  <td>${team.stats.goalsAgainst}</td>
                  <td>${team.stats.goalDifference}</td>
                  <td><strong>${team.stats.points}</strong></td>
                  <td class="form">${this.getTeamForm(team.id)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="top-scorers">
          <h3>Top Scorers</h3>
          <div class="scorers-list">
            ${topScorers.map((scorer, index) => `
              <div class="scorer-item">
                <span class="rank">${index + 1}</span>
                <span class="player-name">${scorer.name}</span>
                <span class="team-name">${scorer.team}</span>
                <span class="goals">${scorer.goals} goals</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  loadStatistics() {
    const teamStats = this.getTeamStatistics();
    const playerStats = this.getPlayerStatistics();
    const seasonStats = this.getSeasonStatistics();
    
    this.leftContent.innerHTML = `
      <h2>📈 Statistics</h2>
      
      <div class="stats-content">
        <div class="stats-nav">
          <button class="stats-tab active" onclick="this.switchStatsTab('team')">Team Stats</button>
          <button class="stats-tab" onclick="this.switchStatsTab('player')">Player Stats</button>
          <button class="stats-tab" onclick="this.switchStatsTab('season')">Season Progress</button>
        </div>
        
        <div class="stats-panel" id="team-stats">
          <h3>Team Performance</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${teamStats.averageGoalsFor.toFixed(1)}</div>
              <div class="stat-label">Goals per Game</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${teamStats.averageGoalsAgainst.toFixed(1)}</div>
              <div class="stat-label">Goals Conceded per Game</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${teamStats.winPercentage.toFixed(1)}%</div>
              <div class="stat-label">Win Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${teamStats.cleanSheets}</div>
              <div class="stat-label">Clean Sheets</div>
            </div>
          </div>
          
          <div class="performance-chart">
            <h4>Recent Form Trend</h4>
            <div class="form-trend">${this.generateFormTrend()}</div>
          </div>
        </div>
        
        <div class="stats-panel hidden" id="player-stats">
          <h3>Top Performers</h3>
          <div class="player-stats-categories">
            <div class="category">
              <h4>Most Goals</h4>
              ${playerStats.topScorers.map(player => `
                <div class="player-stat-item">
                  <span class="player-name">${player.name}</span>
                  <span class="stat-value">${player.goals}</span>
                </div>
              `).join('')}
            </div>
            <div class="category">
              <h4>Most Assists</h4>
              ${playerStats.topAssists.map(player => `
                <div class="player-stat-item">
                  <span class="player-name">${player.name}</span>
                  <span class="stat-value">${player.assists}</span>
                </div>
              `).join('')}
            </div>
            <div class="category">
              <h4>Best Rated</h4>
              ${playerStats.topRated.map(player => `
                <div class="player-stat-item">
                  <span class="player-name">${player.name}</span>
                  <span class="stat-value">${player.averageRating.toFixed(1)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="stats-panel hidden" id="season-stats">
          <h3>Season Progress</h3>
          <div class="season-overview">
            <div class="progress-item">
              <div class="progress-label">Matches Played</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${(seasonStats.matchesPlayed / seasonStats.totalMatches) * 100}%"></div>
              </div>
              <div class="progress-text">${seasonStats.matchesPlayed}/${seasonStats.totalMatches}</div>
            </div>
            <div class="season-targets">
              <h4>Season Objectives</h4>
              ${seasonStats.objectives.map(obj => `
                <div class="objective ${obj.status}">
                  <span class="objective-text">${obj.description}</span>
                  <span class="objective-status">${obj.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  loadClubManagement() {
    const clubInfo = this.getClubInformation();
    const finances = this.getClubFinances();
    const facilities = this.getClubFacilities();
    
    this.leftContent.innerHTML = `
      <h2>🏟️ Club Management</h2>
      
      <div class="club-content">
        <div class="club-info">
          <h3>Club Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Founded:</label>
              <span>${clubInfo.founded}</span>
            </div>
            <div class="info-item">
              <label>Stadium:</label>
              <span>${clubInfo.stadium.name} (${clubInfo.stadium.capacity.toLocaleString()})</span>
            </div>
            <div class="info-item">
              <label>Manager:</label>
              <span>${clubInfo.manager.name}</span>
            </div>
            <div class="info-item">
              <label>Contract Until:</label>
              <span>${clubInfo.manager.contractUntil}</span>
            </div>
          </div>
        </div>
        
        <div class="finances">
          <h3>Financial Overview</h3>
          <div class="finance-grid">
            <div class="finance-card">
              <div class="finance-value">${finances.transferBudget.toLocaleString()}</div>
              <div class="finance-label">Transfer Budget</div>
            </div>
            <div class="finance-card">
              <div class="finance-value">${finances.wageBudget.toLocaleString()}</div>
              <div class="finance-label">Weekly Wages</div>
            </div>
            <div class="finance-card">
              <div class="finance-value">${finances.revenue.toLocaleString()}</div>
              <div class="finance-label">Annual Revenue</div>
            </div>
            <div class="finance-card">
              <div class="finance-value">${finances.profit.toLocaleString()}</div>
              <div class="finance-label">Annual Profit</div>
            </div>
          </div>
        </div>
        
        <div class="facilities">
          <h3>Club Facilities</h3>
          <div class="facility-list">
            ${facilities.map(facility => `
              <div class="facility-item">
                <div class="facility-info">
                  <span class="facility-name">${facility.name}</span>
                  <span class="facility-level">Level ${facility.level}/5</span>
                </div>
                <div class="facility-upgrade">
                  ${facility.level < 5 ? `
                    <button class="btn secondary" onclick="this.upgradeFacility('${facility.id}')">
                      Upgrade (£${facility.upgradeCost.toLocaleString()})
                    </button>
                  ` : '<span class="max-level">Max Level</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="board-expectations">
          <h3>Board Expectations</h3>
          <div class="expectations-list">
            ${clubInfo.boardExpectations.map(expectation => `
              <div class="expectation-item ${expectation.status}">
                <span class="expectation-text">${expectation.description}</span>
                <span class="expectation-progress">${expectation.progress}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  loadWorldView() {
    const worldData = this.getWorldData();
    const otherLeagues = this.getOtherLeagues();
    const transferTargets = this.getGlobalTransferTargets();
    
    this.leftContent.innerHTML = `
      <h2>🌍 World Football</h2>
      
      <div class="world-content">
        <div class="world-map">
          <h3>Global Leagues</h3>
          <div class="leagues-grid">
            ${otherLeagues.map(league => `
              <div class="league-card" onclick="this.viewLeague('${league.id}')">
                <div class="league-flag">${league.flag}</div>
                <div class="league-info">
                  <div class="league-name">${league.name}</div>
                  <div class="league-country">${league.country}</div>
                  <div class="league-level">Division ${league.level}</div>
                </div>
                <div class="league-stats">
                  <div class="stat-item">
                    <span class="label">Teams:</span>
                    <span class="value">${league.teams}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Avg Rating:</span>
                    <span class="value">${league.averageRating}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="international-players">
          <h3>International Transfer Targets</h3>
          <div class="players-list">
            ${transferTargets.map(player => `
              <div class="international-player">
                <div class="player-basic">
                  <span class="player-name">${player.name}</span>
                  <span class="player-position">${player.position}</span>
                  <span class="player-age">${player.age}</span>
                </div>
                <div class="player-club">
                  <span class="club-name">${player.club}</span>
                  <span class="league-name">${player.league}</span>
                </div>
                <div class="player-value">
                  <span class="value">£${player.value.toLocaleString()}</span>
                  <button class="btn secondary small" onclick="this.addToShortlist('${player.id}')">Shortlist</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="world-news">
          <h3>International Football News</h3>
          <div class="news-feed">
            ${worldData.news.map(article => `
              <div class="news-item">
                <div class="news-header">
                  <span class="news-date">${this.formatDate(article.date)}</span>
                  <span class="news-category">${article.category}</span>
                </div>
                <div class="news-title">${article.title}</div>
                <div class="news-summary">${article.summary}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  showPlayerProfile(playerId) {
    // Use existing player profile function
    const player = this.findPlayerById(playerId);
    if (player && window.showPlayerProfile) {
      window.showPlayerProfile(player);
    }
  }

  // Helper methods for new implementations
  getUpcomingMatches() {
    if (!this.gameState.fixtures) return [];
    
    return this.gameState.fixtures
      .filter(fixture => !fixture.played && fixture.date >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
      .map(fixture => ({
        id: fixture.id,
        date: fixture.date,
        opponent: fixture.homeTeam.id === this.gameState.userTeam.id ? fixture.awayTeam.name : fixture.homeTeam.name,
        isHome: fixture.homeTeam.id === this.gameState.userTeam.id,
        competition: fixture.competition || 'League'
      }));
  }

  getRecentMatches() {
    if (!this.gameState.matchHistory) return [];
    
    return this.gameState.matchHistory
      .filter(match => match.played)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(match => {
        const isUserHome = match.homeTeam.id === this.gameState.userTeam.id;
        const userScore = isUserHome ? match.homeScore : match.awayScore;
        const opponentScore = isUserHome ? match.awayScore : match.homeScore;
        
        let result = 'draw';
        if (userScore > opponentScore) result = 'win';
        else if (userScore < opponentScore) result = 'loss';
        
        return {
          id: match.id,
          date: match.date,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          result: result
        };
      });
  }

  getLeagueTable() {
    if (!this.gameState.league?.teams) return [];
    
    return [...this.gameState.league.teams]
      .sort((a, b) => {
        if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
        if (b.stats.goalDifference !== a.stats.goalDifference) return b.stats.goalDifference - a.stats.goalDifference;
        return b.stats.goalsFor - a.stats.goalsFor;
      });
  }

  getTopScorers() {
    const allPlayers = [];
    
    if (this.gameState.league?.teams) {
      this.gameState.league.teams.forEach(team => {
        if (team.players) {
          team.players.forEach(player => {
            if (player.stats && player.stats.goals > 0) {
              allPlayers.push({
                name: player.name,
                team: team.name,
                goals: player.stats.goals,
                assists: player.stats.assists || 0
              });
            }
          });
        }
      });
    }
    
    const sortedPlayers = allPlayers.toSorted((a, b) => b.goals - a.goals);
    return sortedPlayers.slice(0, 10);
  }

  getUserTeamPosition() {
    const table = this.getLeagueTable();
    const userTeamIndex = table.findIndex(team => team.id === this.gameState.userTeam.id);
    
    if (userTeamIndex === -1) {
      return {
        position: 1,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0
      };
    }
    
    const userTeam = table[userTeamIndex];
    return {
      position: userTeamIndex + 1,
      points: userTeam.stats.points,
      played: userTeam.stats.played,
      won: userTeam.stats.won,
      drawn: userTeam.stats.drawn,
      lost: userTeam.stats.lost
    };
  }

  getTeamForm(teamId) {
    // Get last 5 results for the team
    if (!this.gameState.matchHistory) return 'NNNNN';
    
    const teamMatches = this.gameState.matchHistory
      .filter(match => match.homeTeam.id === teamId || match.awayTeam.id === teamId)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-5);
    
    return teamMatches.map(match => {
      const isHome = match.homeTeam.id === teamId;
      const teamScore = isHome ? match.homeScore : match.awayScore;
      const opponentScore = isHome ? match.awayScore : match.homeScore;
      
      if (teamScore > opponentScore) return 'W';
      if (teamScore < opponentScore) return 'L';
      return 'D';
    }).join('');
  }

  getTeamStatistics() {
    const userTeam = this.gameState.userTeam;
    if (!userTeam?.stats) {
      return {
        averageGoalsFor: 0,
        averageGoalsAgainst: 0,
        winPercentage: 0,
        cleanSheets: 0
      };
    }
    
    const played = userTeam.stats.played || 1;
    return {
      averageGoalsFor: (userTeam.stats.goalsFor || 0) / played,
      averageGoalsAgainst: (userTeam.stats.goalsAgainst || 0) / played,
      winPercentage: ((userTeam.stats.won || 0) / played) * 100,
      cleanSheets: userTeam.stats.cleanSheets || 0
    };
  }

  getPlayerStatistics() {
    const userTeam = this.gameState.userTeam;
    if (!userTeam?.players) {
      return {
        topScorers: [],
        topAssists: [],
        topRated: []
      };
    }
    
    const players = userTeam.players.filter(p => p.stats);
    
    return {
      topScorers: players
        .sort((a, b) => (b.stats.goals || 0) - (a.stats.goals || 0))
        .slice(0, 5)
        .map(p => ({ name: p.name, goals: p.stats.goals || 0 })),
      topAssists: players
        .sort((a, b) => (b.stats.assists || 0) - (a.stats.assists || 0))
        .slice(0, 5)
        .map(p => ({ name: p.name, assists: p.stats.assists || 0 })),
      topRated: players
        .filter(p => p.stats.averageRating)
        .sort((a, b) => b.stats.averageRating - a.stats.averageRating)
        .slice(0, 5)
        .map(p => ({ name: p.name, averageRating: p.stats.averageRating }))
    };
  }

  getSeasonStatistics() {
    const totalMatches = this.gameState.fixtures ? this.gameState.fixtures.length : 38;
    const matchesPlayed = this.gameState.matchHistory ? this.gameState.matchHistory.length : 0;
    
    return {
      matchesPlayed: matchesPlayed,
      totalMatches: totalMatches,
      objectives: [
        {
          description: 'Avoid Relegation',
          status: this.getUserTeamPosition().position <= 17 ? 'on-track' : 'behind',
          progress: `${this.getUserTeamPosition().position}/20`
        },
        {
          description: 'Qualify for Europe',
          status: this.getUserTeamPosition().position <= 7 ? 'on-track' : 'behind',
          progress: `${this.getUserTeamPosition().position}/7`
        },
        {
          description: 'Win the League',
          status: this.getUserTeamPosition().position === 1 ? 'on-track' : 'behind',
          progress: `${this.getUserTeamPosition().position}/1`
        }
      ]
    };
  }

  generateFormTrend() {
    const recentMatches = this.getRecentMatches();
    return recentMatches.map(match => {
      return `<span class="form-result ${match.result}">${match.result.charAt(0).toUpperCase()}</span>`;
    }).join('');
  }

  getClubInformation() {
    const userTeam = this.gameState.userTeam;
    return {
      founded: userTeam.founded || 1900,
      stadium: {
        name: userTeam.stadium || `${userTeam.name} Stadium`,
        capacity: userTeam.stadiumCapacity || 50000
      },
      manager: {
        name: 'You',
        contractUntil: new Date(this.gameState.currentDate.getFullYear() + 2, 5, 30).toLocaleDateString()
      },
      boardExpectations: [
        {
          description: 'Maintain League Position',
          status: 'on-track',
          progress: '75%'
        },
        {
          description: 'Develop Youth Players',
          status: 'excellent',
          progress: '90%'
        },
        {
          description: 'Financial Stability',
          status: 'good',
          progress: '80%'
        }
      ]
    };
  }

  getClubFinances() {
    const transferMarket = this.gameState.transferMarket;
    const userTeamId = this.gameState.userTeam.id;
    const finances = transferMarket?.clubFinances?.get(userTeamId);
    
    return {
      transferBudget: finances?.transferBudget || 50000000,
      wageBudget: finances?.wageLimit || 200000,
      revenue: 150000000,
      profit: 25000000
    };
  }

  getClubFacilities() {
    return [
      {
        id: 'training_ground',
        name: 'Training Ground',
        level: 3,
        upgradeCost: 5000000
      },
      {
        id: 'youth_academy',
        name: 'Youth Academy',
        level: 2,
        upgradeCost: 8000000
      },
      {
        id: 'medical_center',
        name: 'Medical Center',
        level: 4,
        upgradeCost: 3000000
      },
      {
        id: 'scouting_network',
        name: 'Scouting Network',
        level: 3,
        upgradeCost: 4000000
      }
    ];
  }

  getWorldData() {
    return {
      news: [
        {
          date: new Date(),
          category: 'Transfer',
          title: 'Major Transfer Completed in La Liga',
          summary: 'A high-profile transfer has been completed between two Spanish giants.'
        },
        {
          date: new Date(Date.now() - 86400000),
          category: 'League',
          title: 'Premier League Title Race Heats Up',
          summary: 'The race for the Premier League title is getting more competitive.'
        },
        {
          date: new Date(Date.now() - 172800000),
          category: 'International',
          title: 'World Cup Qualifiers Update',
          summary: 'Several nations secure their spots in the upcoming World Cup.'
        }
      ]
    };
  }

  getOtherLeagues() {
    return [
      {
        id: 'la_liga',
        name: 'La Liga',
        country: 'Spain',
        flag: '🇪🇸',
        level: 1,
        teams: 20,
        averageRating: 85
      },
      {
        id: 'serie_a',
        name: 'Serie A',
        country: 'Italy',
        flag: '🇮🇹',
        level: 1,
        teams: 20,
        averageRating: 83
      },
      {
        id: 'bundesliga',
        name: 'Bundesliga',
        country: 'Germany',
        flag: '🇩🇪',
        level: 1,
        teams: 18,
        averageRating: 84
      },
      {
        id: 'ligue1',
        name: 'Ligue 1',
        country: 'France',
        flag: '🇫🇷',
        level: 1,
        teams: 20,
        averageRating: 80
      }
    ];
  }

  getGlobalTransferTargets() {
    // Generate realistic transfer targets from other leagues
    const targets = [];
    const positions = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
    
    for (let i = 0; i < 20; i++) {
      targets.push({
        id: `international_${i}`,
        name: this.generatePlayerName(),
        position: positions[Math.floor(Math.random() * positions.length)],
        age: Math.floor(Math.random() * 10) + 20,
        club: this.generateClubName(),
        league: 'La Liga',
        value: Math.floor(Math.random() * 50000000) + 10000000
      });
    }
    
    return targets.sort((a, b) => b.value - a.value);
  }

  generatePlayerName() {
    const firstNames = ['Marco', 'Luis', 'Diego', 'Carlos', 'Antonio', 'Miguel', 'Rafael', 'Fernando', 'Pablo', 'Sergio'];
    const lastNames = ['Rodriguez', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Cruz', 'Flores'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  generateClubName() {
    const clubs = ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Valencia', 'Sevilla', 'Athletic Bilbao', 'Real Sociedad', 'Villarreal', 'Betis', 'Espanyol'];
    return clubs[Math.floor(Math.random() * clubs.length)];
  }

  formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  switchStatsTab(tabName, clickedElement = null) {
    // Hide all panels
    const panels = document.querySelectorAll('.stats-panel');
    panels.forEach(panel => panel.classList.add('hidden'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.stats-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected panel and activate tab
    const selectedPanel = document.getElementById(`${tabName}-stats`);
    if (selectedPanel) {
      selectedPanel.classList.remove('hidden');
    }
    
    // Find the correct tab element to activate
    const selectedTab = clickedElement || document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
  }

  viewMatchReport(matchId) {
    // Implementation for viewing detailed match reports
    console.log('Viewing match report for:', matchId);
    // This would open a detailed match report modal
  }

  viewLeague(leagueId) {
    console.log('Viewing league:', leagueId);
    // This would show detailed league information
  }

  addToShortlist(playerId) {
    console.log('Adding player to shortlist:', playerId);
    // Add player to transfer shortlist
  }

  upgradeFacility(facilityId) {
    console.log('Upgrading facility:', facilityId);
    // Handle facility upgrade logic
  }

  findPlayerById(playerId) {
    if (this.gameState.worldSystem) {
      for (const team of this.gameState.worldSystem.allTeams) {
        const player = team.players.find(p => p.id === playerId);
        if (player) return player;
      }
    }
    return null;
  }
}

// Initialize UI when game state is available
let ui = null;

export function initializeUI(gameState) {
  ui = new InteractiveUI(gameState);
  
  // Make UI globally accessible
  window.ui = ui;
  window.setSection = (section) => ui.setSection(section);
  
  return ui;
}

export { InteractiveUI };
