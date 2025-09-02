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
        <div class="current-date">${this.formatDate(this.gameState.currentDate)}</div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-main">
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
    console.log('📋 Total fixtures:', this.gameState.fixtures?.length || 0);
    
    if (this.gameState.fixtures && this.gameState.fixtures.length > 0) {
      const unplayedFixtures = this.gameState.fixtures.filter(f => !f.played);
      console.log('⚽ Unplayed fixtures:', unplayedFixtures.length);
      
      if (unplayedFixtures.length > 0) {
        console.log('🎯 Next fixture found:', unplayedFixtures[0]);
        return unplayedFixtures[0];
      }
    }
    
    console.log('⚠️ No fixtures available');
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
    // Generate some sample news items
    return [
      {
        title: `${this.gameState.userTeam?.name || 'Your team'} prepares for upcoming fixtures`,
        date: this.gameState.currentDate
      },
      {
        title: 'Transfer window activity heating up',
        date: new Date(this.gameState.currentDate.getTime() - 86400000)
      },
      {
        title: 'League standings updated',
        date: new Date(this.gameState.currentDate.getTime() - 172800000)
      }
    ];
  }

  // Action handlers
  playNextMatch() {
    try {
      const nextFixture = this.getNextFixture();
      if (nextFixture && window.gameUI) {
        console.log('🏃‍♂️ Playing next match:', nextFixture);
        window.gameUI.triggerMatch(nextFixture);
      } else {
        console.warn('⚠️ No next fixture found or gameUI not available');
      }
    } catch (error) {
      console.error('❌ Error playing next match:', error);
    }
  }

  advanceTime() {
    try {
      if (this.gameState.advanceTime) {
        console.log('⏰ Advancing time by 1 day...');
        this.gameState.advanceTime(1); // Advance one day at a time
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
}
