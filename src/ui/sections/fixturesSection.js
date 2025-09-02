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
            ${this.canPlayMatch(fixture) ? `
              <button class="play-match-btn primary-btn" data-fixture-id="${fixture.id}">
                Play Match
              </button>
            ` : ''}
            ${this.canSimulateMatch(fixture) ? `
              <button class="simulate-btn secondary-btn" data-fixture-id="${fixture.id}">
                Simulate
              </button>
            ` : ''}
            ${(!this.canPlayMatch(fixture) && !this.canSimulateMatch(fixture)) ? `
              <div class="match-pending">
                <span>⏰ Match not ready</span>
              </div>
            ` : ''}
          </div>
          
          <div class="fixture-info">
            <div class="opponent-form">
              ${this.renderOpponentForm(opponent)}
            </div>
          </div>
        </div>
      `;
    } else {
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
    // Get last 5 results for opponent - simplified
    const form = ['W', 'D', 'L', 'W', 'L']; // Mock data
    
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
      // Could open detailed match report modal
      console.log('📊 View match report for:', fixtureId);
      // TODO: Implement match report modal
    } catch (error) {
      console.error('❌ Error viewing match report:', error);
    }
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
