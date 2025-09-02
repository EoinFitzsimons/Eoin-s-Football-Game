/**
 * StatsDisplay - UI component for displaying comprehensive football statistics
 * Provides rich, desktop-focused statistical displays and reports
 */
export class StatsDisplay {
  constructor(containerId, statsIntegration) {
    this.container = document.getElementById(containerId);
    this.statsIntegration = statsIntegration;
    this.currentView = 'overview';
    this.selectedTeam = null;
    this.selectedPlayer = null;
  }

  // ===============================================================================
  // MAIN DISPLAY METHODS
  // ===============================================================================

  showTeamOverview(teamId) {
    this.selectedTeam = teamId;
    this.currentView = 'team-overview';
    
    const teamManager = this.statsIntegration.getTeamManager(teamId);
    if (!teamManager) return;
    
    const teamReport = teamManager.getTeamReport();
    const topPerformers = teamManager.getTopPerformers();
    const advancedStats = teamManager.getAdvancedStats();
    const recentForm = teamManager.getRecentForm();
    
    this.container.innerHTML = `
      <div class="stats-dashboard">
        <div class="dashboard-header">
          <h2 class="team-title">${teamReport.team.name} - Season ${teamReport.team.season}</h2>
          <div class="dashboard-nav">
            <button class="nav-tab active" data-view="overview">Overview</button>
            <button class="nav-tab" data-view="players">Players</button>
            <button class="nav-tab" data-view="advanced">Advanced</button>
            <button class="nav-tab" data-view="matches">Matches</button>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div class="stats-grid">
            <!-- Team Record Card -->
            <div class="stat-card record-card">
              <div class="card-header">
                <h3>Team Record</h3>
              </div>
              <div class="card-content">
                <div class="record-summary">
                  <div class="record-item">
                    <span class="label">Played</span>
                    <span class="value">${teamReport.record.played}</span>
                  </div>
                  <div class="record-item wins">
                    <span class="label">Won</span>
                    <span class="value">${teamReport.record.won}</span>
                  </div>
                  <div class="record-item draws">
                    <span class="label">Drawn</span>
                    <span class="value">${teamReport.record.drawn}</span>
                  </div>
                  <div class="record-item losses">
                    <span class="label">Lost</span>
                    <span class="value">${teamReport.record.lost}</span>
                  </div>
                </div>
                <div class="points-display">
                  <span class="points-value">${teamReport.record.points}</span>
                  <span class="points-label">Points</span>
                </div>
                <div class="win-rate">
                  Win Rate: <strong>${teamReport.record.winRate}%</strong>
                </div>
              </div>
            </div>
            
            <!-- Goals Card -->
            <div class="stat-card goals-card">
              <div class="card-header">
                <h3>Goals</h3>
              </div>
              <div class="card-content">
                <div class="goals-grid">
                  <div class="goals-section">
                    <div class="goals-for">
                      <span class="goals-number">${teamReport.goals.for}</span>
                      <span class="goals-label">For</span>
                      <span class="goals-average">${teamReport.goals.averageFor}/game</span>
                    </div>
                    <div class="goals-against">
                      <span class="goals-number">${teamReport.goals.against}</span>
                      <span class="goals-label">Against</span>
                      <span class="goals-average">${teamReport.goals.averageAgainst}/game</span>
                    </div>
                  </div>
                  <div class="goal-difference ${teamReport.goals.difference >= 0 ? 'positive' : 'negative'}">
                    <span class="diff-value">${teamReport.goals.difference > 0 ? '+' : ''}${teamReport.goals.difference}</span>
                    <span class="diff-label">Goal Difference</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Form Card -->
            <div class="stat-card form-card">
              <div class="card-header">
                <h3>Recent Form (Last ${recentForm.matches})</h3>
              </div>
              <div class="card-content">
                <div class="form-display">
                  <div class="form-letters">
                    ${recentForm.form.split('').map(result => 
                      `<span class="form-result ${result.toLowerCase()}">${result}</span>`
                    ).join('')}
                  </div>
                  <div class="form-stats">
                    <div class="form-points">${recentForm.points} pts</div>
                    <div class="form-average">${recentForm.averagePoints} avg</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Top Scorers -->
            <div class="stat-card scorers-card">
              <div class="card-header">
                <h3>Top Scorers</h3>
              </div>
              <div class="card-content">
                <div class="scorers-list">
                  ${topPerformers.topScorers.slice(0, 5).map((player, index) => `
                    <div class="scorer-item">
                      <span class="rank">${index + 1}</span>
                      <span class="player-name">${player.name}</span>
                      <span class="position">${player.position}</span>
                      <span class="goals">${player.goals}G</span>
                      <span class="assists">${player.assists}A</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <!-- Advanced Stats -->
            <div class="stat-card advanced-card">
              <div class="card-header">
                <h3>Key Statistics</h3>
              </div>
              <div class="card-content">
                <div class="advanced-grid">
                  <div class="advanced-stat">
                    <span class="stat-label">Shot Accuracy</span>
                    <span class="stat-value">${advancedStats.shooting.shotAccuracy}%</span>
                  </div>
                  <div class="advanced-stat">
                    <span class="stat-label">Pass Accuracy</span>
                    <span class="stat-value">${advancedStats.passing.passAccuracy}%</span>
                  </div>
                  <div class="advanced-stat">
                    <span class="stat-label">xG per Game</span>
                    <span class="stat-value">${advancedStats.shooting.xGPerGame}</span>
                  </div>
                  <div class="advanced-stat">
                    <span class="stat-label">Clean Sheets</span>
                    <span class="stat-value">${teamReport.defensive.cleanSheets}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }

