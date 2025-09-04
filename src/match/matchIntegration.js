/**
 * MatchIntegration - Seamless integration between match systems and game world
 * Connects match results with leagues, transfers, player development, and narrative
 */

export class MatchIntegration {
  constructor(gameState) {
    this.gameState = gameState;
    this.integrationCallbacks = new Map();
    this.seasonalData = {
      currentSeason: null,
      matchResults: [],
      tableUpdates: [],
      playerPerformances: new Map(),
      teamMomentum: new Map()
    };
    
    console.log('🔗 MatchIntegration initialized');
  }

  /**
   * Process a completed match and integrate results across all systems
   */
  integrateMatchResult(matchResult, matchAnalysis = null) {
    console.log('🔄 Integrating match result across game systems...');
    
    try {
      // Core integration steps
      this.updateLeagueStandings(matchResult);
      this.processPlayerDevelopment(matchResult, matchAnalysis);
      this.updateTransferMarketValues(matchResult);
      this.generateMatchNarrative(matchResult, matchAnalysis);
      this.updateTeamMomentum(matchResult);
      this.processPlayerStats(matchResult);
      this.updateManagerialRecord(matchResult);
      this.checkAchievements(matchResult);
      this.generateNewsItems(matchResult);
      
      // Store for seasonal analysis
      this.seasonalData.matchResults.push({
        ...matchResult,
        analysis: matchAnalysis,
        integratedAt: new Date(this.gameState.currentDate)
      });
      
      console.log('✅ Match integration completed successfully');
      
      // Trigger callbacks
      this.triggerIntegrationCallbacks('match_integrated', {
        matchResult,
        matchAnalysis,
        integrationData: this.getIntegrationSummary(matchResult)
      });
      
    } catch (error) {
      console.error('❌ Error during match integration:', error);
      throw error;
    }
  }

  /**
   * Update league standings and table positions
   */
  updateLeagueStandings(matchResult) {
    const league = this.gameState.league;
    if (!league) return;

    // Record result in league
    league.recordResult(
      matchResult.homeTeam,
      matchResult.awayTeam,
      matchResult.homeScore,
      matchResult.awayScore
    );

    // Track table changes
    const newStandings = league.getStandings();
    const userTeamPosition = league.getPosition(this.gameState.userTeam);
    
    this.seasonalData.tableUpdates.push({
      date: new Date(this.gameState.currentDate),
      position: userTeamPosition,
      points: this.gameState.userTeam.points,
      standings: newStandings.slice(0, 10) // Top 10 for analysis
    });

    console.log(`📊 League table updated - ${this.gameState.userTeam.name} now ${userTeamPosition}${this.getOrdinalSuffix(userTeamPosition)}`);
  }

  /**
   * Process player development based on match performance
   */
  processPlayerDevelopment(matchResult, matchAnalysis) {
    if (!matchAnalysis?.playerRatings) return;

    Object.entries(matchAnalysis.playerRatings).forEach(([playerId, performance]) => {
      const player = this.findPlayerById(playerId);
      if (!player) return;

      // Track performance history
      if (!this.seasonalData.playerPerformances.has(playerId)) {
        this.seasonalData.playerPerformances.set(playerId, {
          matches: 0,
          totalRating: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          developments: []
        });
      }

      const playerData = this.seasonalData.playerPerformances.get(playerId);
      playerData.matches++;
      playerData.totalRating += performance.rating;

      // Apply development based on performance
      this.applyPlayerDevelopment(player, performance);
      
      // Track specific achievements
      if (performance.keyStats.goals > 0) {
        playerData.goals += performance.keyStats.goals;
      }
      
      if (performance.keyStats.assists > 0) {
        playerData.assists += performance.keyStats.assists;
      }

      console.log(`📈 ${player.name}: Performance ${performance.rating}/10, development applied`);
    });
  }

  /**
   * Apply individual player development
   */
  applyPlayerDevelopment(player, performance) {
    const baseGrowth = this.calculateBaseGrowth(player);
    const performanceMultiplier = performance.rating / 10;
    
    // Calculate potential growth in different attributes
    const developments = {
      technical: this.calculateAttributeGrowth(player, 'technical', baseGrowth, performanceMultiplier),
      physical: this.calculateAttributeGrowth(player, 'physical', baseGrowth, performanceMultiplier),
      mental: this.calculateAttributeGrowth(player, 'mental', baseGrowth, performanceMultiplier)
    };

    // Apply developments
    this.applyAttributeChanges(player, developments);
    
    // Update confidence and morale based on performance
    this.updatePlayerMentality(player, performance);
    
    // Track development for UI notifications
    this.trackPlayerDevelopment(player, developments, performance);
  }

