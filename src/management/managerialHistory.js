/**
 * ManagerialHistory - Comprehensive tracking of managerial career progression
 * Records decisions, achievements, statistics, and creates narrative career story
 */

export class ManagerialHistory {
  constructor(gameState) {
    this.gameState = gameState;
    this.historyLog = [];
    this.careerMilestones = [];
    this.seasonSummaries = [];
    this.decisionTracking = new Map();
    this.relationshipHistory = new Map();
    
    // Career statistics
    this.careerStats = {
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      transfersIn: 0,
      transfersOut: 0,
      totalSpent: 0,
      totalReceived: 0,
      promotions: 0,
      trophies: 0,
      playersDeveloped: 0,
      recordBreaks: []
    };
    
    // Managerial profile
    this.managerProfile = {
      name: 'Manager',
      startDate: new Date(),
      reputation: 50,
      preferredFormation: '4-4-2',
      tacticalStyle: 'balanced',
      developmentFocus: 'balanced',
      transferPolicy: 'balanced',
      strengths: [],
      weaknesses: [],
      philosophy: ''
    };
    
    console.log('📚 ManagerialHistory initialized');
  }

  /**
   * Initialize manager profile
   */
  initializeManager(managerData) {
    this.managerProfile = {
      ...this.managerProfile,
      ...managerData,
      startDate: new Date(this.gameState.currentDate)
    };
    
    this.recordEvent({
      type: 'career_start',
      title: 'Managerial Career Begins',
      description: `${this.managerProfile.name} begins their football management career`,
      data: { ...this.managerProfile },
      significance: 'major'
    });
    
    console.log(`👔 Manager ${this.managerProfile.name} career started`);
  }

  /**
   * Record a significant event in managerial career
   */
  recordEvent(eventData) {
    const event = {
      id: this.generateEventId(),
      timestamp: new Date(this.gameState.currentDate),
      season: this.gameState.currentSeason,
      gameWeek: this.gameState.gameWeek || 0,
      ...eventData
    };
    
    this.historyLog.push(event);
    
    // Check if this creates a milestone
    this.checkForMilestones(event);
    
    // Update decision tracking
    if (event.type.includes('decision')) {
      this.trackDecision(event);
    }
    
    console.log(`📝 Event recorded: ${event.title}`);
    return event;
  }

  /**
   * Record match result and analyze performance
   */
  recordMatchResult(matchResult, analysis = null) {
    const userTeam = this.gameState.userTeam;
    const isUserMatch = matchResult.homeTeam.id === userTeam.id || matchResult.awayTeam.id === userTeam.id;
    
    if (!isUserMatch) return;
    
    // Update career statistics
    this.careerStats.totalMatches++;
    
    const isHome = matchResult.homeTeam.id === userTeam.id;
    const userScore = isHome ? matchResult.homeScore : matchResult.awayScore;
    const opponentScore = isHome ? matchResult.awayScore : matchResult.homeScore;
    const opponent = isHome ? matchResult.awayTeam : matchResult.homeTeam;
    
    this.careerStats.goalsFor += userScore;
    this.careerStats.goalsAgainst += opponentScore;
    
    let result;
    if (userScore > opponentScore) {
      this.careerStats.wins++;
      result = 'win';
    } else if (userScore < opponentScore) {
      this.careerStats.losses++;
      result = 'loss';
    } else {
      this.careerStats.draws++;
      result = 'draw';
    }
    
    // Record the match event
    const eventData = {
      type: 'match_result',
      title: `${userTeam.name} ${userScore}-${opponentScore} ${opponent.name}`,
      description: `Match result: ${result}`,
      data: {
        ...matchResult,
        result,
        analysis,
        careerMatchNumber: this.careerStats.totalMatches
      },
      significance: this.getMatchSignificance(matchResult, result)
    };
    
    this.recordEvent(eventData);
    
    // Analyze tactical performance
    this.analyzeTacticalDecisions(matchResult, analysis);
    
    // Check for records
    this.checkMatchRecords(matchResult, result);
  }