  showPlayerStats(playerId, teamId) {
    this.selectedPlayer = playerId;
    this.selectedTeam = teamId;
    this.currentView = 'player-stats';
    
    const teamManager = this.statsIntegration.getTeamManager(teamId);
    const player = teamManager?.getPlayer(playerId);
    
    if (!player) return;
    
    const stats = player.getAllStats();
    const formattedStats = player.getFormattedStats();
    
    this.container.innerHTML = `
      <div class="player-stats-dashboard">
        <div class="player-header">
          <div class="player-info">
            <h2 class="player-name">${player.playerName}</h2>
            <span class="player-position">${player.position}</span>
            <span class="player-team">${teamManager.teamName}</span>
          </div>
          <div class="player-summary">
            <div class="summary-stat">
              <span class="stat-number">${stats.standard.goals}</span>
              <span class="stat-label">Goals</span>
            </div>
            <div class="summary-stat">
              <span class="stat-number">${stats.standard.assists}</span>
              <span class="stat-label">Assists</span>
            </div>
            <div class="summary-stat">
              <span class="stat-number">${stats.standard.matchesPlayed}</span>
              <span class="stat-label">Apps</span>
            </div>
            <div class="summary-stat">
              <span class="stat-number">${stats.standard.minutesPlayed}</span>
              <span class="stat-label">Mins</span>
            </div>
          </div>
        </div>
        
        <div class="player-stats-grid">
          <!-- Standard Stats -->
          <div class="stats-section">
            <h3 class="section-title">Standard Stats</h3>
            <div class="stats-table">
              ${this.renderStatsTable([
                ['Matches Played', stats.standard.matchesPlayed],
                ['Starts', stats.standard.starts],
                ['Minutes', stats.standard.minutesPlayed],
                ['Goals', stats.standard.goals],
                ['Assists', stats.standard.assists],
                ['Non-Penalty Goals', stats.standard.nonPenaltyGoals],
                ['Yellow Cards', stats.standard.yellowCards],
                ['Red Cards', stats.standard.redCards],
                ['Goals per 90', stats.standard.goalsPer90.toFixed(2)],
                ['Assists per 90', stats.standard.assistsPer90.toFixed(2)]
              ])}
            </div>
          </div>
          
          <!-- Shooting Stats -->
          <div class="stats-section">
            <h3 class="section-title">Shooting</h3>
            <div class="stats-table">
              ${this.renderStatsTable([
                ['Shots', stats.shooting.shots],
                ['Shots on Target', stats.shooting.shotsOnTarget],
                ['Shot Accuracy', `${stats.shooting.shotAccuracy.toFixed(1)}%`],
                ['Goals per Shot', stats.shooting.goalsPerShot.toFixed(3)],
                ['Expected Goals (xG)', stats.shooting.expectedGoals.toFixed(2)],
                ['Non-Penalty xG', stats.shooting.nonPenaltyXG.toFixed(2)],
                ['Big Chances', stats.shooting.bigChances],
                ['Big Chances Missed', stats.shooting.bigChancesMissed]
              ])}
            </div>
          </div>
          
          <!-- Passing Stats -->
          <div class="stats-section">
            <h3 class="section-title">Passing</h3>
            <div class="stats-table">
              ${this.renderStatsTable([
                ['Passes Attempted', stats.passing.passesAttempted],
                ['Passes Completed', stats.passing.passesCompleted],
                ['Pass Completion', `${stats.passing.passCompletion.toFixed(1)}%`],
                ['Progressive Passes', stats.passing.progressivePasses],
                ['Key Passes', stats.passing.keyPasses],
                ['Passes into Final Third', stats.passing.passesIntoFinalThird],
                ['Passes into Penalty Area', stats.passing.passesIntoPenaltyArea],
                ['Long Balls', stats.passingTypes.longBalls],
                ['Through Balls', stats.passingTypes.throughBalls]
              ])}
            </div>
          </div>
          
          <!-- Defensive Stats -->
          <div class="stats-section">
            <h3 class="section-title">Defensive</h3>
            <div class="stats-table">
              ${this.renderStatsTable([
                ['Tackles', stats.defensive.tackles],
                ['Tackles Won', stats.defensive.tacklesWon],
                ['Tackle Success', `${stats.defensive.tackleSuccess.toFixed(1)}%`],
                ['Interceptions', stats.defensive.interceptions],
                ['Blocks', stats.defensive.blocks],
                ['Clearances', stats.defensive.clearances],
                ['Pressures', stats.defensive.pressures],
                ['Pressures Successful', stats.defensive.pressuresSuccessful],
                ['Pressure Success', `${stats.defensive.pressureSuccess.toFixed(1)}%`]
              ])}
            </div>
          </div>
          
          <!-- Possession Stats -->
          <div class="stats-section">
            <h3 class="section-title">Possession</h3>
            <div class="stats-table">
              ${this.renderStatsTable([
                ['Touches', stats.possession.touches],
                ['Progressive Carries', stats.possession.progressiveCarries],
                ['Dribbles Attempted', stats.possession.dribblesAttempted],
                ['Dribbles Completed', stats.possession.dribblesCompleted],
                ['Dribble Success', `${stats.possession.dribbleSuccess.toFixed(1)}%`],
                ['Times Dispossessed', stats.possession.timesDispossessed]
              ])}
            </div>
          </div>
          
          <!-- Duels Stats -->
          <div class="stats-section">
            <h3 class="section-title">Duels</h3>
            <div class="stats-table">
              ${this.renderStatsTable([
                ['Aerial Duels Won', stats.duels.aerialDuelsWon],
                ['Aerial Duels Lost', stats.duels.aerialDuelsLost],
                ['Aerial Win %', `${stats.duels.aerialWinPercentage.toFixed(1)}%`],
                ['Ground Duels Won', stats.duels.groundDuelsWon],
                ['Ground Duels Lost', stats.duels.groundDuelsLost],
                ['Ground Duel Win %', `${stats.duels.groundDuelWinPercentage.toFixed(1)}%`],
                ['Overall Duel Win %', `${stats.duels.overallDuelWinPercentage.toFixed(1)}%`]
              ])}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showLeagueStats() {
    this.currentView = 'league-stats';
    
    const topScorers = this.statsIntegration.getLeagueTopScorers(20);
    const topAssisters = this.statsIntegration.getLeagueTopAssists(20);
    
    this.container.innerHTML = `
      <div class="league-stats-dashboard">
        <div class="dashboard-header">
          <h2>League Statistics</h2>
          <div class="dashboard-nav">
            <button class="nav-tab active" data-view="scorers">Top Scorers</button>
            <button class="nav-tab" data-view="assists">Top Assists</button>
            <button class="nav-tab" data-view="teams">Team Stats</button>
          </div>
        </div>
        
        <div class="league-content">
          <div class="league-tables">
            <!-- Top Scorers Table -->
            <div class="league-table-section">
              <h3 class="table-title">Leading Goalscorers</h3>
              <div class="data-table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Team</th>
                      <th>Pos</th>
                      <th>Goals</th>
                      <th>Assists</th>
                      <th>Apps</th>
                      <th>Goals/90</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topScorers.map((player, index) => `
                      <tr class="player-row">
                        <td class="rank">${index + 1}</td>
                        <td class="player-name">${player.name}</td>
                        <td class="team-name">${player.team}</td>
                        <td class="position">${player.position}</td>
                        <td class="goals">${player.goals}</td>
                        <td class="assists">${player.assists}</td>
                        <td class="appearances">${player.appearances}</td>
                        <td class="per90">${player.goalsPer90.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Top Assisters Table -->
            <div class="league-table-section">
              <h3 class="table-title">Leading Assist Providers</h3>
              <div class="data-table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Team</th>
                      <th>Pos</th>
                      <th>Assists</th>
                      <th>Goals</th>
                      <th>Apps</th>
                      <th>Assists/90</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topAssisters.map((player, index) => `
                      <tr class="player-row">
                        <td class="rank">${index + 1}</td>
                        <td class="player-name">${player.name}</td>
                        <td class="team-name">${player.team}</td>
                        <td class="position">${player.position}</td>
                        <td class="assists">${player.assists}</td>
                        <td class="goals">${player.goals}</td>
                        <td class="appearances">${player.appearances}</td>
                        <td class="per90">${player.assistsPer90.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ===============================================================================
  // UTILITY METHODS
  // ===============================================================================

  renderStatsTable(statsArray) {
    return `
      <div class="stats-rows">
        ${statsArray.map(([label, value]) => `
          <div class="stats-row">
            <span class="stat-label">${label}</span>
            <span class="stat-value">${value}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    // Navigation tab listeners
    const navTabs = this.container.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const view = tab.dataset.view;
        this.switchView(view);
      });
    });
    
