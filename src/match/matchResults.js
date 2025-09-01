/**
 * MatchResults - Processes match results and updates league/team stats
 */
export class MatchResults {
  constructor(gameState) {
    this.gameState = gameState;
  }

  generateResult(homeTeam, awayTeam, matchSummary, finalStats) {
    const homeScore = finalStats.homeTeam.goals;
    const awayScore = finalStats.awayTeam.goals;
    
    // Determine result
    let result;
    if (homeScore > awayScore) {
      result = 'home_win';
    } else if (awayScore > homeScore) {
      result = 'away_win';
    } else {
      result = 'draw';
    }

    const matchResult = {
      id: `match_${Date.now()}`,
      date: new Date(),
      homeTeam: {
        name: homeTeam.name,
        score: homeScore,
        stats: finalStats.homeTeam
      },
      awayTeam: {
        name: awayTeam.name,
        score: awayScore,
        stats: finalStats.awayTeam
      },
      result: result,
      events: matchSummary.events || [],
      keyEvents: (matchSummary.events || []).filter(event => event.importance === 'high'),
      duration: finalStats.duration || 90,
      attendance: this.generateAttendance(),
      weather: this.generateWeather()
    };

    return matchResult;
  }

  processMatchResult(matchResult) {
    // Update league standings if gameState exists
    if (this.gameState && this.gameState.league) {
      this.updateLeagueStandings(matchResult);
    }

    // Update team records
    this.updateTeamRecords(matchResult);
    
    // Update player stats
    this.updatePlayerStats(matchResult);

    return matchResult;
  }

  updateLeagueStandings(matchResult) {
    const { homeTeam, awayTeam, result } = matchResult;
    
    // Find teams in league
    const homeTeamObj = this.gameState.league.teams.find(team => team.name === homeTeam.name);
    const awayTeamObj = this.gameState.league.teams.find(team => team.name === awayTeam.name);

    if (!homeTeamObj || !awayTeamObj) {
      console.warn('Teams not found in league standings');
      return;
    }

    // Initialize stats if they don't exist
    if (!homeTeamObj.stats) homeTeamObj.stats = this.initializeTeamStats();
    if (!awayTeamObj.stats) awayTeamObj.stats = this.initializeTeamStats();

    // Update matches played
    homeTeamObj.stats.played++;
    awayTeamObj.stats.played++;

    // Update goals
    homeTeamObj.stats.goalsFor += homeTeam.score;
    homeTeamObj.stats.goalsAgainst += awayTeam.score;
    awayTeamObj.stats.goalsFor += awayTeam.score;
    awayTeamObj.stats.goalsAgainst += homeTeam.score;

    // Update results
    if (result === 'home_win') {
      homeTeamObj.stats.wins++;
      homeTeamObj.stats.points += 3;
      awayTeamObj.stats.losses++;
    } else if (result === 'away_win') {
      awayTeamObj.stats.wins++;
      awayTeamObj.stats.points += 3;
      homeTeamObj.stats.losses++;
    } else {
      homeTeamObj.stats.draws++;
      homeTeamObj.stats.points += 1;
      awayTeamObj.stats.draws++;
      awayTeamObj.stats.points += 1;
    }

    // Calculate goal difference
    homeTeamObj.stats.goalDifference = homeTeamObj.stats.goalsFor - homeTeamObj.stats.goalsAgainst;
    awayTeamObj.stats.goalDifference = awayTeamObj.stats.goalsFor - awayTeamObj.stats.goalsAgainst;

    // Sort league table
    this.sortLeagueTable();
  }