  /**
   * Update transfer market values based on performances
   */
  updateTransferMarketValues(matchResult) {
    if (!this.gameState.transferMarket) return;

    // Update values for standout performers
    const standoutPerformers = this.identifyStandoutPerformers(matchResult);
    
    standoutPerformers.forEach(({ player, valueChange, reason }) => {
      const oldValue = player.value || 1000000;
      player.value = Math.max(50000, oldValue + valueChange);
      
      console.log(`💰 ${player.name} value: ${this.formatMoney(oldValue)} → ${this.formatMoney(player.value)} (${reason})`);
    });

    // Update market demand
    this.gameState.transferMarket.updateDemandFactors(standoutPerformers);
  }

  /**
   * Generate narrative elements from match
   */
  generateMatchNarrative(matchResult, matchAnalysis) {
    const narratives = [];
    const userTeam = this.gameState.userTeam;
    const isUserMatch = matchResult.homeTeam.id === userTeam.id || matchResult.awayTeam.id === userTeam.id;
    
    if (isUserMatch) {
      narratives.push(...this.generateUserMatchNarrative(matchResult, matchAnalysis));
    }
    
    // Generate league-wide narratives
    narratives.push(...this.generateLeagueNarrative(matchResult));
    
    // Store narratives for news system
    narratives.forEach(narrative => {
      this.gameState.addNarrative(narrative);
    });
    
    return narratives;
  }

  /**
   * Generate user team specific narratives
   */
  generateUserMatchNarrative(matchResult, matchAnalysis) {
    const narratives = [];
    const userTeam = this.gameState.userTeam;
    const isHome = matchResult.homeTeam.id === userTeam.id;
    const userScore = isHome ? matchResult.homeScore : matchResult.awayScore;
    const opponentScore = isHome ? matchResult.awayScore : matchResult.homeScore;
    const opponent = isHome ? matchResult.awayTeam : matchResult.homeTeam;
    
    // Result-based narratives
    if (userScore > opponentScore) {
      narratives.push({
        type: 'match_victory',
        title: `${userTeam.name} Secure Victory`,
        content: `${userTeam.name} claimed a ${userScore}-${opponentScore} victory over ${opponent.name} in an impressive display.`,
        importance: 'normal',
        mood: 'positive'
      });
    } else if (userScore < opponentScore) {
      narratives.push({
        type: 'match_defeat',
        title: `${userTeam.name} Fall Short`,
        content: `Despite their efforts, ${userTeam.name} were defeated ${opponentScore}-${userScore} by ${opponent.name}.`,
        importance: 'normal',
        mood: 'negative'
      });
    } else {
      narratives.push({
        type: 'match_draw',
        title: `${userTeam.name} Share Points`,
        content: `${userTeam.name} and ${opponent.name} played out a ${userScore}-${userScore} draw in a closely contested match.`,
        importance: 'normal',
        mood: 'neutral'
      });
    }

    // Performance-based narratives
    if (matchAnalysis?.performance?.overall >= 8) {
      narratives.push({
        type: 'excellent_performance',
        title: 'Outstanding Team Performance',
        content: `The team's performance was exceptional, showcasing excellent teamwork and tactical execution.`,
        importance: 'high',
        mood: 'positive'
      });
    }

    return narratives;
  }

  /**
   * Update team momentum tracking
   */
  updateTeamMomentum(matchResult) {
    const userTeam = this.gameState.userTeam;
    const isUserMatch = matchResult.homeTeam.id === userTeam.id || matchResult.awayTeam.id === userTeam.id;
    
    if (isUserMatch) {
      if (!this.seasonalData.teamMomentum.has(userTeam.id)) {
        this.seasonalData.teamMomentum.set(userTeam.id, {
          recentForm: [],
          confidence: 50,
          morale: 50,
          streak: { type: 'none', count: 0 }
        });
      }

      const momentum = this.seasonalData.teamMomentum.get(userTeam.id);
      const result = this.getMatchResult(matchResult, userTeam);
      
      // Update recent form (last 5 matches)
      momentum.recentForm.push(result);
      if (momentum.recentForm.length > 5) {
        momentum.recentForm.shift();
      }

      // Update confidence and morale
      this.updateTeamMentality(momentum, result);
      
      // Update streak
      this.updateStreak(momentum, result);
      
      console.log(`📊 Team momentum updated: ${momentum.recentForm.join('')} (${momentum.streak.type} streak: ${momentum.streak.count})`);
    }
  }

