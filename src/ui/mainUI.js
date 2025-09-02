/**
 * Main UI Controller - Connects legacy UI with new interactive system
 * Bridges the existing UI structure with the enhanced game state
 */

import { gameState } from '../game.js';

class MainUIController {
  constructor() {
    this.gameState = null;
    this.interactiveUI = null;
    this.currentSection = 'home';
    
    this.initializeNavigation();
    this.waitForGameState();
  }

  waitForGameState() {
    // Wait for game to initialize
    const checkGameState = () => {
      if (window.gameState && window.gameState.ui) {
        this.gameState = window.gameState;
        this.interactiveUI = window.gameState.ui;
        this.connectInteractiveUI();
        console.log('🔗 Main UI connected to game state');
      } else {
        setTimeout(checkGameState, 100);
      }
    };
    checkGameState();
  }

  initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        this.showSection(section);
        
        // Update active nav button
        navButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Set initial section
    this.showSection('home');
    document.querySelector('.nav-btn[data-section="home"]').classList.add('active');
  }

  connectInteractiveUI() {
    if (!this.interactiveUI) return;

    // Set up event callbacks from game state to UI
    this.gameState.eventCallbacks = {
      uiUpdate: () => this.refreshCurrentSection(),
      playerUpdate: (player) => this.handlePlayerUpdate(player),
      teamUpdate: (team) => this.handleTeamUpdate(team),
      transferUpdate: (transfer) => this.handleTransferUpdate(transfer),
      transferCompleted: (transfer) => this.handleTransferCompleted(transfer),
      transferWindowOpened: (window) => this.handleTransferWindowOpened(window),
      transferWindowClosed: (window) => this.handleTransferWindowClosed(window),
      matchUpdate: (event, minute, score) => this.handleMatchUpdate(event, minute, score),
      matchCompleted: (result) => this.handleMatchCompleted(result)
    };

    console.log('🎯 UI event callbacks connected to game state');
  }

  showSection(section) {
    this.currentSection = section;
    const leftSidebar = document.getElementById('sidebar-left-content');
    const rightSidebar = document.getElementById('sidebar-right-content');
    const centerContent = document.getElementById('center-content');

    // Clear existing content
    leftSidebar.innerHTML = '';
    rightSidebar.innerHTML = '';

    switch (section) {
      case 'home':
        this.showHomeSection(centerContent, leftSidebar, rightSidebar);
        break;
      case 'team':
        this.showTeamSection(centerContent, leftSidebar, rightSidebar);
        break;
      case 'club':
        this.showClubSection(centerContent, leftSidebar, rightSidebar);
        break;
      case 'board':
        this.showBoardSection(centerContent, leftSidebar, rightSidebar);
        break;
      case 'stats':
        this.showStatsSection(centerContent, leftSidebar, rightSidebar);
        break;
      case 'world':
        this.showWorldSection(centerContent, leftSidebar, rightSidebar);
        break;
    }
  }

  showHomeSection(center, left, right) {
    // Main dashboard
    center.innerHTML = `
      <h1>Football Manager Dashboard</h1>
      <canvas id="pitch"></canvas>
      <div id="game-controls" class="home-controls">
        <button id="next-match-btn" class="primary-btn">Next Match</button>
        <button id="advance-time-btn" class="secondary-btn">Advance Time</button>
        <button id="save-game-btn" class="secondary-btn">Save Game</button>
      </div>
    `;

    // Left sidebar - Team overview
    if (this.gameState && this.gameState.userTeam) {
      const team = this.gameState.userTeam;
      left.innerHTML = `
        <div class="sidebar-section">
          <h3>${team.name}</h3>
          <div class="team-overview">
            <div class="stat-line">
              <span>League Position:</span>
              <span>${this.gameState.league?.getPosition?.(team) || 'N/A'}</span>
            </div>
            <div class="stat-line">
              <span>Squad Size:</span>
              <span>${team.players?.length || 0}</span>
            </div>
            <div class="stat-line">
              <span>Transfer Budget:</span>
              <span>€${this.formatMoney(this.gameState.transferMarket?.getTransferBudget?.(team) || 0)}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Right sidebar - Recent news/events
    right.innerHTML = `
      <div class="sidebar-section">
        <h3>Recent Events</h3>
        <div id="recent-events">
          <div class="event-item">Game initialized</div>
        </div>
      </div>
    `;

    this.setupHomeControls();
  }

  setupHomeControls() {
    const nextMatchBtn = document.getElementById('next-match-btn');
    const advanceTimeBtn = document.getElementById('advance-time-btn');
    const saveGameBtn = document.getElementById('save-game-btn');

    if (nextMatchBtn) {
      nextMatchBtn.addEventListener('click', () => {
        if (this.gameState && this.gameState.fixtures) {
          const nextFixture = this.gameState.fixtures.find(f => !f.played);
          if (nextFixture) {
            this.playMatch(nextFixture);
          } else {
            alert('No more fixtures this season!');
          }
        }
      });
    }

    if (advanceTimeBtn) {
      advanceTimeBtn.addEventListener('click', () => {
        if (this.gameState) {
          this.gameState.advanceTime(7); // Advance one week
          this.refreshCurrentSection();
        }
      });
    }

    if (saveGameBtn) {
      saveGameBtn.addEventListener('click', () => {
        if (this.gameState) {
          this.gameState.save();
          alert('Game saved successfully!');
        }
      });
    }
  }

  showTeamSection(center, left, right) {
    if (!this.gameState || !this.gameState.userTeam) {
      center.innerHTML = '<h2>Team section - Game not loaded</h2>';
      return;
    }

    const team = this.gameState.userTeam;
    
    center.innerHTML = `
      <h2>${team.name} - Squad Management</h2>
      <div id="team-management-interface"></div>
    `;

    // Use interactive UI for team management
    if (this.interactiveUI) {
      const teamInterface = document.getElementById('team-management-interface');
      if (teamInterface) {
        this.interactiveUI.showTeamManagement(teamInterface);
      }
    }

    // Left sidebar - Squad list
    this.showSquadList(left, team);
    
    // Right sidebar - Team tactics
    this.showTacticsPanel(right, team);
  }

  showSquadList(container, team) {
    const players = team.players || [];
    
    container.innerHTML = `
      <div class="sidebar-section">
        <h3>Squad (${players.length})</h3>
        <div class="squad-list">
          ${players.map(player => `
            <div class="player-item" data-player-id="${player.id}">
              <div class="player-name">${player.name}</div>
              <div class="player-position">${player.position}</div>
              <div class="player-rating">${player.getOverallRating?.() || 'N/A'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add click handlers for player details
    container.querySelectorAll('.player-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const playerId = e.currentTarget.dataset.playerId;
        const player = players.find(p => p.id === playerId);
        if (player) {
          this.showPlayerDetails(player);
        }
      });
    });
  }

  showTacticsPanel(container, team) {
    if (!this.interactiveUI) {
      container.innerHTML = '<div>Tactics panel loading...</div>';
      return;
    }

    container.innerHTML = `
      <div class="sidebar-section">
        <h3>Tactics</h3>
        <div id="tactics-controls"></div>
      </div>
    `;

    const tacticsContainer = container.querySelector('#tactics-controls');
    if (tacticsContainer) {
      this.interactiveUI.showTacticsSelector(tacticsContainer);
    }
  }

  showClubSection(center, left, right) {
    center.innerHTML = '<h2>Club Management</h2>';
    
    if (this.gameState && this.interactiveUI) {
      // Transfer market interface
      center.innerHTML += '<div id="transfer-interface"></div>';
      const transferInterface = document.getElementById('transfer-interface');
      this.interactiveUI.showTransferMarket(transferInterface);
    }

    // Left sidebar - Club finances
    if (this.gameState && this.gameState.userTeam) {
      left.innerHTML = `
        <div class="sidebar-section">
          <h3>Club Finances</h3>
          <div class="finance-overview">
            <div class="stat-line">
              <span>Transfer Budget:</span>
              <span>€${this.formatMoney(this.gameState.transferMarket?.getTransferBudget?.(this.gameState.userTeam) || 0)}</span>
            </div>
            <div class="stat-line">
              <span>Wage Budget:</span>
              <span>€${this.formatMoney(this.gameState.userTeam.calculateWageBill?.() || 0)}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Right sidebar - Transfer activity
    right.innerHTML = `
      <div class="sidebar-section">
        <h3>Transfer Activity</h3>
        <div id="transfer-activity"></div>
      </div>
    `;
  }

  showBoardSection(center, left, right) {
    center.innerHTML = `
      <h2>Board Expectations</h2>
      <div class="board-content">
        <div class="expectation-item">
          <h3>League Position Target</h3>
          <p>Finish in top half of the table</p>
        </div>
        <div class="expectation-item">
          <h3>Financial Target</h3>
          <p>Stay within transfer budget</p>
        </div>
        <div class="expectation-item">
          <h3>Youth Development</h3>
          <p>Promote young players to first team</p>
        </div>
      </div>
    `;
  }

  showStatsSection(center, left, right) {
    center.innerHTML = '<h2>Statistics</h2>';
    
    if (this.gameState && this.interactiveUI) {
      center.innerHTML += '<div id="stats-interface"></div>';
      const statsInterface = document.getElementById('stats-interface');
      this.interactiveUI.showStatistics(statsInterface);
    }
  }

  showWorldSection(center, left, right) {
    center.innerHTML = '<h2>World Football</h2>';
    
    if (this.gameState && this.gameState.worldSystem) {
      const worldSystem = this.gameState.worldSystem;
      
      center.innerHTML += `
        <div class="world-overview">
          <h3>Countries: ${worldSystem.countries.length}</h3>
          <div id="world-countries"></div>
        </div>
      `;

      const countriesContainer = document.getElementById('world-countries');
      countriesContainer.innerHTML = worldSystem.countries.map(country => `
        <div class="country-item">
          <h4>${country.name}</h4>
          <div class="leagues-list">
            ${country.leagues.map(league => `
              <div class="league-item">
                ${league.name} (Tier ${league.tier})
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  }

  playMatch(fixture) {
    if (!this.gameState) return;

    const result = this.gameState.startMatch(fixture.id, true);
    
    if (result) {
      result.then(matchResult => {
        this.gameState.completeMatch(matchResult);
        alert(`Match completed: ${matchResult.homeTeam.name} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeam.name}`);
        this.refreshCurrentSection();
      });
    }
  }

  showPlayerDetails(player) {
    // Show player details in a modal or dedicated section
    const modal = document.createElement('div');
    modal.className = 'player-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>${player.name}</h2>
        <div class="player-details">
          <p><strong>Position:</strong> ${player.position}</p>
          <p><strong>Age:</strong> ${player.age}</p>
          <p><strong>Overall:</strong> ${player.getOverallRating?.() || 'N/A'}</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  refreshCurrentSection() {
    this.showSection(this.currentSection);
  }

  formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Event handlers
  handlePlayerUpdate(player) {
    console.log(`Player updated: ${player.name}`);
    if (this.currentSection === 'team') {
      this.refreshCurrentSection();
    }
  }

  handleTeamUpdate(team) {
    console.log(`Team updated: ${team.name}`);
    this.refreshCurrentSection();
  }

  handleTransferUpdate(transfer) {
    console.log('Transfer update:', transfer);
    this.addRecentEvent(`Transfer: ${transfer.player?.name} to ${transfer.buyingClub?.name}`);
  }

  handleTransferCompleted(transfer) {
    console.log('Transfer completed:', transfer);
    this.addRecentEvent(`✅ Transfer completed: ${transfer.player?.name} to ${transfer.buyingClub?.name} for €${this.formatMoney(transfer.fee)}`);
    
    if (this.currentSection === 'club' || this.currentSection === 'team') {
      this.refreshCurrentSection();
    }
  }

  handleTransferWindowOpened(window) {
    this.addRecentEvent(`📈 ${window.type} transfer window opened`);
  }

  handleTransferWindowClosed(window) {
    this.addRecentEvent(`📉 ${window.type} transfer window closed`);
  }

  handleMatchUpdate(event, minute, score) {
    // Update live match display if visible
    const eventsContainer = document.getElementById('recent-events');
    if (eventsContainer && event) {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event-item';
      eventDiv.textContent = `${minute}': ${event.description}`;
      eventsContainer.insertBefore(eventDiv, eventsContainer.firstChild);
    }
  }

  handleMatchCompleted(result) {
    this.addRecentEvent(`⚽ ${result.homeTeam.name} ${result.homeScore}-${result.awayScore} ${result.awayTeam.name}`);
    
    if (this.currentSection === 'home') {
      this.refreshCurrentSection();
    }
  }

  addRecentEvent(eventText) {
    const eventsContainer = document.getElementById('recent-events');
    if (eventsContainer) {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event-item';
      eventDiv.textContent = eventText;
      eventsContainer.insertBefore(eventDiv, eventsContainer.firstChild);
      
      // Keep only recent 10 events
      const events = eventsContainer.querySelectorAll('.event-item');
      if (events.length > 10) {
        eventsContainer.removeChild(events[events.length - 1]);
      }
    }
  }
}

// Initialize main UI controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Initializing Main UI Controller...');
  new MainUIController();
});

export { MainUIController };
