/**
 * StatsIntegration - Connects match events to comprehensive statistics tracking
 * Integrates with MatchEngine to record detailed player and team statistics
 */
import { TeamStatsManager } from './teamStatsManager.js';

export class StatsIntegration {
  constructor(gameState) {
    this.gameState = gameState;
    this.teamManagers = new Map(); // teamId -> TeamStatsManager
    this.currentMatchStats = null;
    this.realTimeStats = {
      possession: { home: 50, away: 50 },
      passes: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 }
    };
  }

  // ===============================================================================
  // INITIALIZATION
  // ===============================================================================

  initializeTeam(team) {
    if (!this.teamManagers.has(team.id)) {
      const manager = new TeamStatsManager(team.name, team.id);
      
      // Add all players to the team stats manager
      if (team.players && Array.isArray(team.players)) {
        team.players.forEach(player => {
          manager.addPlayer(player.id, player.name, player.position);
        });
      }
      
      this.teamManagers.set(team.id, manager);
      return manager;
    }
    return this.teamManagers.get(team.id);
  }

  getTeamManager(teamId) {
    return this.teamManagers.get(teamId);
  }

  // ===============================================================================
  // MATCH INTEGRATION
  // ===============================================================================

  startMatch(homeTeam, awayTeam) {
    // Initialize teams if not already done
    this.initializeTeam(homeTeam);
    this.initializeTeam(awayTeam);
    
    // Reset real-time stats
    this.realTimeStats = {
      possession: { home: 50, away: 50 },
      passes: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      cards: { home: 0, away: 0 },
      offsides: { home: 0, away: 0 }
    };
    
    this.currentMatchStats = {
      homeTeam: { id: homeTeam.id, name: homeTeam.name },
      awayTeam: { id: awayTeam.id, name: awayTeam.name },
      startTime: new Date(),
      events: [],
      playerPerformances: new Map()
    };
  }

  // ===============================================================================
  // MATCH EVENT RECORDING
  // ===============================================================================

  recordGoal(scoringTeam, scoringPlayer, minute, isPenalty = false, xGValue = 0.15) {
    const teamManager = this.getTeamManager(scoringTeam.id);
    if (teamManager) {
      teamManager.recordPlayerGoal(scoringPlayer.id, isPenalty, xGValue);
    }
    
    // Record in current match stats
    if (this.currentMatchStats) {
      this.currentMatchStats.events.push({
        type: 'goal',
        minute: minute,
        team: scoringTeam.name,
        player: scoringPlayer.name,
        isPenalty: isPenalty,
        xG: xGValue
      });
    }
  }

  recordAssist(assistingTeam, assistingPlayer, xAValue = 0.1) {
    const teamManager = this.getTeamManager(assistingTeam.id);
    if (teamManager) {
      teamManager.recordPlayerAssist(assistingPlayer.id, xAValue);
    }
  }

  recordShot(shootingTeam, shootingPlayer, minute, onTarget = false, xGValue = 0.1, fromInsideBox = true) {
    const teamManager = this.getTeamManager(shootingTeam.id);
    if (teamManager) {
      const player = teamManager.getPlayer(shootingPlayer.id);
      if (player) {
        player.recordShot(onTarget, xGValue, fromInsideBox);
      }
    }
    
    // Update real-time stats
    const teamSide = this.currentMatchStats && shootingTeam.id === this.currentMatchStats.homeTeam.id ? 'home' : 'away';
    this.realTimeStats.shots[teamSide]++;
  }

  recordPass(passingTeam, passingPlayer, options = {}) {
    const {
      completed = true,
      distance = 'short',
      isProgressive = false,
      isKey = false,
      intoFinalThird = false,
      intoPenaltyArea = false,
      underPressure = false
    } = options;
    
    const teamManager = this.getTeamManager(passingTeam.id);
    if (teamManager) {
      const player = teamManager.getPlayer(passingPlayer.id);
      if (player) {
        player.recordPass(completed, distance, isProgressive, isKey, intoFinalThird, intoPenaltyArea, underPressure);
      }
    }
    
    // Update real-time stats
    const teamSide = this.currentMatchStats && passingTeam.id === this.currentMatchStats.homeTeam.id ? 'home' : 'away';
    this.realTimeStats.passes[teamSide]++;
  }

  recordCard(cardedTeam, cardedPlayer, cardType, minute) {
    const teamManager = this.getTeamManager(cardedTeam.id);
    if (teamManager) {
      teamManager.recordPlayerCard(cardedPlayer.id, cardType);
    }
    
    // Update real-time stats
    const teamSide = this.currentMatchStats && cardedTeam.id === this.currentMatchStats.homeTeam.id ? 'home' : 'away';
    this.realTimeStats.cards[teamSide]++;
    
    // Record in current match stats
    if (this.currentMatchStats) {
      this.currentMatchStats.events.push({
        type: 'card',
        cardType: cardType,
        minute: minute,
        team: cardedTeam.name,
        player: cardedPlayer.name
      });
    }
  }

  recordDefensiveAction(defendingTeam, defendingPlayer, actionType, successful = true) {
    const teamManager = this.getTeamManager(defendingTeam.id);
    if (teamManager) {
      const player = teamManager.getPlayer(defendingPlayer.id);
      if (player) {
        player.recordDefensiveAction(actionType, successful);
      }
    }
  }

  recordDribble(dribblingTeam, dribblingPlayer, successful = true) {
    const teamManager = this.getTeamManager(dribblingTeam.id);
    if (teamManager) {
      const player = teamManager.getPlayer(dribblingPlayer.id);
      if (player) {
        player.recordDribble(successful);
      }
    }
  }

  recordFoul(foulingTeam, foulingPlayer, minute) {
    const teamManager = this.getTeamManager(foulingTeam.id);
    if (teamManager) {
      const player = teamManager.getPlayer(foulingPlayer.id);
      if (player) {
        player.recordFoul(true); // committed foul
      }
    }
    
    // Update real-time stats
    const teamSide = this.currentMatchStats && foulingTeam.id === this.currentMatchStats.homeTeam.id ? 'home' : 'away';
    this.realTimeStats.fouls[teamSide]++;
  }

  recordCorner(attackingTeam, minute) {
    // Update real-time stats
    const teamSide = this.currentMatchStats && attackingTeam.id === this.currentMatchStats.homeTeam.id ? 'home' : 'away';
    this.realTimeStats.corners[teamSide]++;
  }

  recordSubstitution(team, playerOff, playerOn, minute) {
    const teamManager = this.getTeamManager(team.id);
    if (teamManager) {
      // Add new player if not exists
      if (!teamManager.getPlayer(playerOn.id)) {
        teamManager.addPlayer(playerOn.id, playerOn.name, playerOn.position);
      }
    }
    
    // Record in current match stats
    if (this.currentMatchStats) {
      this.currentMatchStats.events.push({
        type: 'substitution',
        minute: minute,
        team: team.name,
        playerOff: playerOff.name,
        playerOn: playerOn.name
      });
    }
  }

  // ===============================================================================
  // MATCH COMPLETION
  // ===============================================================================

  finishMatch(homeScore, awayScore, matchDuration = 90) {
    if (!this.currentMatchStats) return null;
    
    const homeTeamManager = this.getTeamManager(this.currentMatchStats.homeTeam.id);
    const awayTeamManager = this.getTeamManager(this.currentMatchStats.awayTeam.id);
    
    if (!homeTeamManager || !awayTeamManager) return null;
    
    // Determine results
    let homeResult, awayResult;
    if (homeScore > awayScore) {
      homeResult = 'win';
      awayResult = 'loss';
    } else if (homeScore < awayScore) {
      homeResult = 'loss';
      awayResult = 'win';
    } else {
      homeResult = 'draw';
      awayResult = 'draw';
    }
    
    // Prepare match performance data
    const homePerformance = this.generateMatchPerformance('home');
    const awayPerformance = this.generateMatchPerformance('away');
    
    // Record match results for both teams
    homeTeamManager.recordMatchResult(
      this.currentMatchStats.awayTeam.name,
      true, // home game
      homeResult,
      homeScore,
      awayScore,
      {
        duration: matchDuration,
        teamPerformance: homePerformance,
        events: this.currentMatchStats.events.filter(e => e.team === this.currentMatchStats.homeTeam.name)
      }
    );
    
    awayTeamManager.recordMatchResult(
      this.currentMatchStats.homeTeam.name,
      false, // away game
      awayResult,
      awayScore,
      homeScore,
      {
        duration: matchDuration,
        teamPerformance: awayPerformance,
        events: this.currentMatchStats.events.filter(e => e.team === this.currentMatchStats.awayTeam.name)
      }
    );
    
    // Generate match report
    const matchReport = this.generateMatchReport(homeScore, awayScore, matchDuration);
    
    // Clean up
    const completedMatch = this.currentMatchStats;
    this.currentMatchStats = null;
    
    return {
      matchData: completedMatch,
      matchReport: matchReport,
      homeTeamStats: homeTeamManager.getTeamReport(),
      awayTeamStats: awayTeamManager.getTeamReport()
    };
  }

  generateMatchPerformance(teamSide) {
    return {
      shots: this.realTimeStats.shots[teamSide],
      shotsOnTarget: Math.floor(this.realTimeStats.shots[teamSide] * 0.4), // Estimate
      passes: this.realTimeStats.passes[teamSide],
      passesCompleted: Math.floor(this.realTimeStats.passes[teamSide] * 0.85), // Estimate
      corners: this.realTimeStats.corners[teamSide],
      fouls: this.realTimeStats.fouls[teamSide],
      cards: this.realTimeStats.cards[teamSide],
      offsides: this.realTimeStats.offsides[teamSide] || 0,
      possession: this.realTimeStats.possession[teamSide],
      advanced: {
        xG: this.realTimeStats.shots[teamSide] * 0.1, // Rough estimate
        pressures: Math.floor(this.realTimeStats.passes[teamSide] * 0.3),
        finalThirdEntries: Math.floor(this.realTimeStats.passes[teamSide] * 0.2)
      }
    };
  }

  generateMatchReport(homeScore, awayScore, duration) {
    return {
      summary: {
        homeScore: homeScore,
        awayScore: awayScore,
        duration: duration,
        attendance: this.calculateAttendance(this.homeTeam, this.awayTeam) // Realistic attendance calculation
      },
      keyStats: {
        shots: {
          home: this.realTimeStats.shots.home,
          away: this.realTimeStats.shots.away
        },
        possession: {
          home: this.realTimeStats.possession.home,
          away: this.realTimeStats.possession.away
        },
        passes: {
          home: this.realTimeStats.passes.home,
          away: this.realTimeStats.passes.away
        },
        corners: {
          home: this.realTimeStats.corners.home,
          away: this.realTimeStats.corners.away
        },
        fouls: {
          home: this.realTimeStats.fouls.home,
          away: this.realTimeStats.fouls.away
        }
      },
      events: this.currentMatchStats.events,
      playerRatings: this.generatePlayerRatings(),
      manOfTheMatch: this.selectManOfTheMatch()
    };
  }

  generatePlayerRatings() {
    // Simple rating system based on events and performance
    const ratings = new Map();
    
    if (this.currentMatchStats) {
      this.currentMatchStats.events.forEach(event => {
        if (event.player) {
          const currentRating = ratings.get(event.player) || 6.0;
          let adjustment = 0;
          
          switch (event.type) {
            case 'goal':
              adjustment = event.isPenalty ? 0.3 : 0.5;
              break;
            case 'assist':
              adjustment = 0.3;
              break;
            case 'card':
              adjustment = event.cardType === 'yellow' ? -0.2 : -0.8;
              break;
            case 'save':
              adjustment = 0.1;
              break;
          }
          
          ratings.set(event.player, Math.min(10.0, Math.max(1.0, currentRating + adjustment)));
        }
      });
    }
    
    return Array.from(ratings.entries()).map(([player, rating]) => ({
      player: player,
      rating: rating.toFixed(1)
    }));
  }

  selectManOfTheMatch() {
    const ratings = this.generatePlayerRatings();
    if (ratings.length === 0) return null;
    
    const best = ratings.reduce((prev, current) => 
      parseFloat(current.rating) > parseFloat(prev.rating) ? current : prev
    );
    
    return {
      player: best.player,
      rating: best.rating,
      reason: this.generateMotMReason(best.player)
    };
  }

  generateMotMReason(playerName) {
    const playerEvents = this.currentMatchStats?.events.filter(e => e.player === playerName) || [];
    const goals = playerEvents.filter(e => e.type === 'goal').length;
    const assists = playerEvents.filter(e => e.type === 'assist').length;
    
    if (goals >= 2) return `Scored ${goals} goals`;
    if (goals === 1 && assists >= 1) return 'Goal and assist';
    if (goals === 1) return 'Decisive goal';
    if (assists >= 2) return `Provided ${assists} assists`;
    return 'Outstanding performance';
  }

  // ===============================================================================
  // REAL-TIME UPDATES
  // ===============================================================================

  updatePossession(homePercent, awayPercent) {
    this.realTimeStats.possession.home = homePercent;
    this.realTimeStats.possession.away = awayPercent;
  }

  getRealTimeStats() {
    return { ...this.realTimeStats };
  }

  getCurrentMatchEvents() {
    return this.currentMatchStats?.events || [];
  }

  // ===============================================================================
  // LEAGUE INTEGRATION
  // ===============================================================================

  getLeagueTopScorers(limit = 10) {
    const allScorers = [];
    
    this.teamManagers.forEach(teamManager => {
      teamManager.getAllPlayers().forEach(player => {
        if (player.stats.standard.goals > 0) {
          allScorers.push({
            name: player.playerName,
            team: teamManager.teamName,
            position: player.position,
            goals: player.stats.standard.goals,
            assists: player.stats.standard.assists,
            appearances: player.stats.standard.matchesPlayed,
            goalsPer90: player.stats.standard.goalsPer90
          });
        }
      });
    });
    
    return allScorers
      .toSorted((a, b) => b.goals - a.goals)
      .slice(0, limit);
  }

  getLeagueTopAssists(limit = 10) {
    const allAssisters = [];
    
    this.teamManagers.forEach(teamManager => {
      teamManager.getAllPlayers().forEach(player => {
        if (player.stats.standard.assists > 0) {
          allAssisters.push({
            name: player.playerName,
            team: teamManager.teamName,
            position: player.position,
            assists: player.stats.standard.assists,
            goals: player.stats.standard.goals,
            appearances: player.stats.standard.matchesPlayed,
            assistsPer90: player.stats.standard.assistsPer90
          });
        }
      });
    });
    
    return allAssisters
      .toSorted((a, b) => b.assists - a.assists)
      .slice(0, limit);
  }

  exportAllStats() {
    const data = {
      season: new Date().getFullYear(),
      exportDate: new Date().toISOString(),
      teams: {}
    };
    
    this.teamManagers.forEach((manager, teamId) => {
      data.teams[teamId] = JSON.parse(manager.exportStatsToJSON());
    });
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Calculate realistic attendance based on team popularity, stadium capacity, and form
   */
  calculateAttendance(homeTeam, awayTeam) {
    // Base attendance on stadium capacity
    const stadiumCapacity = homeTeam.stadiumCapacity || 50000;
    
    // Base attendance percentage (40-90% depending on team performance)
    let attendanceRate = 0.6; // Base 60%
    
    // Adjust for home team league position (better position = higher attendance)
    const homePosition = homeTeam.position || 10;
    if (homePosition <= 4) {
      attendanceRate += 0.2; // Top 4 teams get +20%
    } else if (homePosition <= 10) {
      attendanceRate += 0.1; // Mid-table teams get +10%
    } else if (homePosition >= 18) {
      attendanceRate -= 0.1; // Relegation battle teams lose 10%
    }
    
    // Adjust for recent form
    const homeForm = homeTeam.recentForm || 'NNNNN';
    const wins = homeForm.split('').filter(result => result === 'W').length;
    const formBonus = (wins - 2.5) * 0.05; // Each win above average adds 5%
    attendanceRate += formBonus;
    
    // Adjust for opponent quality (big teams draw bigger crowds)
    const awayPosition = awayTeam.position || 10;
    if (awayPosition <= 6) {
      attendanceRate += 0.05; // Top 6 away teams boost attendance
    }
    
    // Weather and other factors (small random variation)
    const weatherFactor = 0.95 + (Math.random() * 0.1); // 95-105%
    
    // Calculate final attendance
    const baseAttendance = Math.floor(stadiumCapacity * attendanceRate);
    const finalAttendance = Math.floor(baseAttendance * weatherFactor);
    
    // Ensure it doesn't exceed stadium capacity
    return Math.min(finalAttendance, stadiumCapacity);
  }
}
