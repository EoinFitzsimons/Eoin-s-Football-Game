/**
 * LeagueSystem - Manages multi-tier league structure with promotion/relegation
 * Handles 10 countries, each with 3-tier league system
 */

export class LeagueSystem {
  constructor(worldFootballData) {
    this.countries = {};
    this.seasons = [];
    this.currentSeason = null;
    
    this.initializeFromWorldData(worldFootballData);
  }

  /**
   * Initialize league system from world football data
   */
  initializeFromWorldData(worldData) {
    for (const [countryName, countryData] of Object.entries(worldData.countries)) {
      this.countries[countryName] = {
        name: countryName,
        leagues: this.createCountryLeagues(countryData.leagues),
        totalTeams: countryData.teams.length
      };
    }
  }

  /**
   * Create league structure for a country
   */
  createCountryLeagues(leagueData) {
    const leagues = {};
    
    for (const league of leagueData) {
      leagues[league.tier] = {
        name: league.name,
        tier: league.tier,
        teams: league.teams,
        table: [],
        fixtures: [],
        results: [],
        promotionSpots: this.getPromotionSpots(league.tier),
        relegationSpots: this.getRelegationSpots(league.tier),
        playoffSpots: this.getPlayoffSpots(league.tier),
        season: null,
        matchday: 0,
        totalMatchdays: (league.teams.length - 1) * 2 // Double round-robin
      };
    }
    
    return leagues;
  }

  /**
   * Get number of promotion spots by tier
   */
  getPromotionSpots(tier) {
    switch (tier) {
      case 1: return 0; // Top tier, no promotion
      case 2: return 2; // Direct promotion spots
      case 3: return 2; // Direct promotion spots
      default: return 0;
    }
  }

  /**
   * Get number of relegation spots by tier
   */
  getRelegationSpots(tier) {
    switch (tier) {
      case 1: return 3; // 3 relegated to tier 2
      case 2: return 3; // 3 relegated to tier 3
      case 3: return 0; // Bottom tier, no relegation
      default: return 0;
    }
  }

  /**
   * Get number of playoff spots by tier
   */
  getPlayoffSpots(tier) {
    switch (tier) {
      case 1: return 0; // No playoffs in top tier
      case 2: return 4; // 4 teams in promotion playoffs (positions 3-6)
      case 3: return 4; // 4 teams in promotion playoffs (positions 3-6)
      default: return 0;
    }
  }

  /**
   * Start a new season
   */
  startSeason(seasonYear, worldData) {
    console.log(`🏆 Starting ${seasonYear} season across all leagues`);
    
    const season = {
      year: seasonYear,
      countries: {},
      startDate: new Date(),
      endDate: null,
      isActive: true
    };

    // Initialize each country's leagues for the season
    for (const [countryName, countryData] of Object.entries(worldData.countries)) {
      season.countries[countryName] = this.startCountrySeason(countryName, countryData, seasonYear);
    }

    this.currentSeason = season;
    this.seasons.push(season);
    
    return season;
  }

  /**
   * Start season for a specific country
   */
  startCountrySeason(countryName, countryData, seasonYear) {
    const countrySeason = {
      name: countryName,
      leagues: {},
      seasonYear: seasonYear
    };

    for (const league of countryData.leagues) {
      const leagueTeams = countryData.teams.filter(team => team.tier === league.tier);
      
      countrySeason.leagues[league.tier] = {
        name: league.name,
        tier: league.tier,
        teams: leagueTeams,
        table: this.initializeTable(leagueTeams),
        fixtures: this.generateFixtures(leagueTeams),
        results: [],
        matchday: 0,
        totalMatchdays: (leagueTeams.length - 1) * 2,
        isComplete: false
      };
    }

    return countrySeason;
  }