  /**
   * Record transfer activity
   */
  recordTransfer(transferData, direction = 'in') {
    if (direction === 'in') {
      this.careerStats.transfersIn++;
      this.careerStats.totalSpent += transferData.fee || 0;
    } else {
      this.careerStats.transfersOut++;
      this.careerStats.totalReceived += transferData.fee || 0;
    }
    
    const eventData = {
      type: `transfer_${direction}`,
      title: `${transferData.player.name} ${direction === 'in' ? 'Signed' : 'Sold'}`,
      description: `${transferData.player.name} ${direction === 'in' ? 'joins' : 'leaves'} for €${this.formatMoney(transferData.fee || 0)}`,
      data: transferData,
      significance: this.getTransferSignificance(transferData)
    };
    
    this.recordEvent(eventData);
    
    // Track transfer policy
    this.analyzeTransferDecision(transferData, direction);
  }

  /**
   * Record tactical decision
   */
  recordTacticalDecision(decisionType, decisionData, context = {}) {
    const eventData = {
      type: 'tactical_decision',
      title: `Tactical Change: ${decisionType}`,
      description: `Manager made tactical adjustment: ${decisionType}`,
      data: {
        decisionType,
        decisionData,
        context,
        matchSituation: context.matchSituation || 'unknown'
      },
      significance: 'minor'
    };
    
    this.recordEvent(eventData);
    
    // Track decision patterns
    this.trackTacticalPattern(decisionType, decisionData, context);
  }

  /**
   * Record player development milestone
   */
  recordPlayerDevelopment(player, developmentType, data = {}) {
    this.careerStats.playersDeveloped++;
    
    const eventData = {
      type: 'player_development',
      title: `${player.name} Development`,
      description: `${player.name} ${developmentType}`,
      data: {
        player: {
          id: player.id,
          name: player.name,
          position: player.position,
          age: player.age
        },
        developmentType,
        ...data
      },
      significance: 'normal'
    };
    
    this.recordEvent(eventData);
  }

  /**
   * Complete season and generate summary
   */
  completeSeasonSummary(seasonData) {
    const seasonSummary = {
      season: this.gameState.currentSeason,
      startDate: this.getSeasonStartDate(),
      endDate: new Date(this.gameState.currentDate),
      finalPosition: seasonData.finalPosition,
      points: seasonData.points,
      
      // Match statistics
      matchStats: {
        played: seasonData.matchesPlayed || 0,
        won: seasonData.matchesWon || 0,
        drawn: seasonData.matchesDrawn || 0,
        lost: seasonData.matchesLost || 0,
        goalsFor: seasonData.goalsFor || 0,
        goalsAgainst: seasonData.goalsAgainst || 0
      },
      
      // Transfer activity
      transferActivity: {
        signings: seasonData.signings || [],
        departures: seasonData.departures || [],
        netSpend: seasonData.netSpend || 0
      },
      
      // Key events
      keyEvents: this.getSeasonKeyEvents(),
      
      // Performance analysis
      analysis: this.generateSeasonAnalysis(seasonData),
      
      // Awards and achievements
      achievements: seasonData.achievements || [],
      
      // Player developments
      playerDevelopments: this.getSeasonPlayerDevelopments()
    };
    
    this.seasonSummaries.push(seasonSummary);
    
    // Record season completion event
    this.recordEvent({
      type: 'season_complete',
      title: `Season ${this.gameState.currentSeason} Complete`,
      description: `Finished ${seasonData.finalPosition}${this.getOrdinalSuffix(seasonData.finalPosition)} with ${seasonData.points} points`,
      data: seasonSummary,
      significance: 'major'
    });
    
    console.log(`📅 Season ${this.gameState.currentSeason} summary completed`);
    return seasonSummary;
  }

  /**
   * Analyze tactical patterns and effectiveness
   */
  analyzeTacticalDecisions(matchResult, analysis) {
    if (!analysis) return;
    
    const tacticalData = analysis.tacticalEffectiveness;
    if (!tacticalData) return;
    
    // Track formation effectiveness
    this.trackFormationSuccess(analysis.formation, tacticalData.formation.effectiveness);
    
    // Track tactical approach success
    this.trackTacticalApproach(analysis.tactics, tacticalData.tactics.effectiveness);
  }