    // Player row listeners
    const playerRows = this.container.querySelectorAll('.player-row');
    playerRows.forEach(row => {
      row.addEventListener('click', (e) => {
        // Handle player selection
        const playerName = row.querySelector('.player-name')?.textContent;
        if (playerName) {
          this.highlightPlayer(playerName);
        }
      });
    });
  }

  switchView(view) {
    // Handle view switching within the current dashboard
    console.log(`Switching to view: ${view}`);
    // Implementation would depend on the specific view
  }

  highlightPlayer(playerName) {
    // Highlight selected player in tables
    const rows = this.container.querySelectorAll('.player-row');
    rows.forEach(row => {
      row.classList.remove('highlighted');
      if (row.querySelector('.player-name')?.textContent === playerName) {
        row.classList.add('highlighted');
      }
    });
  }

  // ===============================================================================
  // EXPORT FUNCTIONALITY
  // ===============================================================================

  exportTeamReport(teamId) {
    const teamManager = this.statsIntegration.getTeamManager(teamId);
    if (!teamManager) return null;
    
    const report = {
      teamReport: teamManager.getTeamReport(),
      topPerformers: teamManager.getTopPerformers(),
      advancedStats: teamManager.getAdvancedStats(),
      recentForm: teamManager.getRecentForm(),
      fullStats: teamManager.exportStatsToJSON()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teamManager.teamName}_stats_report.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  exportLeagueStats() {
    const leagueStats = {
      topScorers: this.statsIntegration.getLeagueTopScorers(50),
      topAssisters: this.statsIntegration.getLeagueTopAssists(50),
      allTeamStats: this.statsIntegration.exportAllStats()
    };
    
    const blob = new Blob([JSON.stringify(leagueStats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `league_statistics.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}
