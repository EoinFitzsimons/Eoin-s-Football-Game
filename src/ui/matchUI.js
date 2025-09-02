/**
 * MatchUI - Full-screen immersive match experience
 */

export class MatchUI {
  constructor(gameState, fixture) {
    this.gameState = gameState;
    this.fixture = fixture;
    this.matchEngine = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentMinute = 0;
    this.score = { home: 0, away: 0 };
    this.events = [];
    this.stats = {
      shots: { home: 0, away: 0 },
      possession: { home: 50, away: 50 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 }
    };
    
    this.updateInterval = null;
  }

  render(container) {
    container.innerHTML = '';
    
    const matchContainer = document.createElement('div');
    matchContainer.className = 'match-container';
    matchContainer.setAttribute('tabindex', '0');
    
    matchContainer.innerHTML = `
      <div class="match-header">
        <button id="exit-match" class="exit-btn" aria-label="Exit Match">
          <span aria-hidden="true">×</span>
        </button>
        <h1 class="match-title">
          ${this.fixture.homeTeam.name} vs ${this.fixture.awayTeam.name}
        </h1>
      </div>
      
      <div class="match-main">
        <div class="match-scoreboard">
          <div class="team-section home-team">
            <div class="team-badge">${this.getTeamBadge(this.fixture.homeTeam)}</div>
            <div class="team-name">${this.fixture.homeTeam.name}</div>
            <div class="team-score" id="home-score">0</div>
          </div>
          
          <div class="match-status">
            <div class="match-time" id="match-time">0'</div>
            <div class="match-controls">
              <button id="play-pause-btn" class="control-btn primary-btn">
                <span class="play-icon">▶</span>
                <span class="pause-icon hidden">⏸</span>
              </button>
              <button id="skip-btn" class="control-btn secondary-btn">Skip ⏭</button>
            </div>
          </div>
          
          <div class="team-section away-team">
            <div class="team-badge">${this.getTeamBadge(this.fixture.awayTeam)}</div>
            <div class="team-name">${this.fixture.awayTeam.name}</div>
            <div class="team-score" id="away-score">0</div>
          </div>
        </div>
        
        <div class="match-content">
          <div class="match-pitch">
            <canvas id="match-canvas" width="800" height="400"></canvas>
          </div>
          
          <div class="match-sidebar">
            <div class="match-events">
              <h3>Match Events</h3>
              <div id="events-list" class="events-list"></div>
            </div>
            
            <div class="match-stats">
              <h3>Match Statistics</h3>
              <div class="stats-grid">
                <div class="stat-row">
                  <span class="stat-label">Shots</span>
                  <span class="stat-home" id="shots-home">0</span>
                  <span class="stat-away" id="shots-away">0</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Possession</span>
                  <span class="stat-home" id="possession-home">50%</span>
                  <span class="stat-away" id="possession-away">50%</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Corners</span>
                  <span class="stat-home" id="corners-home">0</span>
                  <span class="stat-away" id="corners-away">0</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Fouls</span>
                  <span class="stat-home" id="fouls-home">0</span>
                  <span class="stat-away" id="fouls-away">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="match-footer">
        <div class="formations">
          <div class="formation home-formation">
            <h4>${this.fixture.homeTeam.name} Formation</h4>
            <div class="formation-display" id="home-formation">
              ${this.renderFormation(this.fixture.homeTeam)}
            </div>
          </div>
          
          <div class="formation away-formation">
            <h4>${this.fixture.awayTeam.name} Formation</h4>
            <div class="formation-display" id="away-formation">
              ${this.renderFormation(this.fixture.awayTeam)}
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(matchContainer);
    
    this.setupEventListeners();
    this.initializeMatch();
  }

  setupEventListeners() {
    // Exit match
    document.getElementById('exit-match').addEventListener('click', () => {
      this.exitMatch();
    });
    
    // Play/Pause
    document.getElementById('play-pause-btn').addEventListener('click', () => {
      this.togglePlayPause();
    });
    
    // Skip match
    document.getElementById('skip-btn').addEventListener('click', () => {
      this.skipMatch();
    });
  }

  initializeMatch() {
    // Initialize match engine or simulation
    this.setupCanvas();
    console.log('🎮 Match initialized');
  }

  setupCanvas() {
    const canvas = document.getElementById('match-canvas');
    if (canvas && this.gameState.MatchEngine) {
      // Initialize 2D match visualization
      this.matchEngine = new this.gameState.MatchEngine(
        this.fixture.homeTeam,
        this.fixture.awayTeam,
        canvas,
        this.gameState
      );
    }
  }

  startMatch() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.isPaused = false;
    
    // Update UI
    document.querySelector('.play-icon').classList.add('hidden');
    document.querySelector('.pause-icon').classList.remove('hidden');
    
    // Start match simulation
    this.updateInterval = setInterval(() => {
      this.updateMatch();
    }, 1000); // Update every second
    
    console.log('⚽ Match started');
  }

  pauseMatch() {
    this.isPaused = true;
    
    // Update UI
    document.querySelector('.play-icon').classList.remove('hidden');
    document.querySelector('.pause-icon').classList.add('hidden');
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    console.log('⏸ Match paused');
  }

  togglePlayPause() {
    if (this.isPlaying && !this.isPaused) {
      this.pauseMatch();
    } else {
      this.startMatch();
    }
  }

  updateMatch() {
    if (!this.isPlaying || this.isPaused) return;
    
    this.currentMinute++;
    
    // Update time display
    document.getElementById('match-time').textContent = `${this.currentMinute}'`;
    
    // Simulate match events
    this.simulateMatchEvents();
    
    // Update canvas if available
    if (this.matchEngine) {
      this.matchEngine.update();
      this.matchEngine.draw();
    }
    
    // End match after 90 minutes
    if (this.currentMinute >= 90) {
      this.endMatch();
    }
  }

