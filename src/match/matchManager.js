/**
 * MatchManager - Advanced match orchestration and lifecycle management
 * Handles match scheduling, team preparation, tactical decisions, and post-match analysis
 */

import { MatchController } from './matchController.js';

export class MatchManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.currentMatch = null;
    this.matchQueue = [];
    this.matchHistory = [];
    
    // Match preparation and settings
    this.preparation = {
      teamTalk: null,
      formation: null,
      tactics: null,
      startingXI: [],
      substitutions: [],
      instructions: {}
    };
    
    // Post-match analysis data
    this.analysisData = {
      performance: {},
      playerRatings: {},
      tacticalEffectiveness: {},
      areas: {},
      nextMatchRecommendations: {}
    };
    
    console.log('⚽ MatchManager initialized');
  }

  /**
   * Schedule a new match
   */
  scheduleMatch(homeTeam, awayTeam, date, competition = 'league', importance = 'normal') {
    const matchData = {
      id: this.generateMatchId(),
      homeTeam,
      awayTeam,
      date: new Date(date),
      competition,
      importance, // normal, important, crucial
      status: 'scheduled',
      preparation: {
        completed: false,
        teamTalkGiven: false,
        tacticSet: false,
        lineupConfirmed: false
      },
      userTeamParticipating: this.isUserTeamParticipating(homeTeam, awayTeam)
    };
    
    this.matchQueue.push(matchData);
    this.sortMatchQueue();
    
    console.log(`📅 Match scheduled: ${homeTeam.name} vs ${awayTeam.name} on ${date.toDateString()}`);
    return matchData;
  }

  /**
   * Get next upcoming match for user team
   */
  getNextUserMatch() {
    return this.matchQueue.find(match => 
      match.userTeamParticipating && 
      match.status === 'scheduled'
    );
  }

  /**
   * Get all upcoming matches in next 7 days
   */
  getUpcomingMatches(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return this.matchQueue.filter(match => 
      match.date <= cutoffDate && 
      match.status === 'scheduled'
    );
  }

  /**
   * Begin match preparation phase
   */
  startMatchPreparation(matchId) {
    const match = this.matchQueue.find(m => m.id === matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (!match.userTeamParticipating) {
      throw new Error('Cannot prepare for non-user team match');
    }

    this.currentMatch = match;
    this.preparation = {
      teamTalk: null,
      formation: this.getUserTeamDefaultFormation(),
      tactics: this.getUserTeamDefaultTactics(),
      startingXI: this.generateStartingXI(),
      substitutions: [],
      instructions: {}
    };

    match.status = 'preparing';
    
    console.log(`🎯 Started preparation for ${match.homeTeam.name} vs ${match.awayTeam.name}`);
    return this.preparation;
  }

  /**
   * Set tactical formation
   */
  setFormation(formation) {
    if (!this.currentMatch) {
      throw new Error('No match being prepared');
    }

    const validFormations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '4-5-1'];
    if (!validFormations.includes(formation)) {
      throw new Error('Invalid formation');
    }

    this.preparation.formation = formation;
    this.preparation.startingXI = this.generateStartingXI(formation);
    this.currentMatch.preparation.tacticSet = true;
    
    console.log(`⚡ Formation set to ${formation}`);
    return this.preparation;
  }

  /**
   * Set team tactics
   */
  setTactics(tactics) {
    if (!this.currentMatch) {
      throw new Error('No match being prepared');
    }

    const defaultTactics = {
      mentality: 'balanced', // defensive, balanced, attacking
      tempo: 'normal', // slow, normal, fast
      pressing: 'medium', // low, medium, high
      width: 'normal', // narrow, normal, wide
      passLength: 'mixed', // short, mixed, long
      creativity: 'normal' // low, normal, high
    };

    this.preparation.tactics = { ...defaultTactics, ...tactics };
    this.currentMatch.preparation.tacticSet = true;
    
    console.log('⚡ Tactics updated');
    return this.preparation.tactics;
  }

  /**
   * Give team talk before match
   */
  giveTeamTalk(type, intensity = 'normal') {
    if (!this.currentMatch) {
      throw new Error('No match being prepared');
    }

    const teamTalkTypes = [
      'motivational', 'calm', 'aggressive', 'tactical', 'confidence'
    ];
    
    if (!teamTalkTypes.includes(type)) {
      throw new Error('Invalid team talk type');
    }

    this.preparation.teamTalk = {
      type,
      intensity, // low, normal, high
      effect: this.calculateTeamTalkEffect(type, intensity),
      timestamp: new Date()
    };

    this.currentMatch.preparation.teamTalkGiven = true;
    
    // Apply temporary morale boost to players
    this.applyTeamTalkEffect(this.preparation.teamTalk.effect);
    
    console.log(`🗣️ Team talk given: ${type} (${intensity} intensity)`);
    return this.preparation.teamTalk;
  }

  /**
   * Confirm starting lineup
   */
  confirmLineup(startingXI, substitutes = []) {
    if (!this.currentMatch) {
      throw new Error('No match being prepared');
    }

    // Validate lineup
    if (startingXI.length !== 11) {
      throw new Error('Starting XI must have exactly 11 players');
    }

    if (substitutes.length > 7) {
      throw new Error('Cannot have more than 7 substitutes');
    }

    // Check for fitness and availability
    const unavailablePlayers = startingXI.filter(player => 
      player.injured || player.suspended || player.fatigue > 80
    );

    if (unavailablePlayers.length > 0) {
      console.warn('⚠️ Some players may not be fit for selection:', unavailablePlayers.map(p => p.name));
    }

    this.preparation.startingXI = startingXI;
    this.preparation.substitutions = substitutes;
    this.currentMatch.preparation.lineupConfirmed = true;
    
    console.log('✅ Starting lineup confirmed');
    return this.preparation;
  }

  /**
   * Start the actual match
   */
  startMatch(useVisualSimulation = true) {
    if (!this.currentMatch) {
      throw new Error('No match prepared');
    }

    const match = this.currentMatch;
    
    // Finalize preparation
    this.finalizeMatchPreparation();
    
    // Create match controller
    const canvas = useVisualSimulation ? document.getElementById('pitch') : null;
    const matchController = new MatchController(
      match.homeTeam,
      match.awayTeam,
      this.gameState,
      canvas
    );

    // Apply our tactical setup
    this.applyTacticalSetup(matchController);
    
    match.status = 'in_progress';
    match.startTime = new Date();
    
    // Set up match event handlers
    const onEventCallback = (event, minute, score) => {
      this.handleMatchEvent(event, minute, score);
    };

    console.log(`🏁 Match started: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
    
    // Start the match
    if (useVisualSimulation && canvas) {
      return matchController.startVisualMatch(this.gameState.gameSpeed, onEventCallback);
    } else {
      return matchController.startSimulation(onEventCallback);
    }
  }

  /**
   * Handle live match events
   */
  handleMatchEvent(event, minute, score) {
    if (!this.currentMatch) return;

    // Log important events
    if (event.type === 'goal' || event.type === 'red_card' || event.type === 'injury') {
      console.log(`⚽ ${minute}' - ${event.type}: ${event.player?.name || 'Unknown'}`);
    }

    // Update live analysis
    this.updateLiveAnalysis(event, minute);

    // Trigger any automated responses
    this.handleAutomatedResponses(event, minute, score);
  }

  /**
   * Complete match and generate analysis
   */
  completeMatch(result) {
    if (!this.currentMatch) return;

    const match = this.currentMatch;
    match.status = 'completed';
    match.endTime = new Date();
    match.result = result;

    // Generate comprehensive post-match analysis
    this.analysisData = this.generatePostMatchAnalysis(result);
    
    // Update player conditions and development
    this.updatePlayerConditions(result);
    
    // Move to match history
    this.matchHistory.push({
      ...match,
      analysis: this.analysisData
    });

    // Remove from queue
    this.matchQueue = this.matchQueue.filter(m => m.id !== match.id);
    
    // Update game state
    this.gameState.completeMatch(result);
    
    // Reset current match
    this.currentMatch = null;
    this.preparation = {};

    console.log(`🏁 Match completed: ${result.homeTeam.name} ${result.homeScore}-${result.awayScore} ${result.awayTeam.name}`);
    
    return this.analysisData;
  }

  /**
   * Generate post-match analysis
   */
  generatePostMatchAnalysis(result) {
    const userTeam = this.gameState.userTeam;
    const isHome = result.homeTeam.id === userTeam.id;
    const userScore = isHome ? result.homeScore : result.awayScore;
    const opponentScore = isHome ? result.awayScore : result.homeScore;
    
    // Determine match result
    let matchResult;
    if (userScore > opponentScore) {
      matchResult = 'win';
    } else if (userScore < opponentScore) {
      matchResult = 'loss';
    } else {
      matchResult = 'draw';
    }
    
    const analysis = {
      matchResult: matchResult,
      performance: this.analyzeTeamPerformance(result),
      playerRatings: this.generatePlayerRatings(result),
      tacticalEffectiveness: this.analyzeTacticalEffectiveness(result),
      keyMoments: this.identifyKeyMoments(result),
      areasForImprovement: this.identifyImprovementAreas(result),
      nextMatchRecommendations: this.generateRecommendations(result)
    };

    return analysis;
  }

  /**
   * Analyze team performance
   */
  analyzeTeamPerformance(result) {
    // This would integrate with MatchStatistics for detailed analysis
    return {
      overall: this.calculateOverallPerformance(result),
      attack: Math.floor(Math.random() * 10) + 1, // Placeholder
      midfield: Math.floor(Math.random() * 10) + 1,
      defense: Math.floor(Math.random() * 10) + 1,
      goalkeeping: Math.floor(Math.random() * 10) + 1
    };
  }

  /**
   * Generate player ratings
   */
  generatePlayerRatings(result) {
    const ratings = {};
    
    this.preparation.startingXI.forEach(player => {
      ratings[player.id] = {
        rating: Math.max(1, Math.min(10, Math.floor(Math.random() * 6) + 5)),
        performance: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'][Math.floor(Math.random() * 5)],
        keyStats: this.generatePlayerKeyStats(player, result)
      };
    });

    return ratings;
  }

  /**
   * Generate tactical effectiveness analysis
   */
  analyzeTacticalEffectiveness(result) {
    return {
      formation: {
        effectiveness: Math.floor(Math.random() * 10) + 1,
        comments: 'Formation worked well in the first half but struggled after the opponent\'s changes.'
      },
      tactics: {
        effectiveness: Math.floor(Math.random() * 10) + 1,
        comments: 'Pressing was effective but left gaps in defense.'
      }
    };
  }

  /**
   * Helper methods
   */
  generateMatchId() {
    return `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  isUserTeamParticipating(homeTeam, awayTeam) {
    const userTeamId = this.gameState.userTeam?.id;
    return homeTeam.id === userTeamId || awayTeam.id === userTeamId;
  }

  sortMatchQueue() {
    this.matchQueue.sort((a, b) => a.date - b.date);
  }

  getUserTeamDefaultFormation() {
    return this.gameState.userTeam?.preferredFormation || '4-4-2';
  }

  getUserTeamDefaultTactics() {
    return {
      mentality: 'balanced',
      tempo: 'normal',
      pressing: 'medium',
      width: 'normal',
      passLength: 'mixed',
      creativity: 'normal'
    };
  }

  generateStartingXI(formation = '4-4-2') {
    if (!this.gameState.userTeam?.players) {
      return [];
    }

    const players = this.gameState.userTeam.players
      .filter(p => !p.injured && !p.suspended)
      .sort((a, b) => (b.overall || 0) - (a.overall || 0));

    const positions = this.getFormationPositions(formation);
    const startingXI = [];

    positions.forEach(position => {
      const availablePlayer = players.find(p => 
        p.position === position && 
        !startingXI.includes(p)
      );
      
      if (availablePlayer) {
        startingXI.push(availablePlayer);
      } else {
        // Find best alternative
        const alternative = players.find(p => !startingXI.includes(p));
        if (alternative) startingXI.push(alternative);
      }
    });

    return startingXI.slice(0, 11);
  }

  getFormationPositions(formation) {
    const formations = {
      '4-4-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],
      '4-3-3': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CM', 'RW', 'ST', 'LW'],
      '3-5-2': ['GK', 'CB', 'CB', 'CB', 'RM', 'CM', 'CM', 'CM', 'LM', 'ST', 'ST'],
      '4-2-3-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CDM', 'CAM', 'RM', 'LM', 'ST'],
      '5-3-2': ['GK', 'RB', 'CB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'ST', 'ST'],
      '4-5-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'CM', 'LM', 'ST']
    };

    return formations[formation] || formations['4-4-2'];
  }

  calculateTeamTalkEffect(type, intensity) {
    const baseEffects = {
      'motivational': { morale: 5, confidence: 3, aggression: 0 },
      'calm': { morale: 2, confidence: 4, aggression: -2 },
      'aggressive': { morale: 3, confidence: 2, aggression: 4 },
      'tactical': { morale: 1, confidence: 5, aggression: 0 },
      'confidence': { morale: 4, confidence: 5, aggression: 1 }
    };

    // Determine intensity multiplier
    let intensityMultiplier;
    if (intensity === 'low') {
      intensityMultiplier = 0.5;
    } else if (intensity === 'high') {
      intensityMultiplier = 1.5;
    } else {
      intensityMultiplier = 1.0;
    }
    
    const effect = baseEffects[type];

    return {
      morale: Math.round(effect.morale * intensityMultiplier),
      confidence: Math.round(effect.confidence * intensityMultiplier),
      aggression: Math.round(effect.aggression * intensityMultiplier)
    };
  }

  applyTeamTalkEffect(effect) {
    this.preparation.startingXI.forEach(player => {
      player.morale = Math.min(100, player.morale + effect.morale);
      player.confidence = Math.min(100, (player.confidence || 50) + effect.confidence);
    });
  }

  finalizeMatchPreparation() {
    const match = this.currentMatch;
    match.preparation.completed = true;
    
    // Apply final bonuses/penalties based on preparation quality
    const preparationScore = this.calculatePreparationScore();
    this.applyPreparationEffects(preparationScore);
  }

  calculatePreparationScore() {
    const prep = this.currentMatch.preparation;
    let score = 0;
    
    if (prep.teamTalkGiven) score += 25;
    if (prep.tacticSet) score += 25;
    if (prep.lineupConfirmed) score += 25;
    
    // Bonus for comprehensive preparation
    if (score === 75) score += 25;
    
    return score;
  }

  applyPreparationEffects(score) {
    if (score >= 75) {
      console.log('✅ Excellent preparation - team confidence boosted');
    } else if (score >= 50) {
      console.log('🔶 Good preparation - minor team boost');
    } else {
      console.log('⚠️ Poor preparation - team may struggle');
    }
  }

  applyTacticalSetup(matchController) {
    // Apply formation and tactics to the match controller
    // This would integrate with the MatchController's tactical systems
    console.log(`⚡ Applied ${this.preparation.formation} formation with ${this.preparation.tactics.mentality} mentality`);
  }

  updateLiveAnalysis(event, minute) {
    // Update real-time match analysis based on events
    // This could track possession, shots, tackles, etc.
  }

  handleAutomatedResponses(event, minute, score) {
    // Implement automated tactical changes based on match situation
    // For example, switch to defensive if leading late in the game
  }

  updatePlayerConditions(result) {
    // Update player fatigue, morale, confidence after match
    this.preparation.startingXI.forEach(player => {
      player.fatigue = Math.min(100, player.fatigue + 15 + Math.random() * 10);
      
      // Adjust morale based on result
      if (result.homeScore > result.awayScore && this.gameState.userTeam.id === result.homeTeam.id ||
          result.awayScore > result.homeScore && this.gameState.userTeam.id === result.awayTeam.id) {
        player.morale = Math.min(100, player.morale + 5);
      } else if (result.homeScore !== result.awayScore) {
        player.morale = Math.max(20, player.morale - 3);
      }
    });
  }

  calculateOverallPerformance(result) {
    const userTeam = this.gameState.userTeam;
    const isHome = result.homeTeam.id === userTeam.id;
    const userScore = isHome ? result.homeScore : result.awayScore;
    const opponentScore = isHome ? result.awayScore : result.homeScore;
    
    if (userScore > opponentScore) return 8 + Math.floor(Math.random() * 3);
    if (userScore === opponentScore) return 5 + Math.floor(Math.random() * 4);
    return 3 + Math.floor(Math.random() * 5);
  }

  generatePlayerKeyStats(player, result) {
    return {
      goals: Math.floor(Math.random() * 3),
      assists: Math.floor(Math.random() * 2),
      passes: 20 + Math.floor(Math.random() * 60),
      tackles: Math.floor(Math.random() * 8),
      saves: player.position === 'GK' ? Math.floor(Math.random() * 10) : 0
    };
  }

  identifyKeyMoments(result) {
    return [
      `${Math.floor(Math.random() * 90)}' - Key tackle prevented a certain goal`,
      `${Math.floor(Math.random() * 90)}' - Missed opportunity to take the lead`,
      `${Math.floor(Math.random() * 90)}' - Excellent save kept the score level`
    ];
  }

  identifyImprovementAreas(result) {
    return [
      'Finishing in the final third needs improvement',
      'Defensive positioning could be better',
      'More creativity needed in midfield'
    ];
  }

  generateRecommendations(result) {
    return [
      'Consider rotating squad for next match',
      'Work on set piece defending in training',
      'Focus on counter-attacking tactics'
    ];
  }
}