  /**
   * Initialize league table
   */
  initializeTable(teams) {
    return teams.map((team, index) => ({
      position: index + 1,
      team: team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [], // Last 5 results
      homeRecord: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
      awayRecord: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 }
    }));
  }

  /**
   * Generate complete fixture list for a league
   */
  generateFixtures(teams) {
    const fixtures = [];
    const numTeams = teams.length;
    const rounds = (numTeams - 1) * 2; // Double round-robin

    for (let round = 0; round < rounds; round++) {
      const roundFixtures = [];
      
      for (let i = 0; i < numTeams / 2; i++) {
        let home, away;
        
        if (i === 0) {
          home = 0;
          away = round === 0 ? numTeams - 1 : round;
        } else {
          const n = numTeams - 1;
          home = (round + i - 1) % n + 1;
          away = (round - i + n) % n + 1;
          if (away === 0) away = n;
        }

        // Second half of season (reverse fixtures)
        if (round >= numTeams - 1) {
          [home, away] = [away, home];
        }

        roundFixtures.push({
          matchday: round + 1,
          homeTeam: teams[home],
          awayTeam: teams[away],
          played: false,
          result: null,
          date: this.calculateMatchDate(round + 1)
        });
      }
      
      fixtures.push(...roundFixtures);
    }

    return fixtures;
  }

  /**
   * Calculate match date based on matchday
   */
  calculateMatchDate(matchday) {
    const seasonStart = new Date();
    const daysPerMatchday = 7; // One week between matchdays
    return new Date(seasonStart.getTime() + (matchday - 1) * daysPerMatchday * 24 * 60 * 60 * 1000);
  }

  /**
   * Record match result and update table
   */
  recordResult(countryName, tier, homeTeam, awayTeam, homeGoals, awayGoals) {
    if (!this.currentSeason) {
      throw new Error('No active season');
    }

    const league = this.currentSeason.countries[countryName].leagues[tier];
    const table = league.table;

    // Find teams in table
    const homeEntry = table.find(entry => entry.team.name === homeTeam.name);
    const awayEntry = table.find(entry => entry.team.name === awayTeam.name);

    if (!homeEntry || !awayEntry) {
      throw new Error('Teams not found in league table');
    }

    // Update statistics
    this.updateTeamStats(homeEntry, true, homeGoals, awayGoals);
    this.updateTeamStats(awayEntry, false, awayGoals, homeGoals);

    // Record result
    const result = {
      date: new Date(),
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeGoals: homeGoals,
      awayGoals: awayGoals,
      matchday: league.matchday + 1
    };

    league.results.push(result);

    // Update fixture as played
    const fixture = league.fixtures.find(f => 
      f.homeTeam.name === homeTeam.name && 
      f.awayTeam.name === awayTeam.name && 
      !f.played
    );
    
    if (fixture) {
      fixture.played = true;
      fixture.result = result;
    }

    // Sort table
    this.sortTable(league.table);
    this.updateTablePositions(league.table);

    return result;
  }

  /**
   * Update team statistics
   */
  updateTeamStats(teamEntry, isHome, goalsFor, goalsAgainst) {
    teamEntry.played++;
    teamEntry.goalsFor += goalsFor;
    teamEntry.goalsAgainst += goalsAgainst;
    teamEntry.goalDifference = teamEntry.goalsFor - teamEntry.goalsAgainst;

    // Update home/away records
    const record = isHome ? teamEntry.homeRecord : teamEntry.awayRecord;
    record.played++;
    record.goalsFor += goalsFor;
    record.goalsAgainst += goalsAgainst;

    // Update win/draw/loss
    let result;
    if (goalsFor > goalsAgainst) {
      teamEntry.won++;
      teamEntry.points += 3;
      record.won++;
      result = 'W';
    } else if (goalsFor === goalsAgainst) {
      teamEntry.drawn++;
      teamEntry.points += 1;
      record.drawn++;
      result = 'D';
    } else {
      teamEntry.lost++;
      record.lost++;
      result = 'L';
    }

    // Update form (last 5 games)
    teamEntry.form.push(result);
    if (teamEntry.form.length > 5) {
      teamEntry.form.shift();
    }
  }

  /**
   * Sort league table by points, goal difference, goals for
   */
  sortTable(table) {
    table.sort((a, b) => {
      // Points difference
      if (b.points !== a.points) return b.points - a.points;
      
      // Goal difference
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      
      // Goals scored
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      
      // Head-to-head would go here in real implementation
      // For now, alphabetical by team name
      return a.team.name.localeCompare(b.team.name);
    });
  }

  /**
   * Update table positions
   */
  updateTablePositions(table) {
    table.forEach((entry, index) => {
      entry.position = index + 1;
    });
  }

  /**
   * Get league table for country and tier
   */
  getLeagueTable(countryName, tier) {
    if (!this.currentSeason) return null;
    
    return this.currentSeason.countries[countryName]?.leagues[tier]?.table || null;
  }

  /**
   * Get promotion/relegation positions for a league
   */
  getLeagueStatus(countryName, tier) {
    const table = this.getLeagueTable(countryName, tier);
    if (!table) return null;

    const league = this.countries[countryName].leagues[tier];
    
    return {
      promotion: {
        automatic: table.slice(0, league.promotionSpots),
        playoff: table.slice(league.promotionSpots, league.promotionSpots + league.playoffSpots)
      },
      relegation: {
        automatic: table.slice(-league.relegationSpots),
        safe: table.slice(0, -league.relegationSpots - league.playoffSpots)
      },
      midTable: table.slice(
        league.promotionSpots + league.playoffSpots, 
        -league.relegationSpots - league.playoffSpots
      )
    };
  }

  /**
   * End season and process promotion/relegation
   */
  endSeason() {
    if (!this.currentSeason || !this.currentSeason.isActive) {
      throw new Error('No active season to end');
    }

    console.log(`🏁 Ending ${this.currentSeason.year} season`);
    
    // Process promotion/relegation for each country
    for (const [countryName, countrySeason] of Object.entries(this.currentSeason.countries)) {
      this.processPromotionRelegation(countryName, countrySeason);
    }

    this.currentSeason.isActive = false;
    this.currentSeason.endDate = new Date();
    
    return this.currentSeason;
  }

  /**
   * Process promotion and relegation for a country
   */
  processPromotionRelegation(countryName, countrySeason) {
    const leagues = countrySeason.leagues;
    const movements = { promoted: [], relegated: [] };

    // Process each tier (from top to bottom)
    for (let tier = 1; tier <= 3; tier++) {
      const league = leagues[tier];
      if (!league || !league.table) continue;

      const leagueConfig = this.countries[countryName].leagues[tier];
      
      // Relegation (except bottom tier)
      if (tier < 3 && leagueConfig.relegationSpots > 0) {
        const relegated = league.table.slice(-leagueConfig.relegationSpots);
        relegated.forEach(entry => {
          entry.team.tier = tier + 1;
          movements.relegated.push({
            team: entry.team.name,
            from: tier,
            to: tier + 1
          });
        });
      }

      // Promotion (except top tier)
      if (tier > 1 && leagueConfig.promotionSpots > 0) {
        const promoted = league.table.slice(0, leagueConfig.promotionSpots);
        promoted.forEach(entry => {
          entry.team.tier = tier - 1;
          movements.promoted.push({
            team: entry.team.name,
            from: tier,
            to: tier - 1
          });
        });
      }
    }

    // Log movements
    movements.promoted.forEach(movement => {
      console.log(`📈 ${movement.team} promoted from Tier ${movement.from} to Tier ${movement.to}`);
    });
    
    movements.relegated.forEach(movement => {
      console.log(`📉 ${movement.team} relegated from Tier ${movement.from} to Tier ${movement.to}`);
    });

    return movements;
  }

  /**
   * Get current season status
   */
  getCurrentSeasonStatus() {
    if (!this.currentSeason) return null;

    const status = {
      year: this.currentSeason.year,
      isActive: this.currentSeason.isActive,
      countries: {}
    };

    for (const [countryName, countrySeason] of Object.entries(this.currentSeason.countries)) {
      status.countries[countryName] = {
        name: countryName,
        leagues: {}
      };

      for (const [tier, league] of Object.entries(countrySeason.leagues)) {
        status.countries[countryName].leagues[tier] = {
          name: league.name,
          matchday: league.matchday,
          totalMatchdays: league.totalMatchdays,
          isComplete: league.isComplete,
          gamesPlayed: league.results.length,
          totalGames: league.fixtures.length
        };
      }
    }

    return status;
  }

  /**
   * Advance to next matchday for all leagues
   */
  advanceMatchday() {
    if (!this.currentSeason || !this.currentSeason.isActive) {
      throw new Error('No active season');
    }

    let allComplete = true;

    for (const [countryName, countrySeason] of Object.entries(this.currentSeason.countries)) {
      for (const [tier, league] of Object.entries(countrySeason.leagues)) {
        if (league.matchday < league.totalMatchdays) {
          league.matchday++;
          allComplete = false;
        } else {
          league.isComplete = true;
        }
      }
    }

    // If all leagues complete, season is over
    if (allComplete) {
      this.endSeason();
    }

    return this.getCurrentSeasonStatus();
  }
}