  simulateMatchEvents() {
    // Simple event simulation - can be enhanced with real match engine
    const eventChance = Math.random();
    
    if (eventChance < 0.02) { // 2% chance per minute
      this.generateRandomEvent();
    }
    
    // Update stats periodically
    if (this.currentMinute % 10 === 0) {
      this.updateMatchStats();
    }
  }

  generateRandomEvent() {
    const events = [
      { type: 'goal', team: Math.random() < 0.5 ? 'home' : 'away' },
      { type: 'card', team: Math.random() < 0.5 ? 'home' : 'away', cardType: 'yellow' },
      { type: 'corner', team: Math.random() < 0.5 ? 'home' : 'away' },
      { type: 'shot', team: Math.random() < 0.5 ? 'home' : 'away' }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    event.minute = this.currentMinute;
    event.player = this.getRandomPlayer(event.team);
    
    this.processEvent(event);
  }

  processEvent(event) {
    this.events.push(event);
    
    // Update score if goal
    if (event.type === 'goal') {
      this.score[event.team]++;
      document.getElementById(`${event.team}-score`).textContent = this.score[event.team];
    }
    
    // Update stats
    if (event.type === 'shot') {
      this.stats.shots[event.team]++;
    } else if (event.type === 'corner') {
      this.stats.corners[event.team]++;
    }
    
    // Add to events list
    this.addEventToUI(event);
  }

  addEventToUI(event) {
    const eventsList = document.getElementById('events-list');
    const eventElement = document.createElement('div');
    eventElement.className = `event-item ${event.type}`;
    
    const eventIcon = this.getEventIcon(event.type);
    const teamName = event.team === 'home' ? this.fixture.homeTeam.name : this.fixture.awayTeam.name;
    
    eventElement.innerHTML = `
      <span class="event-minute">${event.minute}'</span>
      <span class="event-icon">${eventIcon}</span>
      <span class="event-description">
        ${this.getEventDescription(event)} - ${event.player?.name || 'Player'} (${teamName})
      </span>
    `;
    
    eventsList.insertBefore(eventElement, eventsList.firstChild);
    
    // Limit to last 10 events
    while (eventsList.children.length > 10) {
      eventsList.removeChild(eventsList.lastChild);
    }
  }

  updateMatchStats() {
    // Update possession (simple simulation)
    const homeAdvantage = (this.score.home - this.score.away) * 5;
    this.stats.possession.home = Math.max(20, Math.min(80, 50 + homeAdvantage + (Math.random() - 0.5) * 20));
    this.stats.possession.away = 100 - this.stats.possession.home;
    
    // Update UI
    document.getElementById('shots-home').textContent = this.stats.shots.home;
    document.getElementById('shots-away').textContent = this.stats.shots.away;
    document.getElementById('possession-home').textContent = `${Math.round(this.stats.possession.home)}%`;
    document.getElementById('possession-away').textContent = `${Math.round(this.stats.possession.away)}%`;
    document.getElementById('corners-home').textContent = this.stats.corners.home;
    document.getElementById('corners-away').textContent = this.stats.corners.away;
  }

  skipMatch() {
    // Simulate entire match quickly
    this.pauseMatch();
    
    // Generate final score and events
    const finalScore = this.simulateFinalResult();
    this.score = finalScore;
    
    // Update UI
    document.getElementById('home-score').textContent = this.score.home;
    document.getElementById('away-score').textContent = this.score.away;
    document.getElementById('match-time').textContent = "90'";
    
    setTimeout(() => {
      this.endMatch();
    }, 1000);
  }

  simulateFinalResult() {
    // Simple score simulation
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    return { home: homeGoals, away: awayGoals };
  }

  endMatch() {
    this.isPlaying = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Create match result
    const result = {
      fixtureId: this.fixture.id,
      homeTeam: this.fixture.homeTeam,
      awayTeam: this.fixture.awayTeam,
      homeScore: this.score.home,
      awayScore: this.score.away,
      events: this.events,
      stats: this.stats,
      duration: this.currentMinute
    };
    
    // Trigger match completion
    if (this.gameState.eventCallbacks.matchCompleted) {
      this.gameState.eventCallbacks.matchCompleted(result);
    }
    
    console.log('🏁 Match completed:', result);
  }

  exitMatch() {
    // Confirm exit if match is in progress
    if (this.isPlaying && !this.isPaused) {
      const confirm = window.confirm('Are you sure you want to exit the match? Progress will be lost.');
      if (!confirm) return;
    }
    
    this.cleanup();
    
    // Trigger UI return to main screen
    if (this.gameState.eventCallbacks.matchExited) {
      this.gameState.eventCallbacks.matchExited();
    }
  }

  // Helper methods
  getTeamBadge(team) {
    return team.badge || '⚽';
  }

  getRandomPlayer(team) {
    const teamObj = team === 'home' ? this.fixture.homeTeam : this.fixture.awayTeam;
    const players = teamObj.players || [];
    return players[Math.floor(Math.random() * players.length)];
  }

  getEventIcon(eventType) {
    const icons = {
      goal: '⚽',
      card: '🟨',
      corner: '🚩',
      shot: '🎯',
      substitution: '🔄'
    };
    return icons[eventType] || '📝';
  }

  getEventDescription(event) {
    const descriptions = {
      goal: 'Goal',
      card: event.cardType === 'red' ? 'Red Card' : 'Yellow Card',
      corner: 'Corner Kick',
      shot: 'Shot',
      substitution: 'Substitution'
    };
    return descriptions[event.type] || 'Event';
  }

  renderFormation(team) {
    // Simple formation display
    const formation = team.formation || '4-4-2';
    const players = team.players?.slice(0, 11) || [];
    
    return `
      <div class="formation-name">${formation}</div>
      <div class="formation-players">
        ${players.slice(0, 5).map(p => `<span class="player-name">${p.name}</span>`).join('')}
      </div>
    `;
  }

  handleKeyboard(e) {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        this.togglePlayPause();
        break;
      case 'Escape':
        this.exitMatch();
        break;
      case 's':
      case 'S':
        e.preventDefault();
        this.skipMatch();
        break;
    }
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.matchEngine && this.matchEngine.cleanup) {
      this.matchEngine.cleanup();
    }
  }
}
