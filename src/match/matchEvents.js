/**
 * MatchEvents - Generates and manages match events
 */
export class MatchEvents {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.events = [];
    
    // Event probabilities (per minute)
    this.eventProbabilities = {
      goal: 0.05,      // 5% chance per event check
      card: 0.08,      // 8% chance
      substitution: 0.03, // 3% chance (mainly after 60min)
      injury: 0.02,    // 2% chance
      shot: 0.15,      // 15% chance
      foul: 0.12,      // 12% chance
      corner: 0.08,    // 8% chance
      offside: 0.06    // 6% chance
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
    let cumulativeProbability = 0;
    
    // Adjust probabilities based on match context
    const adjustedProbabilities = { ...this.eventProbabilities };
    
    // More substitutions after 60 minutes
    if (minute > 60) {
      adjustedProbabilities.substitution *= 3;
    }
    
    // More goals in final 15 minutes
    if (minute > 75) {
      adjustedProbabilities.goal *= 1.5;
    }
    
    // Check each event type
    for (const [eventType, probability] of Object.entries(adjustedProbabilities)) {
      cumulativeProbability += probability;
      if (random < cumulativeProbability) {
        return eventType;
      }
    }
    
    return null;
  }

  createEvent(eventType, minute, matchState = {}) {
    const team = Math.random() < 0.5 ? 'home' : 'away';
    const teamData = team === 'home' ? this.homeTeam : this.awayTeam;
    const player = this.selectRandomPlayer(teamData);
    
    switch (eventType) {
      case 'goal':
        return this.createGoalEvent(team, player, minute);
        
      case 'card':
        const cardType = Math.random() < 0.8 ? 'yellow' : 'red';
        return this.createCardEvent(team, player, minute, cardType);
        
      case 'substitution':
        if (minute < 45) return null; // No subs before halftime usually
        const playerOff = this.selectRandomPlayer(teamData);
        const playerOn = this.selectRandomPlayer(teamData, [playerOff]);
        return this.createSubstitutionEvent(team, playerOff, playerOn, minute);
        
      case 'injury':
        const severity = Math.random() < 0.7 ? 'minor' : 'serious';
        return this.createInjuryEvent(team, player, minute, severity);
        
      case 'shot':
        const onTarget = Math.random() < 0.4;
        return this.createShotEvent(team, player, minute, onTarget);
        
      case 'foul':
        return this.createFoulEvent(team, player, minute);
        
      case 'corner':
        return this.createCornerEvent(team, minute);
        
      case 'offside':
        return this.createOffsideEvent(team, player, minute);
        
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
    return {
      events: [...this.events],
      goals: this.events.filter(event => event.type === 'goal'),
      cards: this.events.filter(event => event.type === 'card'),
      substitutions: this.events.filter(event => event.type === 'substitution'),
      keyEvents: this.events.filter(event => event.importance === 'high')
    };
  }

  getRecentEvents(count = 5) {
    return this.events.slice(-count);
  }

  clearEvents() {
    this.events = [];
  }
}