  /**
   * Process detailed player statistics
   */
  processPlayerStats(matchResult) {
    // This would integrate with the PlayerStats system
    // Update goals, assists, clean sheets, etc.
    console.log('📊 Player statistics updated');
  }

  /**
   * Update managerial record
   */
  updateManagerialRecord(matchResult) {
    if (!this.gameState.managerialRecord) {
      this.gameState.managerialRecord = {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0
      };
    }

    const record = this.gameState.managerialRecord;
    const userTeam = this.gameState.userTeam;
    const result = this.getMatchResult(matchResult, userTeam);
    
    record.matches++;
    
    const isHome = matchResult.homeTeam.id === userTeam.id;
    const userScore = isHome ? matchResult.homeScore : matchResult.awayScore;
    const opponentScore = isHome ? matchResult.awayScore : matchResult.homeScore;
    
    record.goalsFor += userScore;
    record.goalsAgainst += opponentScore;
    
    if (result === 'W') record.wins++;
    else if (result === 'D') record.draws++;
    else if (result === 'L') record.losses++;
    
    console.log(`👔 Managerial record: ${record.wins}W ${record.draws}D ${record.losses}L (${record.matches} games)`);
  }

  /**
   * Check for achievements
   */
  checkAchievements(matchResult) {
    const achievements = [];
    const userTeam = this.gameState.userTeam;
    const isUserMatch = matchResult.homeTeam.id === userTeam.id || matchResult.awayTeam.id === userTeam.id;
    
    if (!isUserMatch) return achievements;

    // First win achievement
    if (this.gameState.managerialRecord?.wins === 1) {
      achievements.push({
        id: 'first_win',
        title: 'First Victory',
        description: 'Win your first match as manager'
      });
    }

    // Clean sheet achievement
    const isHome = matchResult.homeTeam.id === userTeam.id;
    const opponentScore = isHome ? matchResult.awayScore : matchResult.homeScore;
    if (opponentScore === 0) {
      achievements.push({
        id: 'clean_sheet',
        title: 'Solid Defense',
        description: 'Keep a clean sheet'
      });
    }

    // Add achievements to game state
    achievements.forEach(achievement => {
      this.gameState.addAchievement(achievement.id, achievement.title, achievement.description);
    });

    return achievements;
  }

  /**
   * Generate news items from match
   */
  generateNewsItems(matchResult) {
    const newsItems = [];
    
    // Major results news
    if (matchResult.homeScore >= 4 || matchResult.awayScore >= 4) {
      newsItems.push({
        type: 'result_highlight',
        headline: `${matchResult.homeScore + matchResult.awayScore}-Goal Thriller!`,
        content: `${matchResult.homeTeam.name} and ${matchResult.awayTeam.name} produced an entertaining ${matchResult.homeScore}-${matchResult.awayScore} encounter.`
      });
    }

    // Store news items
    newsItems.forEach(item => {
      this.gameState.addNewsItem(item);
    });

    return newsItems;
  }

  /**
   * Register integration callback
   */
  onIntegration(eventType, callback) {
    if (!this.integrationCallbacks.has(eventType)) {
      this.integrationCallbacks.set(eventType, []);
    }
    this.integrationCallbacks.get(eventType).push(callback);
  }

