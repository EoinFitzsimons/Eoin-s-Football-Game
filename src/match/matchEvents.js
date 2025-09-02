/**
 * MatchEvents - Generates and manages match events
 */
export class MatchEvents {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.events = [];
    
    // Realistic event probabilities based on actual football statistics
    // These are per-minute probabilities scaled to match realistic football frequency
    this.eventProbabilities = {
      // Goals: Average 2.7 goals per match = 0.03 per minute
      goal: 0.0333,
      
      // Shots: Average 24 shots per match = 0.267 per minute
      shot: 0.267,
      
      // Cards: Average 3.5 cards per match = 0.039 per minute
      yellowCard: 0.0333,
      redCard: 0.0056,
      
      // Fouls: Average 21 fouls per match = 0.233 per minute
      foul: 0.233,
      
      // Corners: Average 10 corners per match = 0.111 per minute
      corner: 0.111,
      
      // Offsides: Average 5 offsides per match = 0.056 per minute
      offside: 0.0556,
      
      // Substitutions: Average 6 subs per match, mostly after 45min
      substitution: 0.0667,
      
      // Injuries: Average 1-2 per match = 0.017 per minute
      injury: 0.0167
    };
    
    // Positional goal scoring probabilities (based on real data)
    this.goalProbabilityByPosition = {
      'GK': 0.001,    // 0.1% - very rare
      'CB': 0.05,     // 5% - headers from corners
      'RB': 0.03,     // 3% - occasional runs
      'LB': 0.03,     // 3% - occasional runs
      'DM': 0.08,     // 8% - long shots, set pieces
      'CM': 0.15,     // 15% - box-to-box goals
      'AM': 0.25,     // 25% - key position
      'RW': 0.20,     // 20% - cutting in, crossing
      'LW': 0.20,     // 20% - cutting in, crossing
      'ST': 0.45      // 45% - primary goalscorer
    };
    
