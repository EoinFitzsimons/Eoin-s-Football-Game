/**
 * StatsSection - Player and team statistics overview
 */

import { BaseSection } from './baseSection.js';

export class StatsSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.currentView = 'team';
    this.selectedStat = 'goals';
  }

  getTitle() {
    return 'Statistics';
  }

  render(container) {
    const statsSection = document.createElement('div');
    statsSection.className = 'stats-section';
    
    statsSection.innerHTML = `
      <div class="stats-header">
        <h1>Statistics</h1>
        <div class="stats-nav">
          <button class="stats-nav-btn ${this.currentView === 'team' ? 'active' : ''}" 
                  data-view="team">Team Stats</button>
          <button class="stats-nav-btn ${this.currentView === 'players' ? 'active' : ''}" 
                  data-view="players">Player Stats</button>
          <button class="stats-nav-btn ${this.currentView === 'league' ? 'active' : ''}" 
                  data-view="league">League Stats</button>
          <button class="stats-nav-btn ${this.currentView === 'season' ? 'active' : ''}" 
                  data-view="season">Season Progress</button>
        </div>
      </div>
      
      <div class="stats-content" id="stats-view-content">
        ${this.renderCurrentView()}
      </div>
    `;

    container.appendChild(statsSection);
    this.setupEventListeners();
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'team':
        return this.renderTeamStatsView();
      case 'players':
        return this.renderPlayerStatsView();
      case 'league':
        return this.renderLeagueStatsView();
      case 'season':
        return this.renderSeasonProgressView();
      default:
        return this.renderTeamStatsView();
    }
  }

  renderTeamStatsView() {
    const team = this.gameState.userTeam;
    if (!team) {
      return '<div class="no-data">No team selected</div>';
    }

    const teamStats = team.stats || {};
    const players = team.players || [];
    
    // Calculate team averages
    const avgAge = players.length > 0 ? 
      Math.round(players.reduce((sum, p) => sum + (p.age || 0), 0) / players.length) : 0;
    const avgRating = players.length > 0 ?
      Math.round(players.reduce((sum, p) => sum + (p.overallRating || p.rating || 0), 0) / players.length) : 0;
    
    return `
      <div class="team-stats-view">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>League Performance</h3>
            <div class="stat-row">
              <span class="stat-label">Matches Played:</span>
              <span class="stat-value">${teamStats.played || 0}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Wins:</span>
              <span class="stat-value win">${teamStats.won || 0}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Draws:</span>
              <span class="stat-value draw">${teamStats.drawn || 0}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Losses:</span>
              <span class="stat-value loss">${teamStats.lost || 0}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Points:</span>
              <span class="stat-value points">${teamStats.points || 0}</span>
            </div>
          </div>

          <div class="stat-card">
            <h3>Goals</h3>
            <div class="stat-row">
              <span class="stat-label">Goals For:</span>
              <span class="stat-value positive">${teamStats.goalsFor || 0}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Goals Against:</span>
              <span class="stat-value negative">${teamStats.goalsAgainst || 0}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Goal Difference:</span>
              <span class="stat-value ${(teamStats.goalsFor || 0) - (teamStats.goalsAgainst || 0) >= 0 ? 'positive' : 'negative'}">
                ${((teamStats.goalsFor || 0) - (teamStats.goalsAgainst || 0)) >= 0 ? '+' : ''}${(teamStats.goalsFor || 0) - (teamStats.goalsAgainst || 0)}
              </span>
            </div>
          </div>

          <div class="stat-card">
            <h3>Squad Overview</h3>
            <div class="stat-row">
              <span class="stat-label">Squad Size:</span>
              <span class="stat-value">${players.length}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Average Age:</span>
              <span class="stat-value">${avgAge} years</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Average Rating:</span>
              <span class="stat-value">${avgRating}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Team Value:</span>
              <span class="stat-value">${this.formatMoney(this.calculateTeamValue(players))}</span>
            </div>
          </div>

          <div class="stat-card">
            <h3>Financial</h3>
            <div class="stat-row">
              <span class="stat-label">Transfer Budget:</span>
              <span class="stat-value">${this.formatMoney(this.getTransferBudget())}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Weekly Wages:</span>
              <span class="stat-value">${this.formatMoney(this.calculateWeeklyWages(players))}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Transfers Completed:</span>
              <span class="stat-value">${this.gameState.stats?.transfersCompleted || 0}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPlayerStatsView() {
    const players = this.gameState.userTeam?.players || [];
    
    if (players.length === 0) {
      return '<div class="no-data">No players in squad</div>';
    }

    // Sort players by selected stat
    const sortedPlayers = [...players].sort((a, b) => {
      const aVal = this.getPlayerStatValue(a, this.selectedStat);
      const bVal = this.getPlayerStatValue(b, this.selectedStat);
      return bVal - aVal;
    });

    return `
      <div class="player-stats-view">
        <div class="stats-filters">
          <label for="stat-selector">Sort by:</label>
          <select id="stat-selector">
            <option value="goals" ${this.selectedStat === 'goals' ? 'selected' : ''}>Goals</option>
            <option value="assists" ${this.selectedStat === 'assists' ? 'selected' : ''}>Assists</option>
            <option value="appearances" ${this.selectedStat === 'appearances' ? 'selected' : ''}>Appearances</option>
            <option value="rating" ${this.selectedStat === 'rating' ? 'selected' : ''}>Rating</option>
            <option value="age" ${this.selectedStat === 'age' ? 'selected' : ''}>Age</option>
            <option value="value" ${this.selectedStat === 'value' ? 'selected' : ''}>Market Value</option>
          </select>
        </div>

        <div class="player-stats-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Position</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Apps</th>
                <th>Rating</th>
                <th>Age</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${sortedPlayers.map((player, index) => `
                <tr ${index < 3 ? `class="top-${index + 1}"` : ''}>
                  <td>${index + 1}</td>
                  <td class="player-name">${player.name}</td>
                  <td>${player.position}</td>
                  <td>${player.stats?.goals || 0}</td>
                  <td>${player.stats?.assists || 0}</td>
                  <td>${player.stats?.appearances || 0}</td>
                  <td>${player.overallRating || player.rating || 'N/A'}</td>
                  <td>${player.age}</td>
                  <td>${this.formatMoney(this.calculatePlayerValue(player))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderLeagueStatsView() {
    const league = this.gameState.league;
    if (!league) {
      return '<div class="no-data">No league data available</div>';
    }

    // Get league standings
    const standings = league.teams.map(team => {
      const stats = team.stats || {};
      return {
        ...team,
        stats: {
          ...stats,
          goalDifference: (stats.goalsFor || 0) - (stats.goalsAgainst || 0)
        }
      };
    }).sort((a, b) => {
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      return b.stats.goalDifference - a.stats.goalDifference;
    });

    const userTeamPosition = standings.findIndex(team => team.id === this.gameState.userTeam?.id) + 1;

    return `
      <div class="league-stats-view">
        <div class="league-overview">
          <h3>${league.name} Overview</h3>
          <div class="league-stats-grid">
            <div class="league-stat">
              <span class="stat-label">Your Position:</span>
              <span class="stat-value position-${userTeamPosition <= 3 ? 'top' : userTeamPosition >= standings.length - 3 ? 'bottom' : 'mid'}">
                ${userTeamPosition}${this.getOrdinalSuffix(userTeamPosition)}
              </span>
            </div>
            <div class="league-stat">
              <span class="stat-label">Teams:</span>
              <span class="stat-value">${standings.length}</span>
            </div>
            <div class="league-stat">
              <span class="stat-label">Matches Played:</span>
              <span class="stat-value">${standings.reduce((sum, team) => sum + (team.stats.played || 0), 0)}</span>
            </div>
          </div>
        </div>

        <div class="league-table">
          <table>
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
              </tr>
            </thead>
            <tbody>
              ${standings.map((team, index) => `
                <tr class="${team.id === this.gameState.userTeam?.id ? 'user-team' : ''}">
                  <td>${index + 1}</td>
                  <td class="team-name">${team.name}</td>
                  <td>${team.stats.played || 0}</td>
                  <td>${team.stats.won || 0}</td>
                  <td>${team.stats.drawn || 0}</td>
                  <td>${team.stats.lost || 0}</td>
                  <td>${team.stats.goalsFor || 0}</td>
                  <td>${team.stats.goalsAgainst || 0}</td>
                  <td class="${team.stats.goalDifference >= 0 ? 'positive' : 'negative'}">
                    ${team.stats.goalDifference >= 0 ? '+' : ''}${team.stats.goalDifference}
                  </td>
                  <td class="points">${team.stats.points || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderSeasonProgressView() {
    const currentDate = this.gameState.currentDate;
    const fixtures = this.gameState.fixtures || [];
    const matchHistory = this.gameState.matchHistory || [];
    
    // Calculate season progress
    const totalFixtures = fixtures.length;
    const playedFixtures = fixtures.filter(f => f.played).length;
    const progressPercent = totalFixtures > 0 ? Math.round((playedFixtures / totalFixtures) * 100) : 0;
    
    // Get recent form (last 5 matches)
    const recentMatches = matchHistory.slice(-5).reverse();

    return `
      <div class="season-progress-view">
        <div class="season-overview">
          <h3>Season ${this.gameState.currentSeason} Progress</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
            <span class="progress-text">${progressPercent}% Complete</span>
          </div>
          <div class="season-stats">
            <div class="season-stat">
              <span class="stat-label">Current Date:</span>
              <span class="stat-value">${currentDate.toLocaleDateString()}</span>
            </div>
            <div class="season-stat">
              <span class="stat-label">Matches Played:</span>
              <span class="stat-value">${playedFixtures} / ${totalFixtures}</span>
            </div>
            <div class="season-stat">
              <span class="stat-label">Matches Remaining:</span>
              <span class="stat-value">${totalFixtures - playedFixtures}</span>
            </div>
          </div>
        </div>

        <div class="recent-form">
          <h4>Recent Form (Last 5 Matches)</h4>
          <div class="form-display">
            ${recentMatches.length > 0 ? 
              recentMatches.map(match => {
                const result = this.getMatchResult(match);
                return `<span class="form-result ${result.toLowerCase()}">${result.charAt(0)}</span>`;
              }).join('') :
              '<span class="no-matches">No matches played</span>'
            }
          </div>
        </div>

        <div class="upcoming-fixtures">
          <h4>Next 5 Fixtures</h4>
          <div class="fixtures-list">
            ${fixtures.filter(f => !f.played).slice(0, 5).map(fixture => `
              <div class="fixture-item">
                <div class="fixture-teams">
                  <span class="home-team ${fixture.homeTeam.id === this.gameState.userTeam?.id ? 'user-team' : ''}">
                    ${fixture.homeTeam.name}
                  </span>
                  <span class="vs">vs</span>
                  <span class="away-team ${fixture.awayTeam.id === this.gameState.userTeam?.id ? 'user-team' : ''}">
                    ${fixture.awayTeam.name}
                  </span>
                </div>
                <div class="fixture-date">
                  ${new Date(fixture.date).toLocaleDateString()}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // View navigation
    document.querySelectorAll('.stats-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view);
      });
    });

    // Player stats sorting
    document.getElementById('stat-selector')?.addEventListener('change', (e) => {
      this.selectedStat = e.target.value;
      this.switchView('players'); // Refresh the player stats view
    });
  }

  switchView(view) {
    this.currentView = view;
    
    // Update navigation
    document.querySelectorAll('.stats-nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      }
    });

    // Update content
    const contentContainer = document.getElementById('stats-view-content');
    if (contentContainer) {
      contentContainer.innerHTML = this.renderCurrentView();
      this.setupEventListeners(); // Re-setup listeners for new content
    }
  }

  // Helper methods
  getPlayerStatValue(player, statType) {
    switch (statType) {
      case 'goals':
        return player.stats?.goals || 0;
      case 'assists':
        return player.stats?.assists || 0;
      case 'appearances':
        return player.stats?.appearances || 0;
      case 'rating':
        return player.overallRating || player.rating || 0;
      case 'age':
        return player.age || 0;
      case 'value':
        return this.calculatePlayerValue(player);
      default:
        return 0;
    }
  }

  getMatchResult(matchRecord) {
    // Determine if the match was a win, draw, or loss for the user team
    const userTeamId = this.gameState.userTeam?.id;
    const result = matchRecord.result;
    
    if (!result || !userTeamId) return 'N/A';
    
    const isHome = matchRecord.fixture?.homeTeam?.id === userTeamId;
    const homeGoals = result.homeScore || 0;
    const awayGoals = result.awayScore || 0;
    
    if (homeGoals === awayGoals) return 'Draw';
    
    const userWon = isHome ? homeGoals > awayGoals : awayGoals > homeGoals;
    return userWon ? 'Win' : 'Loss';
  }

  calculateTeamValue(players) {
    return players.reduce((total, player) => total + this.calculatePlayerValue(player), 0);
  }

  calculatePlayerValue(player) {
    const rating = player.overallRating || player.rating || 50;
    const age = player.age || 25;
    const baseValue = rating * 100000; // €100k per rating point
    
    // Age adjustment
    let ageMultiplier = 1;
    if (age < 22) ageMultiplier = 1.5; // Young talent premium
    else if (age < 28) ageMultiplier = 1.2; // Prime years
    else if (age < 32) ageMultiplier = 1.0; // Standard
    else ageMultiplier = 0.7; // Veterans

    return Math.round(baseValue * ageMultiplier);
  }

  calculateWeeklyWages(players) {
    return players.reduce((total, player) => {
      const rating = player.overallRating || player.rating || 50;
      return total + (rating * 1000); // €1k per rating point per week
    }, 0);
  }

  getTransferBudget() {
    return this.gameState.transferMarket?.getTransferBudget?.(this.gameState.userTeam) || 50000000;
  }

  getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
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
}
