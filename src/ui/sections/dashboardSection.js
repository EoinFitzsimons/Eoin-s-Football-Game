/**
 * DashboardSection - Main dashboard overview
 */

import { BaseSection } from './baseSection.js';

export class DashboardSection extends BaseSection {
  getTitle() {
    return 'Dashboard';
  }

  render(container) {
    // Check if game state is properly initialized
    if (!this.gameState.userTeam) {
      const dashboard = document.createElement('div');
      dashboard.className = 'dashboard-section loading';
      dashboard.innerHTML = `
        <div class="dashboard-header">
          <h1>Eoin's Football Game Dashboard</h1>
          <div class="loading-indicator">Loading game data...</div>
        </div>
        <div class="loading-message">
          <p>Initializing your football management experience...</p>
        </div>
      `;
      container.appendChild(dashboard);
      return;
    }
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard-section';
    
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h1>Eoin's Football Game Dashboard</h1>
        <div class="header-controls">
          <div class="current-date">${this.formatDate(this.gameState.currentDate)}</div>
          <div class="time-controls">
            <button id="continue-btn" class="primary-btn continue-btn" title="Continue simulation">
              ▶️ Continue
            </button>
            <button id="pause-btn" class="secondary-btn pause-btn" title="Pause simulation" style="display: none;">
              ⏸️ Pause
            </button>
          </div>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-main">
          <div class="important-messages" id="important-messages">
            ${this.renderImportantMessages()}
          </div>
          
          <div class="next-match" id="next-match">
            ${this.renderNextMatch()}
          </div>
          
          <div class="recent-results" id="recent-results">
            ${this.renderRecentResults()}
          </div>
        </div>
        
        <div class="dashboard-sidebar">
          <div class="team-overview">
            ${this.renderTeamOverview()}
          </div>
          
          <div class="league-position">
            ${this.renderLeaguePosition()}
          </div>
          
          <div class="transfer-activity">
            ${this.renderTransferActivity()}
          </div>
          
          <div class="news-feed">
            ${this.renderNewsFeed()}
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(dashboard);
    this.setupEventListeners();
  }

  renderImportantMessages() {
    const messages = this.getImportantMessages();
    
    if (messages.length === 0) {
      return ''; // No messages, don't show the section
    }

    const messagesHtml = messages.map(message => `
      <div class="message-item ${message.type}" data-message-id="${message.id}">
        <div class="message-icon">${message.icon}</div>
        <div class="message-content">
          <div class="message-title">${message.title}</div>
          <div class="message-text">${message.text}</div>
          <div class="message-actions">
            ${message.actions.map(action => `
              <button class="message-action-btn ${action.type}" data-message-id="${message.id}" data-action="${action.action}">
                ${action.text}
              </button>
            `).join('')}
          </div>
        </div>
        <button class="message-dismiss" data-message-id="${message.id}">✕</button>
      </div>
    `).join('');

    return `
      <div class="info-card important-messages-card">
        <h3>🚨 Important</h3>
        <div class="messages-list">
          ${messagesHtml}
        </div>
      </div>
    `;
  }

  renderNextMatch() {
    const nextFixture = this.getNextFixture();
    
    if (!nextFixture) {
      return `
        <div class="info-card">
          <h3>Next Match</h3>
          <p>No upcoming matches scheduled</p>
        </div>
      `;
    }

    const isHome = nextFixture.homeTeam.id === this.gameState.userTeam.id;

    return `
      <div class="info-card next-match-card">
        <h3>Next Match</h3>
        <div class="match-info">
          <div class="match-teams">
            <div class="team ${isHome ? 'user-team' : ''}">
              <div class="team-name">${nextFixture.homeTeam.name}</div>
              <div class="team-badge">🏟️</div>
            </div>
            <div class="vs">VS</div>
            <div class="team ${!isHome ? 'user-team' : ''}">
              <div class="team-name">${nextFixture.awayTeam.name}</div>
              <div class="team-badge">⚽</div>
            </div>
          </div>
          <div class="match-details">
            <div class="match-date">${this.formatDate(nextFixture.date)}</div>
            <div class="match-venue">${isHome ? 'Home' : 'Away'}</div>
          </div>
          <button id="play-next-match" class="primary-btn match-btn">
            Play Match
          </button>
        </div>
      </div>
    `;
  }