  /**
   * Generate comprehensive career statistics
   */
  getCareerStatistics() {
    const totalGames = this.careerStats.totalMatches;
    const winPercentage = totalGames > 0 ? (this.careerStats.wins / totalGames * 100).toFixed(1) : '0.0';
    const pointsPerGame = totalGames > 0 ? ((this.careerStats.wins * 3 + this.careerStats.draws) / totalGames).toFixed(2) : '0.00';
    
    return {
      overview: {
        matchesManaged: totalGames,
        winPercentage: parseFloat(winPercentage),
        pointsPerGame: parseFloat(pointsPerGame),
        goalsPerGame: totalGames > 0 ? (this.careerStats.goalsFor / totalGames).toFixed(2) : '0.00',
        seasonsCompleted: this.seasonSummaries.length
      },
      
      results: {
        wins: this.careerStats.wins,
        draws: this.careerStats.draws,
        losses: this.careerStats.losses,
        goalsFor: this.careerStats.goalsFor,
        goalsAgainst: this.careerStats.goalsAgainst,
        goalDifference: this.careerStats.goalsFor - this.careerStats.goalsAgainst
      },
      
      transfers: {
        signings: this.careerStats.transfersIn,
        sales: this.careerStats.transfersOut,
        totalSpent: this.careerStats.totalSpent,
        totalReceived: this.careerStats.totalReceived,
        netSpend: this.careerStats.totalSpent - this.careerStats.totalReceived
      },
      
      development: {
        playersDeveloped: this.careerStats.playersDeveloped,
        recordBreaks: this.careerStats.recordBreaks
      },
      
      achievements: {
        trophies: this.careerStats.trophies,
        promotions: this.careerStats.promotions,
        milestones: this.careerMilestones.length
      }
    };
  }

  /**
   * Get managerial profile and reputation
   */
  getManagerProfile() {
    const experience = this.careerStats.totalMatches;
    const success = this.calculateSuccessRate();
    
    return {
      ...this.managerProfile,
      experience,
      success,
      reputation: this.calculateReputation(),
      careerLength: this.getCareerLength(),
      specialisms: this.identifySpecialisms(),
      preferredStyle: this.analyzePreferredStyle()
    };
  }

  /**
   * Get recent form and trends
   */
  getRecentForm(matches = 10) {
    const recentMatches = this.historyLog
      .filter(event => event.type === 'match_result')
      .slice(-matches);
      
    const form = recentMatches.map(match => {
      switch (match.data.result) {
        case 'win': return 'W';
        case 'draw': return 'D';
        case 'loss': return 'L';
        default: return '?';
      }
    });
    
    const wins = form.filter(r => r === 'W').length;
    const draws = form.filter(r => r === 'D').length;
    const losses = form.filter(r => r === 'L').length;
    
    return {
      form: form.join(''),
      record: { wins, draws, losses },
      points: wins * 3 + draws,
      trend: this.calculateFormTrend(recentMatches)
    };
  }

  /**
   * Get career highlights and milestones
   */
  getCareerHighlights() {
    return {
      milestones: this.careerMilestones,
      biggestWin: this.getBiggestWin(),
      longestStreak: this.getLongestStreak(),
      favoriteFormation: this.getFavoriteFormation(),
      bestSeason: this.getBestSeason(),
      keyPlayers: this.getKeyPlayersDeveloped(),
      memorableMatches: this.getMemorableMatches()
    };
  }

