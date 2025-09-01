/**
 * MatchStatistics - Tracks all match statistics and events
 */
export class MatchStatistics {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    
    this.stats = {
      home: {
        goals: 0,
        shots: 0,
        shotsOnTarget: 0,
        possession: 0,
        possessionPercentage: 50,
        fouls: 0,
        corners: 0,
        yellowCards: 0,
        redCards: 0,
        offsides: 0,
        passes: 0,
        passAccuracy: 0,
        substitutions: []
      },
      away: {
        goals: 0,
        shots: 0,
        shotsOnTarget: 0,
        possession: 0,
        possessionPercentage: 50,
        fouls: 0,
        corners: 0,
        yellowCards: 0,
        redCards: 0,
        offsides: 0,
        passes: 0,
        passAccuracy: 0,
        substitutions: []
      }
    };
    
    this.events = [];
    this.currentMinute = 0;
  }

  updateMatchMinute(minute, homePossession = true) {
    this.currentMinute = minute;
    
    // Update possession stats
    if (homePossession) {
      this.stats.home.possession++;
    } else {
      this.stats.away.possession++;
    }
    
    // Calculate possession percentages
    const totalPossession = this.stats.home.possession + this.stats.away.possession;
    if (totalPossession > 0) {
      this.stats.home.possessionPercentage = Math.round((this.stats.home.possession / totalPossession) * 100);
      this.stats.away.possessionPercentage = 100 - this.stats.home.possessionPercentage;
    }
  }

  recordGoal(team, minute, player) {
    const teamStats = team === 'home' ? this.stats.home : this.stats.away;
    teamStats.goals++;
    teamStats.shotsOnTarget++;
    teamStats.shots++;
    
    this.events.push({
      type: 'goal',
      team: team,
      minute: minute,
      player: player,
      description: `Goal! ${player} scores for ${team === 'home' ? this.homeTeam.name : this.awayTeam.name}`
    });
  }

  recordCard(team, cardType, player, minute) {
    const teamStats = team === 'home' ? this.stats.home : this.stats.away;
    
    if (cardType === 'yellow') {
      teamStats.yellowCards++;
    } else if (cardType === 'red') {
      teamStats.redCards++;
    }
    
    this.events.push({
      type: 'card',
      team: team,
      cardType: cardType,
      minute: minute,
      player: player,
      description: `${cardType} card for ${player} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`
    });
  }

  recordSubstitution(team, minute, playerOff, playerOn) {
    const teamStats = team === 'home' ? this.stats.home : this.stats.away;
    
    teamStats.substitutions.push({
      minute: minute,
      playerOff: playerOff,
      playerOn: playerOn
    });
    
    this.events.push({
      type: 'substitution',
      team: team,
      minute: minute,
      playerOff: playerOff,
      playerOn: playerOn,
      description: `Substitution: ${playerOn} replaces ${playerOff} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`
    });
  }

  recordInjury(team, minute, player, severity) {
    this.events.push({
      type: 'injury',
      team: team,
      minute: minute,
      player: player,
      severity: severity,
      description: `Injury: ${player} is ${severity} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`
    });
  }

  recordShot(team, minute, player, onTarget = false) {
    const teamStats = team === 'home' ? this.stats.home : this.stats.away;
    teamStats.shots++;
    
    if (onTarget) {
      teamStats.shotsOnTarget++;
    }
  }

  recordFoul(team, minute, player) {
    const teamStats = team === 'home' ? this.stats.home : this.stats.away;
    teamStats.fouls++;
  }

  recordCorner(team, minute) {
    const teamStats = team === 'home' ? this.stats.home : this.stats.away;
    teamStats.corners++;
  }

  getCurrentStats() {
    return {
      ...this.stats,
      currentMinute: this.currentMinute,
      events: [...this.events]
    };
  }

  getFinalStats() {
    return {
      homeTeam: {
        name: this.homeTeam.name,
        goals: this.stats.home.goals,
        ...this.stats.home
      },
      awayTeam: {
        name: this.awayTeam.name,
        goals: this.stats.away.goals,
        ...this.stats.away
      },
      events: [...this.events],
      duration: this.currentMinute
    };
  }

  getMatchSummary() {
    return {
      score: {
        home: this.stats.home.goals,
        away: this.stats.away.goals
      },
      events: this.events.slice(-5), // Last 5 events
      possession: {
        home: this.stats.home.possessionPercentage,
        away: this.stats.away.possessionPercentage
      },
      keyStats: {
        home: {
          shots: this.stats.home.shots,
          shotsOnTarget: this.stats.home.shotsOnTarget,
          corners: this.stats.home.corners,
          fouls: this.stats.home.fouls
        },
        away: {
          shots: this.stats.away.shots,
          shotsOnTarget: this.stats.away.shotsOnTarget,
          corners: this.stats.away.corners,
          fouls: this.stats.away.fouls
        }
      }
    };
  }
}