  renderRecentResults() {
    const recentMatches = this.getRecentMatches();
    
    if (recentMatches.length === 0) {
      return `
        <div class="info-card">
          <h3>Recent Results</h3>
          <p>No matches played yet</p>
        </div>
      `;
    }

    const resultsHtml = recentMatches.map(match => {
      const userTeamScore = match.result.homeTeam.id === this.gameState.userTeam.id 
        ? match.result.homeScore 
        : match.result.awayScore;
      const opponentScore = match.result.homeTeam.id === this.gameState.userTeam.id 
        ? match.result.awayScore 
        : match.result.homeScore;
      
      const opponent = match.result.homeTeam.id === this.gameState.userTeam.id 
        ? match.result.awayTeam 
        : match.result.homeTeam;
      
      let result;
      if (userTeamScore > opponentScore) {
        result = 'W';
      } else if (userTeamScore < opponentScore) {
        result = 'L';
      } else {
        result = 'D';
      }
      
      return `
        <div class="result-item ${result.toLowerCase()}">
          <div class="result-teams">
            ${this.gameState.userTeam.name} ${userTeamScore} - ${opponentScore} ${opponent.name}
          </div>
          <div class="result-badge">${result}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="info-card">
        <h3>Recent Results</h3>
        <div class="results-list">
          ${resultsHtml}
        </div>
      </div>
    `;
  }

  renderTeamOverview() {
    const team = this.gameState.userTeam;
    
    // Handle case where team hasn't been initialized yet
    if (!team) {
      return `
        <div class="info-card">
          <h3>Team Overview</h3>
          <div class="loading-message">
            <p>Loading team data...</p>
          </div>
        </div>
      `;
    }
    
    const squadSize = team.players?.length || 0;
    const averageAge = this.calculateAverageAge(team.players);
    const teamValue = this.calculateTeamValue(team.players);

    return `
      <div class="info-card">
        <h3>${team.name}</h3>
        <div class="team-stats">
          <div class="stat-item">
            <span class="stat-label">Squad Size:</span>
            <span class="stat-value">${squadSize}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Age:</span>
            <span class="stat-value">${averageAge.toFixed(1)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Team Value:</span>
            <span class="stat-value">${this.formatMoney(teamValue)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Transfer Budget:</span>
            <span class="stat-value">${this.formatMoney(this.getTransferBudget())}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderLeaguePosition() {
    const position = this.getLeaguePosition();
    const standings = this.getLeagueStandings();
    
    return `
      <div class="info-card">
        <h3>League Position</h3>
        <div class="position-info">
          <div class="current-position">
            <span class="position-number">${position}</span>
            <span class="position-suffix">${this.getOrdinalSuffix(position)}</span>
          </div>
          <div class="league-name">${this.gameState.league?.name || 'League'}</div>
        </div>
        <div class="mini-table">
          ${standings.slice(Math.max(0, position - 3), position + 2).map((team, index) => {
            const actualPosition = Math.max(0, position - 3) + index + 1;
            const isUserTeam = team.id === this.gameState.userTeam.id;
            return `
              <div class="table-row ${isUserTeam ? 'user-team' : ''}">
                <span class="pos">${actualPosition}</span>
                <span class="team">${team.name}</span>
                <span class="pts">${team.stats?.points || 0}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderTransferActivity() {
    return `
      <div class="info-card">
        <h3>Transfer Activity</h3>
        <div class="transfer-summary">
          <div class="transfer-stat">
            <span class="stat-label">Window Status:</span>
            <span class="stat-value ${this.isTransferWindowOpen() ? 'open' : 'closed'}">
              ${this.isTransferWindowOpen() ? 'Open' : 'Closed'}
            </span>
          </div>
          <div class="transfer-stat">
            <span class="stat-label">Completed:</span>
            <span class="stat-value">${this.getCompletedTransfers()}</span>
          </div>
        </div>
        <button class="secondary-btn" onclick="window.gameUI?.showSection('transfers')">
          View Transfer Market
        </button>
      </div>
    `;
  }

  renderNewsFeed() {
    const news = this.generateNews();
    
    return `
      <div class="info-card">
        <h3>Latest News</h3>
        <div class="news-list">
          ${news.map(item => `
            <div class="news-item">
              <div class="news-title">${item.title}</div>
              <div class="news-date">${this.formatDate(item.date)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Only setup once to avoid duplicates
    if (this.eventListenersSetup) {
      console.log('🔄 Event listeners already setup, skipping...');
      return;
    }
    
    console.log('🔧 Setting up dashboard event listeners...');
    
    // Play next match
    const playMatchBtn = document.getElementById('play-next-match');
    if (playMatchBtn) {
      console.log('✅ Found play-next-match button');
      playMatchBtn.addEventListener('click', () => {
        console.log('🎯 Play next match clicked');
        this.playNextMatch();
      });
    } else {
      console.warn('⚠️ play-next-match button not found');
    }

    // Continue/Pause simulation buttons
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      console.log('✅ Found continue-btn button');
      continueBtn.addEventListener('click', () => {
        console.log('▶️ Continue simulation clicked');
        this.startContinuousSimulation();
      });
    }

    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      console.log('✅ Found pause-btn button');
      pauseBtn.addEventListener('click', () => {
        console.log('⏸️ Pause simulation clicked');
        this.pauseSimulation();
      });
    }

    // Message action buttons
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('message-action-btn')) {
        const messageId = event.target.getAttribute('data-message-id');
        const action = event.target.getAttribute('data-action');
        this.handleMessageAction(messageId, action);
      }
      
      if (event.target.classList.contains('message-dismiss')) {
        const messageId = event.target.getAttribute('data-message-id');
        this.dismissMessage(messageId);
      }
    });

    this.eventListenersSetup = true;
    console.log('✅ Dashboard event listeners setup completed');
  }

  cleanup() {
    // Reset the flag so listeners can be setup again if needed
    this.eventListenersSetup = false;
  }

  // Helper methods
  getNextFixture() {
    console.log('🔍 Looking for next fixture...');
    console.log('📋 Game state fixtures available:', !!this.gameState.fixtures);
    console.log('📋 Total fixtures:', this.gameState.fixtures?.length || 0);
    
    if (!this.gameState.fixtures || this.gameState.fixtures.length === 0) {
      console.log('⚠️ No fixtures array or empty fixtures');
      
      // Try to trigger fixture generation if user team exists
      if (this.gameState.userTeam && this.gameState.league && this.gameState.generateSeasonFixtures) {
        console.log('🔄 Attempting to regenerate fixtures...');
        this.gameState.generateSeasonFixtures();
      }
      
      return null;
    }
    
    const unplayedFixtures = this.gameState.fixtures.filter(f => !f.played);
    console.log('⚽ Unplayed fixtures:', unplayedFixtures.length);
    
    if (unplayedFixtures.length > 0) {
      // Sort by date to get the next chronological fixture
      unplayedFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));
      const nextFixture = unplayedFixtures[0];
      console.log('🎯 Next fixture found:', {
        id: nextFixture.id,
        homeTeam: nextFixture.homeTeam?.name || 'Unknown',
        awayTeam: nextFixture.awayTeam?.name || 'Unknown',
        date: nextFixture.date,
        played: nextFixture.played
      });
      return nextFixture;
    }
    
    console.log('⚠️ All fixtures have been played');
    return null;
  }

  getRecentMatches() {
    return (this.gameState.matchHistory || []).slice(-5).reverse();
  }

  calculateAverageAge(players) {
    if (!players || players.length === 0) return 0;
    const totalAge = players.reduce((sum, player) => sum + (player.age || 25), 0);
    return totalAge / players.length;
  }

  calculateTeamValue(players) {
    if (!players || players.length === 0) return 0;
    return players.reduce((sum, player) => sum + (player.marketValue || 1000000), 0);
  }

  getTransferBudget() {
    return this.gameState.transferMarket?.getTransferBudget?.(this.gameState.userTeam) || 50000000;
  }

  getLeaguePosition() {
    if (!this.gameState.league?.getPosition) return 1;
    return this.gameState.league.getPosition(this.gameState.userTeam);
  }

  getLeagueStandings() {
    if (!this.gameState.league?.getStandings) return [];
    return this.gameState.league.getStandings();
  }

  getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
  }

  isTransferWindowOpen() {
    return this.gameState.transferWindow?.isTransferWindowOpen?.() || false;
  }

  getCompletedTransfers() {
    return this.gameState.stats?.transfersCompleted || 0;
  }

  generateNews() {
    const news = [];
    const currentDate = this.gameState.currentDate || new Date();
    
    // Generate different types of news
    this.addRecentMatchNews(news);
    this.addUpcomingFixtureNews(news);
    this.addTransferNews(news, currentDate);
    this.addLeaguePositionNews(news, currentDate);
    this.addGenericNewsIfNeeded(news, currentDate);
    
    // Sort by date (newest first) and return top 5
    return news
      .toSorted((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }

  addRecentMatchNews(news) {
    if (!this.gameState.matchHistory || this.gameState.matchHistory.length === 0) {
      return;
    }

    const recentMatch = this.gameState.matchHistory[this.gameState.matchHistory.length - 1];
    const isUserTeamMatch = recentMatch.homeTeam.id === this.gameState.userTeam?.id || 
                           recentMatch.awayTeam.id === this.gameState.userTeam?.id;
    
    if (!isUserTeamMatch) {
      return;
    }

    const isHome = recentMatch.homeTeam.id === this.gameState.userTeam.id;
    const userScore = isHome ? recentMatch.homeScore : recentMatch.awayScore;
    const opponentScore = isHome ? recentMatch.awayScore : recentMatch.homeScore;
    const opponent = isHome ? recentMatch.awayTeam.name : recentMatch.homeTeam.name;
    
    const resultText = this.getMatchResultText(userScore, opponentScore, opponent);
    
    news.push({
      title: resultText + ` (${userScore}-${opponentScore})`,
      date: new Date(recentMatch.date),
      type: 'match_result'
    });
  }

  getMatchResultText(userScore, opponentScore, opponent) {
    const teamName = this.gameState.userTeam.name;
    
    if (userScore > opponentScore) {
      return `${teamName} secures victory against ${opponent}`;
    } else if (userScore < opponentScore) {
      return `${teamName} suffers defeat to ${opponent}`;
    } else {
      return `${teamName} draws with ${opponent}`;
    }
  }

  addUpcomingFixtureNews(news) {
    const nextFixture = this.getNextFixture();
    if (!nextFixture) {
      return;
    }

    const opponent = nextFixture.homeTeam.id === this.gameState.userTeam?.id ? 
                    nextFixture.awayTeam.name : nextFixture.homeTeam.name;
    const isHome = nextFixture.homeTeam.id === this.gameState.userTeam?.id;
    
    news.push({
      title: `${this.gameState.userTeam?.name} to face ${opponent} ${isHome ? 'at home' : 'away'}`,
      date: new Date(nextFixture.date),
      type: 'upcoming_match'
    });
  }

  addTransferNews(news, currentDate) {
    this.addTransferWindowStatus(news, currentDate);
    this.addRecentTransfers(news);
  }

  addTransferWindowStatus(news, currentDate) {
    const isTransferWindowOpen = this.gameState.transferWindow?.isTransferWindowOpen?.();
    if (isTransferWindowOpen) {
      news.push({
        title: 'Transfer window is currently open - time to strengthen your squad',
        date: currentDate,
        type: 'transfer_window'
      });
    }
  }

  addRecentTransfers(news) {
    if (!this.gameState.transferHistory || this.gameState.transferHistory.length === 0) {
      return;
    }

    const recentTransfers = this.gameState.transferHistory
      .filter(transfer => 
        transfer.to.id === this.gameState.userTeam?.id || 
        transfer.from.id === this.gameState.userTeam?.id
      )
      .slice(-2);
    
    recentTransfers.forEach(transfer => {
      const transferTitle = this.getTransferTitle(transfer);
      news.push({
        title: transferTitle,
        date: new Date(transfer.date),
        type: 'transfer'
      });
    });
  }

  getTransferTitle(transfer) {
    const isIncoming = transfer.to.id === this.gameState.userTeam.id;
    const action = isIncoming ? 'signs' : 'sells';
    const direction = isIncoming ? 'from' : 'to';
    const otherClub = isIncoming ? transfer.from.name : transfer.to.name;
    
    return `${this.gameState.userTeam.name} ${action} ${transfer.player.name} ${direction} ${otherClub}`;
  }

  addLeaguePositionNews(news, currentDate) {
    const position = this.getLeaguePosition();
    const teamName = this.gameState.userTeam?.name;
    
    if (position <= 4) {
      news.push({
        title: `${teamName} sits in ${position}${this.getOrdinalSuffix(position)} place - European competition within reach`,
        date: currentDate,
        type: 'league_position'
      });
    } else if (position >= 18) {
      news.push({
        title: `${teamName} in relegation battle - currently ${position}${this.getOrdinalSuffix(position)} place`,
        date: currentDate,
        type: 'league_position'
      });
    }
  }

  addGenericNewsIfNeeded(news, currentDate) {
    if (news.length < 3) {
      news.push({
        title: 'Season progressing well - keep monitoring team performance and transfers',
        date: currentDate,
        type: 'general'
      });
    }
  }

  // Action handlers
  playNextMatch() {
    console.log('🎮 Playing next match...');
    
    try {
      const nextFixture = this.getNextFixture();
      
      if (!nextFixture) {
        console.warn('⚠️ No next fixture found');
        this.showNotification('No upcoming matches available', 'warning');
        return;
      }
      
      if (!window.gameUI) {
        console.error('❌ GameUI not available on window object');
        this.showNotification('Game UI not properly initialized', 'error');
        return;
      }
      
      if (typeof window.gameUI.triggerMatch !== 'function') {
        console.error('❌ triggerMatch method not available on gameUI');
        this.showNotification('Match trigger function not available', 'error');
        return;
      }
      
      console.log('🏃‍♂️ Playing next match:', nextFixture);
      window.gameUI.triggerMatch(nextFixture);
      
    } catch (error) {
      console.error('❌ Error playing next match:', error);
      this.showNotification(`Error starting match: ${error.message}`, 'error');
    }
  }

  advanceTime(days = 1) {
    try {
      if (this.gameState.advanceTime) {
        console.log(`⏰ Advancing time by ${days} day(s)...`);
        this.gameState.advanceTime(days);
        window.gameUI?.refreshCurrentSection();
      } else {
        console.warn('⚠️ advanceTime method not available on gameState');
      }
    } catch (error) {
      console.error('❌ Error advancing time:', error);
    }
  }

  saveGame() {
    try {
      if (this.gameState.save) {
        console.log('💾 Saving game...');
        this.gameState.save();
        // Show confirmation
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Game saved successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      } else {
        console.warn('⚠️ save method not available on gameState');
      }
    } catch (error) {
      console.error('❌ Error saving game:', error);
    }
  }

  // ===============================================================================
  // CONTINUOUS SIMULATION SYSTEM
  // ===============================================================================

  startContinuousSimulation() {
    console.log('▶️ Starting continuous simulation...');
    
    // Show pause button, hide continue button
    this.toggleSimulationButtons(true);
    
    // Initialize simulation state
    this.simulationRunning = true;
    this.simulationSpeed = 1000; // 1 second = 1 day
    
    // Start the simulation loop
    this.runSimulationLoop();
  }

  pauseSimulation() {
    console.log('⏸️ Pausing simulation...');
    
    this.simulationRunning = false;
    
    // Show continue button, hide pause button
    this.toggleSimulationButtons(false);
    
    // Clear any pending timeouts
    if (this.simulationTimeout) {
      clearTimeout(this.simulationTimeout);
      this.simulationTimeout = null;
    }
  }

  runSimulationLoop() {
    if (!this.simulationRunning) {
      return;
    }

    // Check for important events that should pause the simulation
    const pauseReasons = this.checkForPauseEvents();
    
    if (pauseReasons.length > 0) {
      console.log('⏸️ Simulation paused due to:', pauseReasons);
      this.pauseSimulation();
      this.showPauseMessage(pauseReasons);
      return;
    }

    // Advance time by 1 day
    this.advanceTime(1);
    
    // Process daily events
    this.processDailyEvents();
    
    // Schedule next iteration
    this.simulationTimeout = setTimeout(() => {
      this.runSimulationLoop();
    }, this.simulationSpeed);
  }

  checkForPauseEvents() {
    const pauseReasons = [];

    // Check for upcoming matches (pause 1 day before)
    const nextMatch = this.getNextFixture();
    if (nextMatch) {
      const daysUntilMatch = this.getDaysUntil(nextMatch.date);
      if (daysUntilMatch <= 1) {
        pauseReasons.push({
          type: 'match',
          message: `Match against ${this.getOpponentName(nextMatch)} ${daysUntilMatch === 0 ? 'today' : 'tomorrow'}`
        });
      }
    }

    // Check for transfer responses
    const transferUpdates = this.checkTransferUpdates();
    if (transferUpdates.length > 0) {
      pauseReasons.push(...transferUpdates);
    }

    // Check for important messages
    const importantMessages = this.getImportantMessages();
    if (importantMessages.length > 0) {
      pauseReasons.push(...importantMessages.map(msg => ({
        type: 'message',
        message: msg.title
      })));
    }

    return pauseReasons;
  }

  processDailyEvents() {
    // Process transfer negotiations
    this.processTransferNegotiations();
    
    // Update player conditions, injuries, etc.
    this.updatePlayerConditions();
    
    // Generate news and events
    this.generateDailyEvents();
    
    // Update UI
    window.gameUI?.refreshCurrentSection();
  }

  processTransferNegotiations() {
    // Check for outgoing bid responses
    if (this.gameState.transferMarket?.processDailyTransfers) {
      const responses = this.gameState.transferMarket.processDailyTransfers();
      
      // Add responses to pending messages
      responses.forEach(response => {
        this.addImportantMessage({
          type: response.type,
          title: response.title,
          text: response.text,
          actions: response.actions
        });
      });
    }
  }

  updatePlayerConditions() {
    // Update player injuries, suspensions, morale, etc.
    if (this.gameState.userTeam?.players) {
      this.gameState.userTeam.players.forEach(player => {
        // Reduce injury days
        if (player.injuryDays > 0) {
          player.injuryDays--;
          if (player.injuryDays === 0) {
            player.injured = false;
            this.addImportantMessage({
              type: 'player-recovery',
              title: `${player.name} Recovered`,
              text: `${player.name} has recovered from injury and is available for selection.`,
              actions: [{ action: 'dismiss', text: 'OK', type: 'primary' }]
            });
          }
        }
        
        // Reduce suspension days
        if (player.suspension > 0) {
          player.suspension--;
        }
      });
    }
  }

  generateDailyEvents() {
    // Generate random events based on date and context
    const events = [];
    
    // Transfer market events
    if (this.gameState.transferWindow?.isTransferWindowOpen()) {
      events.push(...this.generateTransferEvents());
    }
    
    // League events
    events.push(...this.generateLeagueEvents());
    
    return events;
  }

  generateTransferEvents() {
    const events = [];
    
    // Random chance for AI clubs to make bids for our players
    if (Math.random() < 0.1) { // 10% chance per day
      const targetPlayer = this.selectTransferTarget();
      if (targetPlayer) {
        events.push(this.generateIncomingBid(targetPlayer));
      }
    }
    
    return events;
  }

  generateLeagueEvents() {
    // Generate league-related events
    return [];
  }

  toggleSimulationButtons(isRunning) {
    const continueBtn = document.getElementById('continue-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (continueBtn && pauseBtn) {
      continueBtn.style.display = isRunning ? 'none' : 'block';
      pauseBtn.style.display = isRunning ? 'block' : 'none';
    }
  }

  showPauseMessage(reasons) {
    const reasonText = reasons.map(r => r.message).join(', ');
    console.log(`🚨 Game paused: ${reasonText}`);
    
    // Could show a notification here
    const notification = document.createElement('div');
    notification.className = 'notification pause-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h4>⏸️ Simulation Paused</h4>
        <p>${reasonText}</p>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  // Helper methods for simulation
  getDaysUntil(date) {
    const today = new Date(this.gameState.currentDate);
    const targetDate = new Date(date);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getOpponentName(match) {
    const isHome = match.homeTeam.id === this.gameState.userTeam.id;
    return isHome ? match.awayTeam.name : match.homeTeam.name;
  }

  checkTransferUpdates() {
    // Check for pending transfer responses
    const updates = [];
    
    if (this.gameState.transferMarket?.getPendingResponses) {
      const responses = this.gameState.transferMarket.getPendingResponses();
      updates.push(...responses.map(response => ({
        type: 'transfer',
        message: response.message
      })));
    }
    
    return updates;
  }

  getImportantMessages() {
    // Get messages that require user attention
    if (!this.gameState.importantMessages) {
      this.gameState.importantMessages = [];
    }
    
    return this.gameState.importantMessages.filter(msg => !msg.dismissed);
  }

  addImportantMessage(message) {
    if (!this.gameState.importantMessages) {
      this.gameState.importantMessages = [];
    }
    
    message.id = Date.now() + Math.random();
    message.date = new Date();
    this.gameState.importantMessages.push(message);
  }

  dismissMessage(messageId) {
    if (this.gameState.importantMessages) {
      const message = this.gameState.importantMessages.find(m => m.id == messageId);
      if (message) {
        message.dismissed = true;
      }
    }
    
    // Refresh UI
    window.gameUI?.refreshCurrentSection();
  }

  handleMessageAction(messageId, action) {
    console.log(`📝 Handling message action: ${action} for message ${messageId}`);
    
    const message = this.gameState.importantMessages?.find(m => m.id == messageId);
    if (!message) return;
    
    // Handle different action types
    switch (action) {
      case 'dismiss':
        this.dismissMessage(messageId);
        break;
      case 'accept-bid':
        this.acceptTransferBid(message.transferData);
        this.dismissMessage(messageId);
        break;
      case 'reject-bid':
        this.rejectTransferBid(message.transferData);
        this.dismissMessage(messageId);
        break;
      case 'negotiate':
        // Open transfer negotiation UI
        window.gameUI?.switchToSection('transfers');
        this.dismissMessage(messageId);
        break;
      default:
        console.warn(`Unknown message action: ${action}`);
    }
  }

  acceptTransferBid(transferData) {
    console.log('✅ Accepting transfer bid:', transferData);
    // Implementation for accepting bids
  }

  rejectTransferBid(transferData) {
    console.log('❌ Rejecting transfer bid:', transferData);
    // Implementation for rejecting bids
  }

  selectTransferTarget() {
    // Select a player from user team that might receive bids
    if (!this.gameState.userTeam?.players?.length) return null;
    
    const eligiblePlayers = this.gameState.userTeam.players.filter(p => 
      p.overall > 70 && // Only good players get bids
      !p.injured &&
      p.age < 35
    );
    
    if (eligiblePlayers.length === 0) return null;
    
    return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
  }

  generateIncomingBid(player) {
    const biddingClub = this.selectBiddingClub();
    const bidAmount = this.calculateBidAmount(player);
    
    this.addImportantMessage({
      type: 'transfer-bid',
      icon: '💰',
      title: `Transfer Bid Received`,
      text: `${biddingClub.name} has made a bid of ${this.formatMoney(bidAmount)} for ${player.name}.`,
      actions: [
        { action: 'accept-bid', text: 'Accept', type: 'success' },
        { action: 'reject-bid', text: 'Reject', type: 'danger' },
        { action: 'negotiate', text: 'Negotiate', type: 'secondary' }
      ],
      transferData: { player, club: biddingClub, amount: bidAmount }
    });
  }

  selectBiddingClub() {
    // Select a random club that might make bids
    if (!this.gameState.worldSystem?.allTeams) return { name: 'Unknown Club' };
    
    const clubs = this.gameState.worldSystem.allTeams.filter(t => 
      t.id !== this.gameState.userTeam.id
    );
    
    return clubs[Math.floor(Math.random() * clubs.length)];
  }

  calculateBidAmount(player) {
    const baseValue = player.value || 1000000;
    const randomFactor = 0.8 + (Math.random() * 0.4); // 80-120% of value
    return Math.round(baseValue * randomFactor);
  }

  formatMoney(amount) {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`;
    } else {
      return `€${amount}`;
    }
  }

  showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Try to use the global notification system if available
    if (window.gameUI && typeof window.gameUI.showNotification === 'function') {
      window.gameUI.showNotification(message, type);
      return;
    }
    
    // Fallback: create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Determine background color based on notification type
    let backgroundColor;
    if (type === 'error') {
      backgroundColor = '#dc3545';
    } else if (type === 'warning') {
      backgroundColor = '#ffc107';
    } else {
      backgroundColor = '#28a745';
    }
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: ${type === 'warning' ? '#000' : '#fff'};
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }
}