  updateTeamRecords(matchResult) {
    // Update team records in match history
    if (!this.gameState.teamRecords) {
      this.gameState.teamRecords = {};
    }

    // Add match to team records
    const homeTeamName = matchResult.homeTeam.name;
    const awayTeamName = matchResult.awayTeam.name;

    if (!this.gameState.teamRecords[homeTeamName]) {
      this.gameState.teamRecords[homeTeamName] = { matches: [] };
    }
    if (!this.gameState.teamRecords[awayTeamName]) {
      this.gameState.teamRecords[awayTeamName] = { matches: [] };
    }

    this.gameState.teamRecords[homeTeamName].matches.push({
      opponent: awayTeamName,
      homeGame: true,
      result: matchResult.result,
      score: `${matchResult.homeTeam.score}-${matchResult.awayTeam.score}`,
      date: matchResult.date
    });

    this.gameState.teamRecords[awayTeamName].matches.push({
      opponent: homeTeamName,
      homeGame: false,
      result: matchResult.result === 'home_win' ? 'away_loss' : 
              matchResult.result === 'away_win' ? 'away_win' : 'draw',
      score: `${matchResult.awayTeam.score}-${matchResult.homeTeam.score}`,
      date: matchResult.date
    });
  }

  updatePlayerStats(matchResult) {
    // Update player statistics from match events
    const goalEvents = matchResult.events.filter(event => event.type === 'goal');
    const cardEvents = matchResult.events.filter(event => event.type === 'card');

    // Process goal scorers
    goalEvents.forEach(goal => {
      this.updatePlayerGoalStats(goal.player, goal.team === 'home' ? matchResult.homeTeam.name : matchResult.awayTeam.name);
    });

    // Process cards
    cardEvents.forEach(card => {
      this.updatePlayerCardStats(card.player, card.cardType, card.team === 'home' ? matchResult.homeTeam.name : matchResult.awayTeam.name);
    });
  }

  updatePlayerGoalStats(playerName, teamName) {
    if (!this.gameState.playerStats) {
      this.gameState.playerStats = {};
    }

    const playerKey = `${teamName}_${playerName}`;
    if (!this.gameState.playerStats[playerKey]) {
      this.gameState.playerStats[playerKey] = {
        name: playerName,
        team: teamName,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        appearances: 0
      };
    }

    this.gameState.playerStats[playerKey].goals++;
    this.gameState.playerStats[playerKey].appearances++;
  }

  updatePlayerCardStats(playerName, cardType, teamName) {
    if (!this.gameState.playerStats) {
      this.gameState.playerStats = {};
    }

    const playerKey = `${teamName}_${playerName}`;
    if (!this.gameState.playerStats[playerKey]) {
      this.gameState.playerStats[playerKey] = {
        name: playerName,
        team: teamName,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        appearances: 0
      };
    }

    if (cardType === 'yellow') {
      this.gameState.playerStats[playerKey].yellowCards++;
    } else if (cardType === 'red') {
      this.gameState.playerStats[playerKey].redCards++;
    }
  }

  initializeTeamStats() {
    return {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  }

  sortLeagueTable() {
    if (!this.gameState.league || !this.gameState.league.teams) return;

    this.gameState.league.teams.sort((a, b) => {
      // Sort by points (descending)
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      
      // Then by goal difference (descending)
      if (b.stats.goalDifference !== a.stats.goalDifference) {
        return b.stats.goalDifference - a.stats.goalDifference;
      }
      
      // Then by goals for (descending)
      return b.stats.goalsFor - a.stats.goalsFor;
    });

    // Update positions
    this.gameState.league.teams.forEach((team, index) => {
      team.position = index + 1;
    });
  }

  generateAttendance() {
    // Generate realistic attendance figures
    return Math.floor(Math.random() * 30000) + 10000;
  }

  generateWeather() {
    const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Sunny'];
    const temperature = Math.floor(Math.random() * 25) + 5; // 5-30°C
    
    return {
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: temperature,
      description: `${temperature}°C, ${conditions[Math.floor(Math.random() * conditions.length)]}`
    };
  }

  getMatchHistory(teamName, limit = 10) {
    if (!this.gameState.teamRecords || !this.gameState.teamRecords[teamName]) {
      return [];
    }

    return this.gameState.teamRecords[teamName].matches
      .slice(-limit)
      .reverse(); // Most recent first
  }

  getLeagueTable() {
    if (!this.gameState.league || !this.gameState.league.teams) {
      return [];
    }

    return [...this.gameState.league.teams].sort((a, b) => {
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      if (b.stats.goalDifference !== a.stats.goalDifference) {
        return b.stats.goalDifference - a.stats.goalDifference;
      }
      return b.stats.goalsFor - a.stats.goalsFor;
    });
  }
}