  /**
   * Trigger integration callbacks
   */
  triggerIntegrationCallbacks(eventType, data) {
    const callbacks = this.integrationCallbacks.get(eventType) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in integration callback:', error);
      }
    });
  }

  /**
   * Helper methods
   */
  getOrdinalSuffix(num) {
    if (num % 100 >= 11 && num % 100 <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  findPlayerById(playerId) {
    return this.gameState.userTeam?.players?.find(p => p.id === playerId);
  }

  calculateBaseGrowth(player) {
    // Younger players develop faster
    if (player.age <= 21) return 0.3;
    if (player.age <= 25) return 0.2;
    if (player.age <= 29) return 0.1;
    return 0.05; // Older players develop slower
  }

  calculateAttributeGrowth(player, attributeType, baseGrowth, performanceMultiplier) {
    return Math.random() * baseGrowth * performanceMultiplier;
  }

  applyAttributeChanges(player, developments) {
    // Apply small incremental changes to player attributes
    Object.entries(developments).forEach(([type, growth]) => {
      if (growth > 0.1) { // Only apply meaningful changes
        player[`${type}Growth`] = (player[`${type}Growth`] || 0) + growth;
        
        // Update overall if significant growth
        if (player[`${type}Growth`] >= 1.0) {
          player.overall = Math.min(99, (player.overall || 50) + 1);
          player[`${type}Growth`] = 0;
          console.log(`⬆️ ${player.name} improved overall rating to ${player.overall}`);
        }
      }
    });
  }

  updatePlayerMentality(player, performance) {
    if (performance.rating >= 8) {
      player.confidence = Math.min(100, (player.confidence || 50) + 5);
      player.morale = Math.min(100, player.morale + 3);
    } else if (performance.rating <= 4) {
      player.confidence = Math.max(20, (player.confidence || 50) - 3);
      player.morale = Math.max(20, player.morale - 2);
    }
  }

  trackPlayerDevelopment(player, developments, performance) {
    const playerData = this.seasonalData.playerPerformances.get(player.id);
    if (playerData) {
      playerData.developments.push({
        date: new Date(this.gameState.currentDate),
        performance: performance.rating,
        developments,
        overall: player.overall
      });
    }
  }

  identifyStandoutPerformers(matchResult) {
    // This would be enhanced with actual match data
    return []; // Placeholder
  }

  generateLeagueNarrative(matchResult) {
    return []; // Placeholder for league-wide narratives
  }

  getMatchResult(matchResult, team) {
    const isHome = matchResult.homeTeam.id === team.id;
    const teamScore = isHome ? matchResult.homeScore : matchResult.awayScore;
    const opponentScore = isHome ? matchResult.awayScore : matchResult.homeScore;
    
    if (teamScore > opponentScore) return 'W';
    if (teamScore < opponentScore) return 'L';
    return 'D';
  }

  updateTeamMentality(momentum, result) {
    if (result === 'W') {
      momentum.confidence = Math.min(100, momentum.confidence + 10);
      momentum.morale = Math.min(100, momentum.morale + 8);
    } else if (result === 'L') {
      momentum.confidence = Math.max(20, momentum.confidence - 8);
      momentum.morale = Math.max(20, momentum.morale - 6);
    } else {
      momentum.confidence = Math.min(100, momentum.confidence + 2);
      momentum.morale = Math.min(100, momentum.morale + 1);
    }
  }

  updateStreak(momentum, result) {
    if (momentum.streak.type === result || momentum.streak.type === 'none') {
      momentum.streak.type = result;
      momentum.streak.count++;
    } else {
      momentum.streak.type = result;
      momentum.streak.count = 1;
    }
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

  getIntegrationSummary(matchResult) {
    return {
      leaguePosition: this.gameState.league?.getPosition(this.gameState.userTeam),
      teamMomentum: this.seasonalData.teamMomentum.get(this.gameState.userTeam.id),
      managerialRecord: this.gameState.managerialRecord,
      keyDevelopments: this.getRecentDevelopments()
    };
  }

  getRecentDevelopments() {
    // Return recent player developments
    return Array.from(this.seasonalData.playerPerformances.entries())
      .filter(([_, data]) => data.developments.length > 0)
      .map(([playerId, data]) => ({
        playerId,
        latestDevelopment: data.developments[data.developments.length - 1]
      }))
      .slice(0, 5);
  }

  /**
   * Get seasonal analysis
   */
  getSeasonalAnalysis() {
    return {
      matchesPlayed: this.seasonalData.matchResults.length,
      tableProgression: this.seasonalData.tableUpdates,
      topPerformers: this.getTopPerformers(),
      teamForm: this.seasonalData.teamMomentum.get(this.gameState.userTeam.id),
      achievements: this.gameState.userProfile?.achievements || []
    };
  }

  getTopPerformers() {
    return Array.from(this.seasonalData.playerPerformances.entries())
      .map(([playerId, data]) => ({
        playerId,
        averageRating: data.totalRating / Math.max(1, data.matches),
        matches: data.matches,
        goals: data.goals,
        assists: data.assists
      }))
      .filter(p => p.matches > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);
  }

  /**
   * Reset for new season
   */
  startNewSeason(season) {
    this.seasonalData = {
      currentSeason: season,
      matchResults: [],
      tableUpdates: [],
      playerPerformances: new Map(),
      teamMomentum: new Map()
    };
    
    console.log(`🆕 Match integration reset for season ${season}`);
  }
}