    // Card probabilities by position (based on real data)
    this.cardProbabilityByPosition = {
      'GK': { yellow: 0.8, red: 0.2 },   // GKs get fewer cards but more serious
      'CB': { yellow: 0.85, red: 0.15 }, // Defenders get many tactical fouls
      'RB': { yellow: 0.9, red: 0.1 },   // Full backs commit professional fouls
      'LB': { yellow: 0.9, red: 0.1 },   
      'DM': { yellow: 0.88, red: 0.12 }, // Breaking up play
      'CM': { yellow: 0.9, red: 0.1 },   // Box-to-box challenges
      'AM': { yellow: 0.92, red: 0.08 }, // Fewer dangerous tackles
      'RW': { yellow: 0.95, red: 0.05 }, // Wingers rarely get reds
      'LW': { yellow: 0.95, red: 0.05 },
      'ST': { yellow: 0.9, red: 0.1 }    // Frustration fouls
    };
  }

  generateEvent(minute, matchState = {}) {
    // Weight events based on match context
    const eventType = this.selectEventType(minute, matchState);
    
    if (!eventType) return null;
    
    const event = this.createEvent(eventType, minute, matchState);
    
    if (event) {
      this.events.push(event);
    }
    
    return event;
  }

  selectEventType(minute, matchState) {
    const random = Math.random();
    
    // Adjust probabilities based on realistic match context
    const adjustedProbabilities = { ...this.eventProbabilities };
    
    // Time-based adjustments (based on real football statistics)
    if (minute <= 15) {
      // First 15 minutes: More cautious, fewer cards/goals
      adjustedProbabilities.goal *= 0.7;
      adjustedProbabilities.yellowCard *= 0.6;
      adjustedProbabilities.redCard *= 0.5;
      adjustedProbabilities.substitution = 0; // No early subs
    } else if (minute >= 75) {
      // Final 15 minutes: More goals, cards, and subs
      adjustedProbabilities.goal *= 1.4;
      adjustedProbabilities.yellowCard *= 1.3;
      adjustedProbabilities.redCard *= 1.2;
      adjustedProbabilities.substitution *= 2.5;
      adjustedProbabilities.injury *= 1.5; // Fatigue injuries
    } else if (minute >= 45 && minute <= 60) {
      // Half-time to 60min: Peak substitution period
      adjustedProbabilities.substitution *= 3;
    }
    
    // Score-based adjustments
    const scoreDiff = matchState.scoreDifference || 0;
    if (Math.abs(scoreDiff) >= 2) {
      // Blowout games: fewer events, more subs
      adjustedProbabilities.goal *= 0.8;
      adjustedProbabilities.substitution *= 1.5;
    } else if (scoreDiff === 0 && minute >= 80) {
      // Close games late: more urgent play
      adjustedProbabilities.goal *= 1.2;
      adjustedProbabilities.shot *= 1.3;
      adjustedProbabilities.foul *= 1.2;
    }
    
    // Team strength differential effects
    const strengthDiff = matchState.strengthDifference || 0;
    if (Math.abs(strengthDiff) > 10) {
      // Mismatched teams
      adjustedProbabilities.goal *= (1 + Math.abs(strengthDiff) * 0.01);
      adjustedProbabilities.foul *= 1.2; // Weaker team fouls more
    }
    
    // Check each event type with weighted probability
    let cumulativeProbability = 0;
    const eventTypes = [
      'goal', 'shot', 'foul', 'yellowCard', 'redCard', 
      'corner', 'offside', 'substitution', 'injury'
    ];
    
    for (const eventType of eventTypes) {
      cumulativeProbability += adjustedProbabilities[eventType] || 0;
      if (random < cumulativeProbability) {
        return eventType;
      }
    }
    
    return null;
  }

  createEvent(eventType, minute, matchState = {}) {
    const team = Math.random() < 0.5 ? 'home' : 'away';
    const teamData = team === 'home' ? this.homeTeam : this.awayTeam;
    const player = this.selectPlayerByEventType(teamData, eventType);
    
    switch (eventType) {
      case 'goal': {
        return this.createGoalEvent(team, player, minute);
      }
        
      case 'yellowCard': {
        return this.createCardEvent(team, player, minute, 'yellow');
      }
        
      case 'redCard': {
        return this.createCardEvent(team, player, minute, 'red');
      }
        
      case 'substitution': {
        if (minute < 45) return null; // No subs before halftime usually
        const playerOff = this.selectRandomPlayer(teamData);
        const playerOn = this.selectRandomPlayer(teamData, [playerOff]);
        return this.createSubstitutionEvent(team, playerOff, playerOn, minute);
      }
        
      case 'injury': {
        const severity = Math.random() < 0.7 ? 'minor' : 'serious';
        return this.createInjuryEvent(team, player, minute, severity);
      }
        
      case 'shot': {
        const onTarget = Math.random() < 0.4;
        return this.createShotEvent(team, player, minute, onTarget);
      }
        
      case 'foul': {
        return this.createFoulEvent(team, player, minute);
      }
        
      case 'corner': {
        return this.createCornerEvent(team, minute);
      }
        
      case 'offside': {
        return this.createOffsideEvent(team, player, minute);
      }
        
      default:
        return null;
    }
  }

  createGoalEvent(team, player, minute) {
    return {
      type: 'goal',
      team: team,
      player: player,
      minute: minute,
      description: `⚽ GOAL! ${player} scores for ${team === 'home' ? this.homeTeam.name : this.awayTeam.name}!`,
      importance: 'high'
    };
  }

  createCardEvent(team, player, minute, cardType) {
    const cardEmoji = cardType === 'yellow' ? '🟨' : '🟥';
    return {
      type: 'card',
      cardType: cardType,
      team: team,
      player: player,
      minute: minute,
      description: `${cardEmoji} ${cardType.toUpperCase()} CARD for ${player} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`,
      importance: cardType === 'red' ? 'high' : 'medium'
    };
  }

  createSubstitutionEvent(team, playerOff, playerOn, minute) {
    return {
      type: 'substitution',
      team: team,
      playerOff: playerOff,
      playerOn: playerOn,
      minute: minute,
      description: `🔄 SUB: ${playerOn} replaces ${playerOff} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`,
      importance: 'low'
    };
  }

  createInjuryEvent(team, player, minute, severity) {
    return {
      type: 'injury',
      team: team,
      player: player,
      minute: minute,
      severity: severity,
      description: `🚑 ${player} is injured (${severity}) - ${team === 'home' ? this.homeTeam.name : this.awayTeam.name}`,
      importance: severity === 'serious' ? 'high' : 'medium'
    };
  }

  createShotEvent(team, player, minute, onTarget) {
    const emoji = onTarget ? '🎯' : '⚽';
    const targetText = onTarget ? 'on target' : 'off target';
    return {
      type: 'shot',
      team: team,
      player: player,
      minute: minute,
      onTarget: onTarget,
      description: `${emoji} Shot ${targetText} by ${player} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`,
      importance: 'low'
    };
  }

  createFoulEvent(team, player, minute) {
    return {
      type: 'foul',
      team: team,
      player: player,
      minute: minute,
      description: `💥 Foul by ${player} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`,
      importance: 'low'
    };
  }

  createCornerEvent(team, minute) {
    return {
      type: 'corner',
      team: team,
      minute: minute,
      description: `📐 Corner kick for ${team === 'home' ? this.homeTeam.name : this.awayTeam.name}`,
      importance: 'low'
    };
  }

  createOffsideEvent(team, player, minute) {
    return {
      type: 'offside',
      team: team,
      player: player,
      minute: minute,
      description: `🚩 Offside! ${player} (${team === 'home' ? this.homeTeam.name : this.awayTeam.name})`,
      importance: 'low'
    };
  }

  /**
   * Select player based on event type and realistic probabilities
   */
  selectPlayerByEventType(teamData, eventType) {
    const players = teamData.players.slice(0, 11); // Starting XI only
    
    switch (eventType) {
      case 'goal': {
        return this.selectPlayerByProbability(players, this.goalProbabilityByPosition);
      }
      
      case 'yellowCard':
      case 'redCard': {
        // Cards more likely for defenders and defensive midfielders
        const cardWeights = {};
        players.forEach(player => {
          const baseWeight = {
            'GK': 0.05, 'CB': 0.25, 'RB': 0.15, 'LB': 0.15,
            'DM': 0.20, 'CM': 0.12, 'AM': 0.08, 'RW': 0.06, 'LW': 0.06, 'ST': 0.08
          }[player.position] || 0.1;
          
          cardWeights[player.id] = baseWeight * (1 + (player.attributes.aggression || 50) * 0.01);
        });
        
        return this.selectPlayerByWeights(players, cardWeights);
      }
      
      case 'shot': {
        // Shots weighted towards attacking players
        const shotWeights = {};
        players.forEach(player => {
          shotWeights[player.id] = {
            'GK': 0.01, 'CB': 0.05, 'RB': 0.08, 'LB': 0.08,
            'DM': 0.12, 'CM': 0.15, 'AM': 0.25, 'RW': 0.20, 'LW': 0.20, 'ST': 0.35
          }[player.position] || 0.1;
        });
        
        return this.selectPlayerByWeights(players, shotWeights);
      }
      
      case 'foul': {
        // Fouls weighted by aggression and position
        const foulWeights = {};
        players.forEach(player => {
          const positionWeight = {
            'GK': 0.03, 'CB': 0.20, 'RB': 0.15, 'LB': 0.15,
            'DM': 0.25, 'CM': 0.15, 'AM': 0.08, 'RW': 0.10, 'LW': 0.10, 'ST': 0.09
          }[player.position] || 0.1;
          
          foulWeights[player.id] = positionWeight * (1 + (player.attributes.aggression || 50) * 0.015);
        });
        
        return this.selectPlayerByWeights(players, foulWeights);
      }
      
      case 'offside': {
        // Offsides only for attacking players
        const offensivePlayers = players.filter(p => 
          ['AM', 'RW', 'LW', 'ST'].includes(p.position)
        );
        
        if (offensivePlayers.length === 0) return this.selectRandomPlayer(teamData);
        return offensivePlayers[Math.floor(Math.random() * offensivePlayers.length)];
      }
      
      default:
        return this.selectRandomPlayer(teamData);
    }
  }
  
  selectPlayerByProbability(players, probabilities) {
    const weighted = players.map(player => ({
      player,
      weight: probabilities[player.position] || 0.1
    }));
    
    return this.selectPlayerByWeights(players, 
      Object.fromEntries(weighted.map(w => [w.player.id, w.weight]))
    );
  }
  
  selectPlayerByWeights(players, weights) {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (const player of players) {
      const weight = weights[player.id] || 0;
      random -= weight;
      if (random <= 0) {
        return player.name || `Player ${player.position}`;
      }
    }
    
    // Fallback
    return players[0]?.name || 'Player';
  }

  selectRandomPlayer(teamData, excludeList = []) {
    // Get available players (excluding those in excludeList)
    const availablePlayers = teamData.players.filter(player => 
      !excludeList.includes(player.name)
    );
    
    if (availablePlayers.length === 0) {
      // Fallback to generate a generic player name
      return `Player ${Math.floor(Math.random() * 11) + 1}`;
    }
    
    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    return randomPlayer.name || `Player ${Math.floor(Math.random() * 11) + 1}`;
  }

  getMatchSummary() {
    const goals = this.events.filter(event => event.type === 'goal');
    
    return {
      events: [...this.events],
      goals: goals,
      cards: this.events.filter(event => event.type === 'card'),
      substitutions: this.events.filter(event => event.type === 'substitution'),
      keyEvents: this.events.filter(event => event.importance === 'high'),
      goalScorers: {
        home: goals.filter(goal => goal.team === 'home').map(goal => ({
          player: goal.player,
          minute: goal.minute
        })),
        away: goals.filter(goal => goal.team === 'away').map(goal => ({
          player: goal.player,
          minute: goal.minute
        }))
      }
    };
  }

  getRecentEvents(count = 5) {
    return this.events.slice(-count);
  }

  clearEvents() {
    this.events = [];
  }
}
