/**
 * LeagueSection - League table and statistics
 */

import { BaseSection } from './baseSection.js';

export class LeagueSection extends BaseSection {
  getTitle() {
    return 'League Table';
  }

  render(container) {
    const leagueSection = document.createElement('div');
    leagueSection.className = 'league-section';
    
    leagueSection.innerHTML = `
      <div class="league-header">
        <h1>${this.gameState.league?.name || 'League'}</h1>
        <div class="league-info">
          <span class="season">Season ${this.gameState.currentSeason}</span>
          <span class="matchday">Matchday ${this.getCurrentMatchday()}</span>
        </div>
      </div>
      
      <div class="league-content">
        <div class="league-main">
          <div class="league-table-container">
            <h2>League Table</h2>
            <div class="table-wrapper">
              ${this.renderLeagueTable()}
            </div>
          </div>
          
          <div class="league-stats">
            <h2>League Statistics</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Top Scorers</h3>
                ${this.renderTopScorers()}
              </div>
              
              <div class="stat-card">
                <h3>Top Assists</h3>
                ${this.renderTopAssists()}
              </div>
            </div>
          </div>
        </div>
        
        <div class="league-sidebar">
          <div class="user-team-position">
            ${this.renderUserTeamPosition()}
          </div>
          
          <div class="form-guide">
            ${this.renderFormGuide()}
          </div>
          
          <div class="upcoming-fixtures">
            ${this.renderUpcomingFixtures()}
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(leagueSection);
  }

  renderLeagueTable() {
    const standings = this.getLeagueStandings();
    
    if (standings.length === 0) {
      return `
        <div class="no-data">
          <p>League table not available</p>
        </div>
      `;
    }

    return `
      <table class="league-table">
        <thead>
          <tr>
            <th class="pos">Pos</th>
            <th class="team">Team</th>
            <th class="played">P</th>
            <th class="won">W</th>
            <th class="drawn">D</th>
            <th class="lost">L</th>
            <th class="gf">GF</th>
            <th class="ga">GA</th>
            <th class="gd">GD</th>
            <th class="points">Pts</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((team, index) => this.renderTableRow(team, index + 1, standings.length)).join('')}
        </tbody>
      </table>
    `;
  }

  renderTableRow(team, position, totalTeams) {
    const isUserTeam = team.id === this.gameState.userTeam?.id;
    const stats = team.stats || this.getDefaultStats();
    const goalDifference = stats.goalsFor - stats.goalsAgainst;
    
    // Determine position class for styling (promotion, relegation, etc.)
    let positionClass = '';
    if (position <= 3) positionClass = 'promotion';
    else if (position <= 6) positionClass = 'european';
    else if (position >= totalTeams - 2) positionClass = 'relegation';
    
    return `
      <tr class="table-row ${isUserTeam ? 'user-team' : ''} ${positionClass}">
        <td class="pos">
          <span class="position-number">${position}</span>
          ${this.getPositionIndicator(position)}
        </td>
        <td class="team">
          <div class="team-info">
            <span class="team-badge">${team.badge || '⚽'}</span>
            <span class="team-name">${team.name}</span>
          </div>
        </td>
        <td class="played">${stats.played}</td>
        <td class="won">${stats.won}</td>
        <td class="drawn">${stats.drawn}</td>
        <td class="lost">${stats.lost}</td>
        <td class="gf">${stats.goalsFor}</td>
        <td class="ga">${stats.goalsAgainst}</td>
        <td class="gd ${goalDifference >= 0 ? 'positive' : 'negative'}">
          ${goalDifference >= 0 ? '+' : ''}${goalDifference}
        </td>
        <td class="points">
          <strong>${stats.points}</strong>
        </td>
      </tr>
    `;
  }

  renderTopScorers() {
    const topScorers = this.getTopScorers();
    
    if (topScorers.length === 0) {
      return '<p class="no-data">No scoring data available</p>';
    }

    return `
      <div class="scorers-list">
        ${topScorers.slice(0, 10).map((player, index) => `
          <div class="scorer-item">
            <span class="rank">${index + 1}</span>
            <div class="player-info">
              <span class="player-name">${player.name}</span>
              <span class="player-team">${this.getPlayerTeamName(player)}</span>
            </div>
            <span class="goals">${player.goals || 0}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderTopAssists() {
    const topAssists = this.getTopAssists();
    
    if (topAssists.length === 0) {
      return '<p class="no-data">No assists data available</p>';
    }

    return `
      <div class="assists-list">
        ${topAssists.slice(0, 10).map((player, index) => `
          <div class="assist-item">
            <span class="rank">${index + 1}</span>
            <div class="player-info">
              <span class="player-name">${player.name}</span>
              <span class="player-team">${this.getPlayerTeamName(player)}</span>
            </div>
            <span class="assists">${player.assists || 0}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderUserTeamPosition() {
    const userTeam = this.gameState.userTeam;
    if (!userTeam) return '<p>No team selected</p>';

    const position = this.getUserTeamPosition();
    const stats = userTeam.stats || this.getDefaultStats();
    const lastFiveResults = this.getLastFiveResults();

    return `
      <div class="info-card">
        <h3>${userTeam.name}</h3>
        <div class="team-position">
          <div class="position-display">
            <span class="position-number">${position}</span>
            <span class="position-suffix">${this.getOrdinalSuffix(position)}</span>
            <span class="position-label">Position</span>
          </div>
          <div class="points-display">
            <span class="points-number">${stats.points}</span>
            <span class="points-label">Points</span>
          </div>
        </div>
        
        <div class="team-record">
          <div class="record-item">
            <span class="record-label">Played:</span>
            <span class="record-value">${stats.played}</span>
          </div>
          <div class="record-item">
            <span class="record-label">Won:</span>
            <span class="record-value">${stats.won}</span>
          </div>
          <div class="record-item">
            <span class="record-label">Drawn:</span>
            <span class="record-value">${stats.drawn}</span>
          </div>
          <div class="record-item">
            <span class="record-label">Lost:</span>
            <span class="record-value">${stats.lost}</span>
          </div>
        </div>
        
        <div class="recent-form">
          <h4>Recent Form</h4>
          <div class="form-display">
            ${lastFiveResults.map(result => `
              <span class="form-result ${result.toLowerCase()}">${result}</span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderFormGuide() {
    const formTable = this.getFormTable();

    return `
      <div class="info-card">
        <h3>Form Guide (Last 5 Games)</h3>
        <div class="form-table">
          ${formTable.map(team => `
            <div class="form-row ${team.id === this.gameState.userTeam?.id ? 'user-team' : ''}">
              <span class="team-name">${team.name}</span>
              <div class="team-form">
                ${team.form.map(result => `
                  <span class="form-result ${result.toLowerCase()}">${result}</span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderUpcomingFixtures() {
    const upcomingFixtures = this.getUpcomingLeagueFixtures();

    if (upcomingFixtures.length === 0) {
      return `
        <div class="info-card">
          <h3>Upcoming Fixtures</h3>
          <p>No upcoming fixtures</p>
        </div>
      `;
    }

    return `
      <div class="info-card">
        <h3>Next Fixtures</h3>
        <div class="fixtures-list">
          ${upcomingFixtures.slice(0, 5).map(fixture => `
            <div class="fixture-item">
              <div class="fixture-teams">
                <span class="home-team ${fixture.homeTeam.id === this.gameState.userTeam?.id ? 'user-team' : ''}">
                  ${fixture.homeTeam.name}
                </span>
                <span class="vs">v</span>
                <span class="away-team ${fixture.awayTeam.id === this.gameState.userTeam?.id ? 'user-team' : ''}">
                  ${fixture.awayTeam.name}
                </span>
              </div>
              <div class="fixture-date">
                ${this.formatDate(fixture.date)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Helper methods
  getLeagueStandings() {
    return this.gameState.league?.getStandings?.() || [];
  }

  getCurrentMatchday() {
    // Calculate current matchday based on fixtures played
    const totalFixtures = this.gameState.fixtures?.length || 0;
    const playedFixtures = this.gameState.matchHistory?.length || 0;
    const teamsCount = this.gameState.league?.teams?.length || 20;
    
    if (totalFixtures === 0) return 1;
    
    const fixturesPerMatchday = teamsCount / 2;
    return Math.floor(playedFixtures / fixturesPerMatchday) + 1;
  }

  getTopScorers() {
    return this.gameState.league?.getTopScorers?.() || [];
  }

  getTopAssists() {
    return this.gameState.league?.getTopAssists?.() || [];
  }

  getUserTeamPosition() {
    if (!this.gameState.league?.getPosition) return 1;
    return this.gameState.league.getPosition(this.gameState.userTeam);
  }

  getDefaultStats() {
    return {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    };
  }

  getPositionIndicator(position) {
    // Return indicator for special positions (promotion, relegation, etc.)
    if (position <= 3) return '<span class="indicator promotion">↑</span>';
    if (position <= 6) return '<span class="indicator european">●</span>';
    if (position >= 18) return '<span class="indicator relegation">↓</span>';
    return '';
  }

  getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
  }

  getPlayerTeamName(player) {
    // Find which team the player belongs to
    const teams = this.gameState.league?.teams || [];
    for (const team of teams) {
      if (team.players?.find(p => p.id === player.id)) {
        return team.name;
      }
    }
    return 'Unknown';
  }

  getLastFiveResults() {
    // Get last 5 results for user's team - simplified mock
    return ['W', 'L', 'D', 'W', 'W'];
  }

  getFormTable() {
    // Get form guide for all teams - simplified mock
    const teams = this.gameState.league?.teams || [];
    return teams.slice(0, 10).map(team => ({
      id: team.id,
      name: team.name,
      form: ['W', 'L', 'D', 'W', 'L']
    }));
  }

  getUpcomingLeagueFixtures() {
    // Get upcoming fixtures involving league teams
    return (this.gameState.fixtures || [])
      .filter(f => !f.played)
      .slice(0, 10);
  }
}