  /**
   * Helper methods
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  checkForMilestones(event) {
    // Check for various career milestones
    if (event.type === 'match_result') {
      this.checkMatchMilestones();
    }
  }

  checkMatchMilestones() {
    const milestones = [
      { matches: 1, title: 'First Match' },
      { matches: 10, title: 'Gaining Experience' },
      { matches: 50, title: 'Experienced Manager' },
      { matches: 100, title: 'Veteran Manager' },
      { matches: 250, title: 'Seasoned Professional' },
      { matches: 500, title: 'Managerial Legend' }
    ];
    
    milestones.forEach(milestone => {
      if (this.careerStats.totalMatches === milestone.matches) {
        this.careerMilestones.push({
          id: `matches_${milestone.matches}`,
          title: milestone.title,
          description: `Managed ${milestone.matches} matches`,
          achievedAt: new Date(this.gameState.currentDate),
          type: 'experience'
        });
        
        console.log(`🏆 Milestone achieved: ${milestone.title}`);
      }
    });
  }

  trackDecision(event) {
    const decisionKey = event.data.decisionType || event.type;
    
    if (!this.decisionTracking.has(decisionKey)) {
      this.decisionTracking.set(decisionKey, {
        count: 0,
        outcomes: [],
        effectiveness: []
      });
    }
    
    const tracking = this.decisionTracking.get(decisionKey);
    tracking.count++;
    tracking.outcomes.push(event);
  }

  getMatchSignificance(matchResult, result) {
    // Determine match significance based on various factors
    if (result === 'win' && (matchResult.homeScore >= 4 || matchResult.awayScore >= 4)) {
      return 'major'; // Big win
    }
    
    if (this.careerStats.totalMatches === 1) {
      return 'major'; // First match
    }
    
    return 'normal';
  }

  getTransferSignificance(transferData) {
    const fee = transferData.fee || 0;
    
    if (fee >= 20000000) return 'major';
    if (fee >= 5000000) return 'normal';
    return 'minor';
  }

  trackTacticalPattern(decisionType, decisionData, context) {
    // Track patterns in tactical decisions
  }

  analyzeTransferDecision(transferData, direction) {
    // Analyze transfer policy and patterns
  }

  getSeasonStartDate() {
    const events = this.historyLog.filter(e => e.season === this.gameState.currentSeason);
    return events.length > 0 ? events[0].timestamp : new Date(this.gameState.currentDate);
  }

  getSeasonKeyEvents() {
    return this.historyLog
      .filter(e => e.season === this.gameState.currentSeason && e.significance !== 'minor')
      .slice(-10); // Last 10 significant events
  }

  generateSeasonAnalysis(seasonData) {
    let performance;
    if (seasonData.finalPosition <= 6) {
      performance = 'excellent';
    } else if (seasonData.finalPosition <= 12) {
      performance = 'good';
    } else {
      performance = 'poor';
    }
    
    return {
      performance,
      improvement: this.calculateSeasonImprovement(seasonData),
      tacticalEvolution: this.getSeasonTacticalEvolution(),
      strengthsIdentified: this.identifySeasonStrengths(),
      areasForImprovement: this.identifySeasonWeaknesses()
    };
  }

  getSeasonPlayerDevelopments() {
    return this.historyLog
      .filter(e => e.type === 'player_development' && e.season === this.gameState.currentSeason)
      .map(e => e.data);
  }

  trackFormationSuccess(formation, effectiveness) {
    // Track formation usage and success rates
  }

  trackTacticalApproach(tactics, effectiveness) {
    // Track tactical approach effectiveness
  }

  calculateSuccessRate() {
    const total = this.careerStats.totalMatches;
    if (total === 0) return '0.0';
    
    return ((this.careerStats.wins * 3 + this.careerStats.draws) / (total * 3) * 100).toFixed(1);
  }

  calculateReputation() {
    let reputation = this.managerProfile.reputation;
    
    // Adjust based on recent performance
    const recentForm = this.getRecentForm(10);
    if (recentForm.points >= 25) reputation += 5;
    else if (recentForm.points <= 10) reputation -= 5;
    
    return Math.max(0, Math.min(100, reputation));
  }

  getCareerLength() {
    const start = new Date(this.managerProfile.startDate);
    const current = new Date(this.gameState.currentDate);
    const diffTime = Math.abs(current - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      seasons: this.seasonSummaries.length,
      years: Math.floor(diffDays / 365)
    };
  }

  identifySpecialisms() {
    // Identify manager's specialisms based on patterns
    return ['Youth Development', 'Tactical Flexibility']; // Placeholder
  }

  analyzePreferredStyle() {
    // Analyze preferred playing style based on decisions
    return {
      formation: this.getFavoriteFormation(),
      mentality: 'balanced',
      approach: 'possession-based'
    };
  }

  calculateFormTrend(recentMatches) {
    if (recentMatches.length < 5) return 'insufficient_data';
    
    const recent5 = recentMatches.slice(-5);
    const wins = recent5.filter(m => m.data.result === 'win').length;
    
    if (wins >= 4) return 'excellent';
    if (wins >= 3) return 'good';
    if (wins >= 2) return 'average';
    return 'poor';
  }

  getBiggestWin() {
    const matchEvents = this.historyLog.filter(e => e.type === 'match_result' && e.data.result === 'win');
    
    return matchEvents.reduce((biggest, match) => {
      const margin = Math.abs(match.data.homeScore - match.data.awayScore);
      const biggestMargin = biggest ? Math.abs(biggest.data.homeScore - biggest.data.awayScore) : 0;
      
      return margin > biggestMargin ? match : biggest;
    }, null);
  }

  getLongestStreak() {
    // Calculate longest winning/unbeaten streak
    return { type: 'win', length: 5 }; // Placeholder
  }

  getFavoriteFormation() {
    // Find most used formation
    return '4-4-2'; // Placeholder
  }

  getBestSeason() {
    if (this.seasonSummaries.length === 0) return null;
    
    return this.seasonSummaries.reduce((best, season) => {
      return !best || season.finalPosition < best.finalPosition ? season : best;
    }, null);
  }

  getKeyPlayersDeveloped() {
    return this.historyLog
      .filter(e => e.type === 'player_development')
      .slice(-10)
      .map(e => e.data.player);
  }

  getMemorableMatches() {
    return this.historyLog
      .filter(e => e.type === 'match_result' && e.significance === 'major')
      .slice(-5);
  }

  calculateSeasonImprovement(seasonData) {
    const previousSeason = this.seasonSummaries[this.seasonSummaries.length - 1];
    if (!previousSeason) return 'first_season';
    
    const improvement = previousSeason.finalPosition - seasonData.finalPosition;
    
    if (improvement > 3) return 'significant_improvement';
    if (improvement > 0) return 'improvement';
    if (improvement < -3) return 'regression';
    return 'similar';
  }

  getSeasonTacticalEvolution() {
    // Analyze how tactics evolved during the season
    return 'consistent_approach'; // Placeholder
  }

  identifySeasonStrengths() {
    return ['Strong defense', 'Good team spirit']; // Placeholder
  }

  identifySeasonWeaknesses() {
    return ['Inconsistent finishing', 'Set piece defending']; // Placeholder
  }

  getOrdinalSuffix(num) {
    if (num % 100 >= 11 && num % 100 <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  formatMoney(amount) {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    } else {
      return `${amount}`;
    }
  }

  /**
   * Export career history for analysis or backup
   */
  exportCareerHistory() {
    return {
      managerProfile: this.managerProfile,
      careerStats: this.careerStats,
      seasonSummaries: this.seasonSummaries,
      careerMilestones: this.careerMilestones,
      recentEvents: this.historyLog.slice(-100), // Last 100 events
      exportedAt: new Date()
    };
  }

  /**
   * Reset history for new career
   */
  startNewCareer(managerData) {
    this.historyLog = [];
    this.careerMilestones = [];
    this.seasonSummaries = [];
    this.decisionTracking.clear();
    this.relationshipHistory.clear();
    
    this.careerStats = {
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      transfersIn: 0,
      transfersOut: 0,
      totalSpent: 0,
      totalReceived: 0,
      promotions: 0,
      trophies: 0,
      playersDeveloped: 0,
      recordBreaks: []
    };
    
    this.initializeManager(managerData);
    console.log('🆕 New managerial career started');
  }
}
