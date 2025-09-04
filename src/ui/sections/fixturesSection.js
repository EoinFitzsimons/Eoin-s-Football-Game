/**
 * FixturesSection - Upcoming and past matches
 */

import { BaseSection } from './baseSection.js';

export class FixturesSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.currentView = 'upcoming';
  }

  getTitle() {
    return 'Fixtures & Results';
  }

  render(container) {
    const fixturesSection = document.createElement('div');
    fixturesSection.className = 'fixtures-section';
    
    fixturesSection.innerHTML = `
      <div class="fixtures-header">
        <h1>Fixtures & Results</h1>
        <div class="view-switcher">
          <button class="view-btn ${this.currentView === 'upcoming' ? 'active' : ''}" 
                  data-view="upcoming">Upcoming</button>
          <button class="view-btn ${this.currentView === 'results' ? 'active' : ''}" 
                  data-view="results">Results</button>
          <button class="view-btn ${this.currentView === 'calendar' ? 'active' : ''}" 
                  data-view="calendar">Calendar</button>
        </div>
      </div>
      
      <div class="fixtures-content">
        <div id="fixtures-list" class="fixtures-list">
          ${this.renderFixturesList()}
        </div>
      </div>
    `;
    
    container.appendChild(fixturesSection);
    this.setupEventListeners();
  }

  renderFixturesList() {
    switch (this.currentView) {
      case 'upcoming':
        return this.renderUpcomingFixtures();
      case 'results':
        return this.renderResults();
      case 'calendar':
        return this.renderCalendar();
      default:
        return this.renderUpcomingFixtures();
    }
  }

  renderUpcomingFixtures() {
    const upcomingFixtures = this.getUpcomingFixtures();
    
    if (upcomingFixtures.length === 0) {
      return `
        <div class="no-fixtures">
          <p>No upcoming fixtures scheduled</p>
        </div>
      `;
    }

    return `
      <div class="fixtures-grid">
        ${upcomingFixtures.map(fixture => this.renderFixtureCard(fixture, 'upcoming')).join('')}
      </div>
    `;
  }

  renderResults() {
    const results = this.getResults();
    
    if (results.length === 0) {
      return `
        <div class="no-results">
          <p>No matches played yet</p>
        </div>
      `;
    }

    return `
      <div class="results-grid">
        ${results.map(result => this.renderFixtureCard(result, 'result')).join('')}
      </div>
    `;
  }

  renderCalendar() {
    const allFixtures = this.getAllFixtures();
    const fixturesByMonth = this.groupFixturesByMonth(allFixtures);
    
    return `
      <div class="calendar-view">
        ${Object.entries(fixturesByMonth).map(([month, fixtures]) => `
          <div class="calendar-month">
            <h3 class="month-header">${month}</h3>
            <div class="month-fixtures">
              ${fixtures.map(fixture => this.renderCalendarFixture(fixture)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderFixtureCard(fixture, type) {
    const isUserHome = fixture.homeTeam.id === this.gameState.userTeam.id;
    const opponent = isUserHome ? fixture.awayTeam : fixture.homeTeam;
    const venue = isUserHome ? 'HOME' : 'AWAY';
    
    const dateStr = this.formatDate(fixture.date);
    const timeStr = this.formatTime(fixture.date);
    
    if (type === 'upcoming') {
      return this.renderUpcomingFixture(fixture, isUserHome, venue, dateStr, timeStr, opponent);
    } else {
      return this.renderCompletedFixture(fixture, isUserHome, dateStr);
    }
  }

  renderUpcomingFixture(fixture, isUserHome, venue, dateStr, timeStr, opponent) {
    return `
      <div class="fixture-card upcoming" data-fixture-id="${fixture.id}">
        <div class="fixture-header">
          <div class="fixture-date">
            <span class="date">${dateStr}</span>
            <span class="time">${timeStr}</span>
          </div>
          <div class="venue-badge ${venue.toLowerCase()}">${venue}</div>
        </div>
        
        <div class="fixture-teams">
          <div class="team home ${isUserHome ? 'user-team' : ''}">
            <div class="team-name">${fixture.homeTeam.name}</div>
            <div class="team-badge">🏟️</div>
          </div>
          
          <div class="fixture-vs">VS</div>
          
          <div class="team away ${!isUserHome ? 'user-team' : ''}">
            <div class="team-name">${fixture.awayTeam.name}</div>
            <div class="team-badge">⚽</div>
          </div>
        </div>
        
        <div class="fixture-actions">
          ${this.renderFixtureActions(fixture)}
        </div>
        
        <div class="fixture-info">
          <div class="opponent-form">
            ${this.renderOpponentForm(opponent)}
          </div>
        </div>
      </div>
    `;
  }

  renderFixtureActions(fixture) {
    const canPlay = this.canPlayMatch(fixture);
    const canSimulate = this.canSimulateMatch(fixture);
    
    if (canPlay) {
      return `<button class="play-match-btn primary-btn" data-fixture-id="${fixture.id}">Play Match</button>`;
    }
    
    if (canSimulate) {
      return `<button class="simulate-btn secondary-btn" data-fixture-id="${fixture.id}">Simulate</button>`;
    }
    
    return `<div class="match-pending"><span>⏰ Match not ready</span></div>`;
  }

  renderCompletedFixture(fixture, isUserHome, dateStr) {
    const result = fixture.result;
    const userScore = isUserHome ? result.homeScore : result.awayScore;
    const opponentScore = isUserHome ? result.awayScore : result.homeScore;
    
    let resultType;
    if (userScore > opponentScore) {
      resultType = 'win';
    } else if (userScore < opponentScore) {
      resultType = 'loss';
    } else {
      resultType = 'draw';
    }
    
    return `
      <div class="fixture-card result ${resultType}" data-fixture-id="${fixture.id}">
        <div class="result-header">
          <div class="fixture-date">
            <span class="date">${dateStr}</span>
          </div>
          <div class="result-badge ${resultType}">${resultType.charAt(0).toUpperCase()}</div>
        </div>
        
        <div class="result-teams">
          <div class="team home ${isUserHome ? 'user-team' : ''}">
            <div class="team-name">${fixture.homeTeam.name}</div>
            <div class="team-score">${result.homeScore}</div>
          </div>
          
          <div class="result-separator">-</div>
          
          <div class="team away ${!isUserHome ? 'user-team' : ''}">
            <div class="team-score">${result.awayScore}</div>
            <div class="team-name">${fixture.awayTeam.name}</div>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="view-report-btn secondary-btn" data-fixture-id="${fixture.id}">
            View Report
          </button>
        </div>
      </div>
    `;
  }

  renderCalendarFixture(fixture) {
    const isUserHome = fixture.homeTeam.id === this.gameState.userTeam.id;
    const opponent = isUserHome ? fixture.awayTeam : fixture.homeTeam;
    const venue = isUserHome ? 'H' : 'A';
    
    return `
      <div class="calendar-fixture ${fixture.played ? 'played' : 'upcoming'}" 
           data-fixture-id="${fixture.id}">
        <div class="calendar-date">${new Date(fixture.date).getDate()}</div>
        <div class="calendar-opponent">
          <span class="venue">${venue}</span>
          <span class="opponent-name">${opponent.name}</span>
        </div>
        ${fixture.played ? `
          <div class="calendar-result">
            ${this.getFixtureResult(fixture)}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderOpponentForm(opponent) {
    // Get actual last 5 results for opponent from match history
    let form = [];
    
    if (this.gameState.matchHistory && opponent.id) {
      const opponentMatches = this.gameState.matchHistory
        .filter(match => match.homeTeam.id === opponent.id || match.awayTeam.id === opponent.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-5);
      
      form = opponentMatches.map(match => {
        const isHome = match.homeTeam.id === opponent.id;
        const teamScore = isHome ? match.homeScore : match.awayScore;
        const opponentScore = isHome ? match.awayScore : match.homeScore;
        
        if (teamScore > opponentScore) return 'W';
        if (teamScore < opponentScore) return 'L';
        return 'D';
      });
    }
    
    // Fill with neutral results if not enough matches
    while (form.length < 5) {
      form.unshift('N'); // N for no result
    }
    
    return `
      <div class="form-display">
        <span class="form-label">Form:</span>
        ${form.map(result => `
          <span class="form-result ${result.toLowerCase()}">${result}</span>
        `).join('')}
      </div>
    `;
  }

  setupEventListeners() {
    console.log('🔧 Setting up fixtures event listeners...');
    
    // Store reference to document click handler for cleanup
    this.documentClickHandler = (e) => {
      if (e.target.classList.contains('play-match-btn')) {
        const fixtureId = e.target.dataset.fixtureId;
        console.log('🎯 Play match button clicked:', fixtureId);
        this.playMatch(fixtureId);
      }
      
      if (e.target.classList.contains('simulate-btn')) {
        const fixtureId = e.target.dataset.fixtureId;
        console.log('🎯 Simulate button clicked:', fixtureId);
        this.simulateMatch(fixtureId);
      }
      
      if (e.target.classList.contains('view-report-btn')) {
        const fixtureId = e.target.dataset.fixtureId;
        console.log('🎯 View report button clicked:', fixtureId);
        this.viewMatchReport(fixtureId);
      }
    };

    // View switcher
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        console.log('🎯 View switcher clicked:', view);
        this.switchView(view);
      });
    });

    // Play match buttons - use document delegation
    document.addEventListener('click', this.documentClickHandler);
    console.log('✅ Fixtures event listeners setup completed');
  }

  cleanup() {
    // Remove document event listener to prevent duplicates
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }
  }

  // Helper methods
  getUpcomingFixtures() {
    return (this.gameState.fixtures || [])
      .filter(f => !f.played)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10); // Show next 10 fixtures
  }

  getResults() {
    return (this.gameState.matchHistory || [])
      .slice(-20) // Last 20 results
      .reverse();
  }

  getAllFixtures() {
    return (this.gameState.fixtures || [])
      .concat(this.gameState.matchHistory || [])
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  groupFixturesByMonth(fixtures) {
    const groups = {};
    
    fixtures.forEach(fixture => {
      const date = new Date(fixture.date);
      const monthKey = date.toLocaleString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(fixture);
    });
    
    return groups;
  }

  formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFixtureResult(fixture) {
    if (!fixture.result) return '';
    
    const isUserHome = fixture.homeTeam.id === this.gameState.userTeam.id;
    const userScore = isUserHome ? fixture.result.homeScore : fixture.result.awayScore;
    const opponentScore = isUserHome ? fixture.result.awayScore : fixture.result.homeScore;
    
    let result;
    if (userScore > opponentScore) {
      result = 'W';
    } else if (userScore < opponentScore) {
      result = 'L';
    } else {
      result = 'D';
    }
    
    return `${result} ${userScore}-${opponentScore}`;
  }

  switchView(view) {
    this.currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      }
    });
    
    // Update content
    const listContainer = document.getElementById('fixtures-list');
    if (listContainer) {
      listContainer.innerHTML = this.renderFixturesList();
    }
  }

  playMatch(fixtureId) {
    try {
      const fixture = this.gameState.fixtures?.find(f => f.id === fixtureId);
      if (fixture && window.gameUI) {
        console.log('🏃‍♂️ Playing match:', fixture);
        window.gameUI.triggerMatch(fixture);
      } else {
        console.warn('⚠️ Fixture not found or gameUI not available:', fixtureId);
      }
    } catch (error) {
      console.error('❌ Error playing match:', error);
    }
  }

  simulateMatch(fixtureId) {
    try {
      if (this.gameState.startMatch) {
        console.log('🏃‍♂️ Simulating match:', fixtureId);
        this.gameState.startMatch(fixtureId, false); // Simulate without canvas
      } else {
        console.warn('⚠️ startMatch method not available on gameState');
      }
    } catch (error) {
      console.error('❌ Error simulating match:', error);
    }
  }

  viewMatchReport(fixtureId) {
    try {
      console.log('📊 View match report for:', fixtureId);
      
      // Find the match in history
      const match = this.gameState.matchHistory?.find(m => m.id === fixtureId);
      if (!match) {
        alert('Match report not found');
        return;
      }
      
      // Create and show match report modal
      this.showMatchReportModal(match);
    } catch (error) {
      console.error('❌ Error viewing match report:', error);
      alert('Error loading match report');
    }
  }

  showMatchReportModal(match) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'match-report-modal';
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Match Report</h2>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            ${this.renderMatchReport(match)}
          </div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Setup close functionality
    const closeBtn = modal.querySelector('.close-btn');
    const backdrop = modal.querySelector('.modal-backdrop');
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  renderMatchReport(match) {
    const isUserHome = match.homeTeam.id === this.gameState.userTeam?.id;
    const userScore = isUserHome ? match.homeScore : match.awayScore;
    const opponentScore = isUserHome ? match.awayScore : match.homeScore;
    
    let result = 'Draw';
    let resultClass = 'draw';
    if (userScore > opponentScore) {
      result = 'Win';
      resultClass = 'win';
    } else if (userScore < opponentScore) {
      result = 'Loss';
      resultClass = 'loss';
    }
    
    return `
      <div class="match-report">
        <div class="match-summary">
          <div class="match-teams">
            <div class="team home-team">
              <div class="team-name">${match.homeTeam.name}</div>
              <div class="team-score">${match.homeScore}</div>
            </div>
            <div class="vs-separator">-</div>
            <div class="team away-team">
              <div class="team-score">${match.awayScore}</div>
              <div class="team-name">${match.awayTeam.name}</div>
            </div>
          </div>
          <div class="match-result ${resultClass}">
            ${result} for ${this.gameState.userTeam?.name}
          </div>
          <div class="match-details">
            <div class="detail-item">
              <span class="label">Date:</span>
              <span class="value">${new Date(match.date).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
              <span class="label">Competition:</span>
              <span class="value">${match.competition || 'League'}</span>
            </div>
            <div class="detail-item">
              <span class="label">Attendance:</span>
              <span class="value">${match.attendance?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        ${match.events ? `
          <div class="match-events">
            <h3>Match Events</h3>
            <div class="events-timeline">
              ${match.events.map(event => `
                <div class="event-item ${event.type}">
                  <div class="event-minute">${event.minute}'</div>
                  <div class="event-description">${event.description}</div>
                  <div class="event-team">${event.team === 'home' ? match.homeTeam.name : match.awayTeam.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${match.stats ? `
          <div class="match-statistics">
            <h3>Match Statistics</h3>
            <div class="stats-comparison">
              <div class="stat-row">
                <div class="stat-label">Possession</div>
                <div class="stat-home">${match.stats.possession?.home || 50}%</div>
                <div class="stat-away">${match.stats.possession?.away || 50}%</div>
              </div>
              <div class="stat-row">
                <div class="stat-label">Shots</div>
                <div class="stat-home">${match.stats.shots?.home || 0}</div>
                <div class="stat-away">${match.stats.shots?.away || 0}</div>
              </div>
              <div class="stat-row">
                <div class="stat-label">Shots on Target</div>
                <div class="stat-home">${match.stats.shotsOnTarget?.home || 0}</div>
                <div class="stat-away">${match.stats.shotsOnTarget?.away || 0}</div>
              </div>
              <div class="stat-row">
                <div class="stat-label">Corners</div>
                <div class="stat-home">${match.stats.corners?.home || 0}</div>
                <div class="stat-away">${match.stats.corners?.away || 0}</div>
              </div>
              <div class="stat-row">
                <div class="stat-label">Fouls</div>
                <div class="stat-home">${match.stats.fouls?.home || 0}</div>
                <div class="stat-away">${match.stats.fouls?.away || 0}</div>
              </div>
            </div>
          </div>
        ` : ''}
        
        ${match.playerRatings ? `
          <div class="player-ratings">
            <h3>Player Ratings</h3>
            <div class="ratings-grid">
              <div class="team-ratings">
                <h4>${match.homeTeam.name}</h4>
                ${match.playerRatings.home?.map(player => `
                  <div class="player-rating">
                    <span class="player-name">${player.name}</span>
                    <span class="rating">${player.rating}</span>
                  </div>
                `).join('') || 'No ratings available'}
              </div>
              <div class="team-ratings">
                <h4>${match.awayTeam.name}</h4>
                ${match.playerRatings.away?.map(player => `
                  <div class="player-rating">
                    <span class="player-name">${player.name}</span>
                    <span class="rating">${player.rating}</span>
                  </div>
                `).join('') || 'No ratings available'}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Helper methods to control when matches can be played/simulated
  canPlayMatch(fixture) {
    if (fixture.played) return false;
    
    const fixtureDate = new Date(fixture.date);
    const today = new Date(this.gameState.currentDate || new Date());
    
    // Only allow matches scheduled for today
    return fixtureDate.toDateString() === today.toDateString();
  }

  canSimulateMatch(fixture) {
    // Same logic as canPlayMatch - only today's matches
    return this.canPlayMatch(fixture);
  }
}
