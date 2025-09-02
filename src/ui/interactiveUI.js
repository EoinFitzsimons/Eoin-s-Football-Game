/**
 * Enhanced Interactive UI System - Connected to Game State
 * Provides full interactivity with real game data integration
 */

import { GameState } from '../game.js';

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
    const userTeam = this.gameState.userTeam;
    const nextMatch = this.getNextMatch();
    const recentResults = this.getRecentResults();
    const teamStats = this.getTeamStats();

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
              <span class="dashboard-value">${nextMatch.isHome ? 'Home' : 'Away'}</span>
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
                  ${player.form > 80 ? '🔥' : player.form < 30 ? '❄️' : ''}
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
                  ${player.form > 80 ? '🔥' : player.form < 30 ? '❄️' : ''}
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

    return {
      morale: avgMorale > 70 ? 'Excellent' : avgMorale > 50 ? 'Good' : 'Poor',
      moraleStatus: avgMorale > 70 ? 'good' : avgMorale > 50 ? 'warning' : 'danger',
      injuries,
      injuryStatus: injuries === 0 ? 'good' : injuries < 3 ? 'warning' : 'danger',
      fitness: Math.round(avgFitness),
      fitnessStatus: avgFitness > 80 ? 'good' : avgFitness > 60 ? 'warning' : 'danger'
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

  // Stub methods for sections not yet implemented
  loadMatchCenter() {
    this.leftContent.innerHTML = '<h2>⚽ Match Center</h2><div>Coming soon...</div>';
  }

  loadLeagueView() {
    this.leftContent.innerHTML = '<h2>🏆 League</h2><div>Coming soon...</div>';
  }

  loadStatistics() {
    this.leftContent.innerHTML = '<h2>📈 Statistics</h2><div>Coming soon...</div>';
  }

  loadClubManagement() {
    this.leftContent.innerHTML = '<h2>🏟️ Club Management</h2><div>Coming soon...</div>';
  }

  loadWorldView() {
    this.leftContent.innerHTML = '<h2>🌍 World View</h2><div>Coming soon...</div>';
  }

  showPlayerProfile(playerId) {
    // Use existing player profile function
    const player = this.findPlayerById(playerId);
    if (player && window.showPlayerProfile) {
      window.showPlayerProfile(player);
    }
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
