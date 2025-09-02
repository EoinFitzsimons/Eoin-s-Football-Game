/**
 * TeamStatsManager - Manages statistics for an entire team
 * Aggregates individual player stats and provides team-level analytics
 */
import { PlayerStats } from './playerStats.js';

export class TeamStatsManager {
  constructor(teamName, teamId) {
    this.teamName = teamName;
    this.teamId = teamId;
    this.season = new Date().getFullYear();
    this.players = new Map(); // playerId -> PlayerStats
    
    // Team-level aggregated stats
    this.teamStats = {
      matches: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        cleanSheets: 0,
        failedToScore: 0
      },
      
      performance: {
        totalShots: 0,
        totalShotsOnTarget: 0,
        totalPasses: 0,
        totalPassesCompleted: 0,
        totalCrosses: 0,
        totalCrossesCompleted: 0,
        totalCorners: 0,
        totalFreeKicks: 0,
        totalOffsides: 0,
        totalFouls: 0,
        totalCards: 0,
        totalPossessionTime: 0
      },
      
      advanced: {
        totalXG: 0,
        totalXGA: 0, // Expected goals against
        totalXA: 0,  // Expected assists
        averagePossession: 0,
        pressures: 0,
        pressuresSuccessful: 0,
        highTurnovers: 0,
        finalThirdEntries: 0,
        penaltyAreaEntries: 0
      }
    };
    
    // Match-by-match records
    this.matchHistory = [];
    this.playerOfTheMonth = [];
    this.topScorers = [];
    this.topAssisters = [];
  }

  // ===============================================================================
  // PLAYER MANAGEMENT
  // ===============================================================================

  addPlayer(playerId, playerName, position) {
    if (!this.players.has(playerId)) {
      this.players.set(playerId, new PlayerStats(playerId, playerName, position));
      return true;
    }
    return false;
  }

  removePlayer(playerId) {
    return this.players.delete(playerId);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getPlayersByPosition(position) {
    return Array.from(this.players.values()).filter(player => player.position === position);
  }

  // ===============================================================================
  // MATCH RECORDING
  // ===============================================================================

  recordMatchResult(opponent, homeGame, result, goalsFor, goalsAgainst, matchData = {}) {
    this.teamStats.matches.played++;
    this.teamStats.matches.goalsFor += goalsFor;
    this.teamStats.matches.goalsAgainst += goalsAgainst;
    this.teamStats.matches.goalDifference = this.teamStats.matches.goalsFor - this.teamStats.matches.goalsAgainst;
    
    // Record result
    switch (result) {
      case 'win':
        this.teamStats.matches.won++;
        this.teamStats.matches.points += 3;
        break;
      case 'draw':
        this.teamStats.matches.drawn++;
        this.teamStats.matches.points += 1;
        break;
      case 'loss':
        this.teamStats.matches.lost++;
        break;
    }
    
    // Clean sheet check
    if (goalsAgainst === 0) {
      this.teamStats.matches.cleanSheets++;
    }
    
    // Failed to score check
    if (goalsFor === 0) {
      this.teamStats.matches.failedToScore++;
    }
    
    // Record match data
    const matchRecord = {
      date: new Date(),
      opponent: opponent,
      homeGame: homeGame,
      result: result,
      score: `${goalsFor}-${goalsAgainst}`,
      goalsFor: goalsFor,
      goalsAgainst: goalsAgainst,
      ...matchData
    };
    
    this.matchHistory.push(matchRecord);
    
    // Update team performance stats if provided
    if (matchData.teamPerformance) {
      this.updateTeamPerformanceStats(matchData.teamPerformance);
    }
    
    this.updateLeaderboards();
  }

  updateTeamPerformanceStats(performance) {
    this.teamStats.performance.totalShots += performance.shots || 0;
    this.teamStats.performance.totalShotsOnTarget += performance.shotsOnTarget || 0;
    this.teamStats.performance.totalPasses += performance.passes || 0;
    this.teamStats.performance.totalPassesCompleted += performance.passesCompleted || 0;
    this.teamStats.performance.totalCrosses += performance.crosses || 0;
    this.teamStats.performance.totalCrossesCompleted += performance.crossesCompleted || 0;
    this.teamStats.performance.totalCorners += performance.corners || 0;
    this.teamStats.performance.totalFreeKicks += performance.freeKicks || 0;
    this.teamStats.performance.totalOffsides += performance.offsides || 0;
    this.teamStats.performance.totalFouls += performance.fouls || 0;
    this.teamStats.performance.totalCards += performance.cards || 0;
    this.teamStats.performance.totalPossessionTime += performance.possession || 0;
    
    // Advanced stats
    if (performance.advanced) {
      this.teamStats.advanced.totalXG += performance.advanced.xG || 0;
      this.teamStats.advanced.totalXGA += performance.advanced.xGA || 0;
      this.teamStats.advanced.totalXA += performance.advanced.xA || 0;
      this.teamStats.advanced.pressures += performance.advanced.pressures || 0;
      this.teamStats.advanced.pressuresSuccessful += performance.advanced.pressuresSuccessful || 0;
      this.teamStats.advanced.finalThirdEntries += performance.advanced.finalThirdEntries || 0;
    }
    
    // Calculate averages
    this.calculateTeamAverages();
  }

  // ===============================================================================
  // INDIVIDUAL PLAYER STAT RECORDING
  // ===============================================================================

  recordPlayerGoal(playerId, isPenalty = false, xGValue = 0.1) {
    const player = this.players.get(playerId);
    if (player) {
      player.recordGoal(isPenalty, xGValue);
    }
  }

  recordPlayerAssist(playerId, xAValue = 0.1) {
    const player = this.players.get(playerId);
    if (player) {
      player.recordAssist(xAValue);
    }
  }

  recordPlayerCard(playerId, cardType) {
    const player = this.players.get(playerId);
    if (player) {
      player.recordCard(cardType);
    }
  }

  recordPlayerMinutes(playerId, started, minutesPlayed) {
    const player = this.players.get(playerId);
    if (player) {
      player.recordMatchAppearance(started, minutesPlayed);
    }
  }

  // ===============================================================================
  // STATISTICS AND ANALYTICS
  // ===============================================================================

  calculateTeamAverages() {
    const matches = this.teamStats.matches.played;
    if (matches > 0) {
      this.teamStats.advanced.averagePossession = this.teamStats.performance.totalPossessionTime / matches;
    }
  }

  updateLeaderboards() {
    const players = Array.from(this.players.values());
    
    // Top scorers (minimum 5 appearances)
    this.topScorers = players
      .filter(p => p.stats.standard.matchesPlayed >= 5)
      .sort((a, b) => b.stats.standard.goals - a.stats.standard.goals)
      .slice(0, 10)
      .map(p => ({
        name: p.playerName,
        position: p.position,
        goals: p.stats.standard.goals,
        assists: p.stats.standard.assists,
        appearances: p.stats.standard.matchesPlayed,
        goalsPer90: p.stats.standard.goalsPer90
      }));
    
    // Top assisters
    this.topAssisters = players
      .filter(p => p.stats.standard.matchesPlayed >= 5)
      .sort((a, b) => b.stats.standard.assists - a.stats.standard.assists)
      .slice(0, 10)
      .map(p => ({
        name: p.playerName,
        position: p.position,
        assists: p.stats.standard.assists,
        goals: p.stats.standard.goals,
        appearances: p.stats.standard.matchesPlayed,
        assistsPer90: p.stats.standard.assistsPer90
      }));
  }

  // ===============================================================================
  // REPORTING AND ANALYTICS
  // ===============================================================================

  getTeamReport() {
    return {
      team: {
        name: this.teamName,
        id: this.teamId,
        season: this.season
      },
      record: {
        played: this.teamStats.matches.played,
        won: this.teamStats.matches.won,
        drawn: this.teamStats.matches.drawn,
        lost: this.teamStats.matches.lost,
        points: this.teamStats.matches.points,
        winRate: this.teamStats.matches.played > 0 ? 
          (this.teamStats.matches.won / this.teamStats.matches.played * 100).toFixed(1) : 0
      },
      goals: {
        for: this.teamStats.matches.goalsFor,
        against: this.teamStats.matches.goalsAgainst,
        difference: this.teamStats.matches.goalDifference,
        averageFor: this.teamStats.matches.played > 0 ? 
          (this.teamStats.matches.goalsFor / this.teamStats.matches.played).toFixed(2) : 0,
        averageAgainst: this.teamStats.matches.played > 0 ? 
          (this.teamStats.matches.goalsAgainst / this.teamStats.matches.played).toFixed(2) : 0
      },
      defensive: {
        cleanSheets: this.teamStats.matches.cleanSheets,
        cleanSheetRate: this.teamStats.matches.played > 0 ? 
          (this.teamStats.matches.cleanSheets / this.teamStats.matches.played * 100).toFixed(1) : 0
      },
      attacking: {
        failedToScore: this.teamStats.matches.failedToScore,
        scoringRate: this.teamStats.matches.played > 0 ? 
          ((this.teamStats.matches.played - this.teamStats.matches.failedToScore) / this.teamStats.matches.played * 100).toFixed(1) : 0
      }
    };
  }

  getTopPerformers() {
    return {
      topScorers: this.topScorers,
      topAssisters: this.topAssisters,
      mostAppearances: Array.from(this.players.values())
        .sort((a, b) => b.stats.standard.matchesPlayed - a.stats.standard.matchesPlayed)
        .slice(0, 5)
        .map(p => ({
          name: p.playerName,
          position: p.position,
          appearances: p.stats.standard.matchesPlayed,
          starts: p.stats.standard.starts,
          minutes: p.stats.standard.minutesPlayed
        })),
      mostCards: Array.from(this.players.values())
        .filter(p => (p.stats.standard.yellowCards + p.stats.standard.redCards) > 0)
        .sort((a, b) => 
          (b.stats.standard.yellowCards + b.stats.standard.redCards * 2) - 
          (a.stats.standard.yellowCards + a.stats.standard.redCards * 2))
        .slice(0, 5)
        .map(p => ({
          name: p.playerName,
          position: p.position,
          yellow: p.stats.standard.yellowCards,
          red: p.stats.standard.redCards,
          total: p.stats.standard.yellowCards + p.stats.standard.redCards
        }))
    };
  }

  getAdvancedStats() {
    const matches = this.teamStats.matches.played;
    const performance = this.teamStats.performance;
    const advanced = this.teamStats.advanced;
    
    return {
      shooting: {
        totalShots: performance.totalShots,
        shotsPerGame: matches > 0 ? (performance.totalShots / matches).toFixed(1) : 0,
        shotAccuracy: performance.totalShots > 0 ? 
          (performance.totalShotsOnTarget / performance.totalShots * 100).toFixed(1) : 0,
        totalXG: advanced.totalXG.toFixed(2),
        xGPerGame: matches > 0 ? (advanced.totalXG / matches).toFixed(2) : 0,
        goalConversion: performance.totalShotsOnTarget > 0 ? 
          (this.teamStats.matches.goalsFor / performance.totalShotsOnTarget * 100).toFixed(1) : 0
      },
      passing: {
        totalPasses: performance.totalPasses,
        passAccuracy: performance.totalPasses > 0 ? 
          (performance.totalPassesCompleted / performance.totalPasses * 100).toFixed(1) : 0,
        passesPerGame: matches > 0 ? (performance.totalPasses / matches).toFixed(0) : 0,
        crossAccuracy: performance.totalCrosses > 0 ? 
          (performance.totalCrossesCompleted / performance.totalCrosses * 100).toFixed(1) : 0
      },
      discipline: {
        foulsPerGame: matches > 0 ? (performance.totalFouls / matches).toFixed(1) : 0,
        cardsPerGame: matches > 0 ? (performance.totalCards / matches).toFixed(1) : 0,
        offsidesPerGame: matches > 0 ? (performance.totalOffsides / matches).toFixed(1) : 0
      },
      setPlayers: {
        cornersPerGame: matches > 0 ? (performance.totalCorners / matches).toFixed(1) : 0,
        freeKicksPerGame: matches > 0 ? (performance.totalFreeKicks / matches).toFixed(1) : 0
      }
    };
  }

  getRecentForm(numberOfMatches = 5) {
    const recentMatches = this.matchHistory.slice(-numberOfMatches);
    const form = recentMatches.map(match => {
      switch (match.result) {
        case 'win': return 'W';
        case 'draw': return 'D';
        case 'loss': return 'L';
        default: return '-';
      }
    });
    
    const points = recentMatches.reduce((total, match) => {
      switch (match.result) {
        case 'win': return total + 3;
        case 'draw': return total + 1;
        default: return total;
      }
    }, 0);
    
    return {
      form: form.join(''),
      matches: recentMatches.length,
      points: points,
      averagePoints: recentMatches.length > 0 ? (points / recentMatches.length).toFixed(2) : 0
    };
  }

  // ===============================================================================
  // SEASON MANAGEMENT
  // ===============================================================================

  startNewSeason() {
    this.season = new Date().getFullYear();
    
    // Reset team stats
    this.teamStats = {
      matches: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, cleanSheets: 0, failedToScore: 0 },
      performance: { totalShots: 0, totalShotsOnTarget: 0, totalPasses: 0, totalPassesCompleted: 0, totalCrosses: 0, totalCrossesCompleted: 0, totalCorners: 0, totalFreeKicks: 0, totalOffsides: 0, totalFouls: 0, totalCards: 0, totalPossessionTime: 0 },
      advanced: { totalXG: 0, totalXGA: 0, totalXA: 0, averagePossession: 0, pressures: 0, pressuresSuccessful: 0, highTurnovers: 0, finalThirdEntries: 0, penaltyAreaEntries: 0 }
    };
    
    // Reset all player stats
    this.players.forEach(player => {
      player.resetSeasonStats();
    });
    
    // Clear match history and leaderboards
    this.matchHistory = [];
    this.playerOfTheMonth = [];
    this.topScorers = [];
    this.topAssisters = [];
  }

  exportStatsToJSON() {
    return JSON.stringify({
      teamInfo: {
        name: this.teamName,
        id: this.teamId,
        season: this.season
      },
      teamStats: this.teamStats,
      players: Array.from(this.players.entries()).map(([id, player]) => ({
        id: id,
        stats: player.getAllStats()
      })),
      matchHistory: this.matchHistory,
      topPerformers: this.getTopPerformers()
    }, null, 2);
  }

  importStatsFromJSON(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      this.teamName = data.teamInfo.name;
      this.teamId = data.teamInfo.id;
      this.season = data.teamInfo.season;
      this.teamStats = data.teamStats;
      this.matchHistory = data.matchHistory;
      
      // Restore player stats
      data.players.forEach(playerData => {
        const player = this.players.get(playerData.id);
        if (player) {
          player.stats = playerData.stats;
        }
      });
      
      this.updateLeaderboards();
      return true;
    } catch (error) {
      console.error('Error importing stats:', error);
      return false;
    }
  }
}
