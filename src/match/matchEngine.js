/**
 * 2D Football Match Engine - Realistic Football Simulation
 * Handles tactical formations, player positioning, and realistic ball physics
 */

export class MatchEngine {
  constructor(homeTeam, awayTeam, canvas, gameState = null) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.gameState = gameState;
    
    // Match state
    this.players = [];
    this.ball = { 
      x: this.width/2, 
      y: this.height/2, 
      vx: 0, 
      vy: 0,
      possessionTeam: null,
      possessionPlayer: null,
      inPlay: true
    };
    this.score = [0, 0];
    this.time = 0;
    this.maxTime = 90 * 60; // 90 minutes in seconds
    
    // Tactical systems
    this.formations = {
      home: this.parseFormation(homeTeam.formation || '4-4-2'),
      away: this.parseFormation(awayTeam.formation || '4-4-2')
    };
    
    this.tactics = {
      home: homeTeam.tactics || this.getDefaultTactics(),
      away: awayTeam.tactics || this.getDefaultTactics()
    };
    
    // Match dynamics
    this.possession = { home: 50, away: 50 };
    this.momentum = 0; // -100 (away) to +100 (home)
    this.pressure = { home: 50, away: 50 };
    this.matchEvents = [];
    
    this.initializePlayers();
    this.setupTacticalPositions();
  }

  parseFormation(formationString) {
    // Parse formations like "4-4-2" into position arrays
    const parts = formationString.split('-').map(Number);
    const positions = [1]; // Always 1 GK
    positions.push(...parts);
    
    return {
      string: formationString,
      lines: positions,
      totalOutfield: parts.reduce((a, b) => a + b, 0)
    };
  }

  getDefaultTactics() {
    return {
      mentality: 'balanced',     // defensive, balanced, attacking
      width: 'normal',          // narrow, normal, wide
      tempo: 'normal',          // slow, normal, fast
      pressing: 'medium',       // low, medium, high
      passingStyle: 'mixed',    // direct, mixed, possession
      defensiveLine: 'normal',   // deep, normal, high
      attacking: {
        style: 'balanced',      // counter, balanced, possession
        width: 'normal',
        crossingFrequency: 'normal'
      }
    };
  }

  initializePlayers() {
    this.players = [];
    
    // Initialize home team players
    this.homeTeam.players.slice(0, 11).forEach((player, index) => {
      this.players.push({
        ...player,
        teamIndex: 0,
        matchIndex: index,
        x: 100,
        y: 100 + (index * 50),
        targetX: 100,
        targetY: 100 + (index * 50),
        stamina: 100,
        effectiveness: this.calculatePlayerEffectiveness(player),
        role: this.getPlayerRole(player.position, index),
        instructions: this.getPlayerInstructions(player.position, this.tactics.home)
      });
    });
    
    // Initialize away team players  
    this.awayTeam.players.slice(0, 11).forEach((player, index) => {
      this.players.push({
        ...player,
        teamIndex: 1,
        matchIndex: index,
        x: this.width - 100,
        y: 100 + (index * 50),
        targetX: this.width - 100,
        targetY: 100 + (index * 50),
        stamina: 100,
        effectiveness: this.calculatePlayerEffectiveness(player),
        role: this.getPlayerRole(player.position, index),
        instructions: this.getPlayerInstructions(player.position, this.tactics.away)
      });
    });
  }

  calculatePlayerEffectiveness(player) {
    // Calculate current effectiveness based on form, fatigue, morale, fitness
    let effectiveness = 70; // Base effectiveness
    
    effectiveness += (player.form || 50) * 0.4;           // Form impact: 0-40
    effectiveness -= (player.fatigue || 0) * 0.3;         // Fatigue impact: 0-30
    effectiveness += (player.morale || 50) * 0.2;         // Morale impact: 0-20  
    effectiveness += (player.fitness || 100) * 0.1;       // Fitness impact: 0-10
    effectiveness -= (player.injuryRisk || 0) * 0.5;      // Injury risk impact
    
    return Math.max(10, Math.min(100, effectiveness));
  }

  getPlayerRole(position, index) {
    const roles = {
      'GK': ['Goalkeeper'],
      'CB': ['Centre-Back', 'Ball-Playing Defender', 'Stopper'],
      'RB': ['Full-Back', 'Wing-Back', 'Inverted Wing-Back'],
      'LB': ['Full-Back', 'Wing-Back', 'Inverted Wing-Back'],
      'DM': ['Defensive Midfielder', 'Deep Lying Playmaker', 'Anchor'],
      'CM': ['Central Midfielder', 'Box-to-Box', 'Playmaker'],
      'AM': ['Attacking Midfielder', 'Trequartista', 'False 9'],
      'RW': ['Winger', 'Inside Forward', 'Wide Midfielder'],
      'LW': ['Winger', 'Inside Forward', 'Wide Midfielder'],
      'ST': ['Striker', 'Target Man', 'False 9', 'Poacher']
    };
    
    const positionRoles = roles[position] || ['Default'];
    return positionRoles[index % positionRoles.length];
  }

  getPlayerInstructions(position, tactics) {
    const baseInstructions = {
      attacking: tactics.mentality === 'attacking',
      defensive: tactics.mentality === 'defensive',
      pressing: tactics.pressing,
      passingStyle: tactics.passingStyle,
      width: tactics.width
    };
    
    // Position-specific instructions
    switch(position) {
      case 'GK':
        return { ...baseInstructions, distribution: 'mixed', sweeping: 'occasional' };
      case 'CB':
        return { ...baseInstructions, marking: 'tight', aerial: 'aggressive' };
      case 'RB': case 'LB':
        return { ...baseInstructions, overlap: tactics.width === 'wide', crossing: 'often' };
      case 'DM':
        return { ...baseInstructions, screening: 'always', longPassing: 'mixed' };
      case 'CM':
        return { ...baseInstructions, roaming: 'yes', supporting: 'balanced' };
      case 'AM':
        return { ...baseInstructions, creativity: 'high', shooting: 'often' };
      case 'RW': case 'LW':
        return { ...baseInstructions, cutting: 'mixed', tracking: 'normal' };
      case 'ST':
        return { ...baseInstructions, movement: 'active', finishing: 'clinical' };
      default:
        return baseInstructions;
    }
  }

  setupTacticalPositions() {
    // Set up realistic tactical positions based on formations
    this.positionPlayersInFormation();
  }

  positionPlayersInFormation() {
    const homeFormation = this.formations.home;
    const awayFormation = this.formations.away;
    
    // Home team positioning (left side)
    const homePositions = this.calculateFormationPositions(homeFormation, true);
    this.players.filter(p => p.teamIndex === 0).forEach((player, index) => {
      if (homePositions[index]) {
        player.targetX = homePositions[index].x;
        player.targetY = homePositions[index].y;
        player.formationX = homePositions[index].x;
        player.formationY = homePositions[index].y;
      }
    });
    
    // Away team positioning (right side)  
    const awayPositions = this.calculateFormationPositions(awayFormation, false);
    this.players.filter(p => p.teamIndex === 1).forEach((player, index) => {
      if (awayPositions[index]) {
        player.targetX = awayPositions[index].x;
        player.targetY = awayPositions[index].y;
        player.formationX = awayPositions[index].x;
        player.formationY = awayPositions[index].y;
      }
    });
  }

  calculateFormationPositions(formation, isHome) {
    const positions = [];
    const lines = formation.lines;
    const fieldWidth = this.width;
    const fieldHeight = this.height;
    const sideOffset = isHome ? 0.15 : 0.85; // Home starts at 15%, away at 85%
    
    let playerIndex = 0;
    
    // Goalkeeper
    positions.push({
      x: fieldWidth * (isHome ? 0.05 : 0.95),
      y: fieldHeight * 0.5
    });
    playerIndex++;
    
    // Outfield players by formation lines
    for (let lineIndex = 0; lineIndex < lines.length - 1; lineIndex++) { // Skip GK line
      const playersInLine = lines[lineIndex + 1];
      const lineX = fieldWidth * (isHome ? 
        (0.15 + (lineIndex * 0.2)) : 
        (0.85 - (lineIndex * 0.2))
      );
      
      for (let playerInLine = 0; playerInLine < playersInLine; playerInLine++) {
        const spacing = fieldHeight / (playersInLine + 1);
        const playerY = spacing * (playerInLine + 1);
        
        positions.push({
          x: lineX,
          y: playerY
        });
        playerIndex++;
      }
    }
    
    return positions;
  }

  update() {
    // Update match time
    this.time++;
    
    // Update match dynamics
    this.updateMatchDynamics();
    
    // Update player positions and behaviors
    this.updatePlayers();
    
    // Update ball physics
    this.updateBall();
    
    // Check for events
    this.checkMatchEvents();
    
    // Update tactical adjustments
    if (this.time % 300 === 0) { // Every 5 minutes
      this.updateTacticalPositioning();
    }
  }

  updateMatchDynamics() {
    // Update possession based on player actions and ball control
    const ballController = this.getBallController();
    if (ballController) {
      const team = ballController.teamIndex;
      this.possession.home += (team === 0 ? 0.1 : -0.1);
      this.possession.away += (team === 1 ? 0.1 : -0.1);
      
      // Normalize possession to 100%
      const total = this.possession.home + this.possession.away;
      this.possession.home = (this.possession.home / total) * 100;
      this.possession.away = (this.possession.away / total) * 100;
    }
    
    // Update momentum based on recent events and field position
    const ballX = this.ball.x;
    const fieldThird = this.width / 3;
    
    if (ballX < fieldThird) {
      this.momentum = Math.max(-100, this.momentum - 0.1); // Away attacking
    } else if (ballX > fieldThird * 2) {
      this.momentum = Math.min(100, this.momentum + 0.1);  // Home attacking
    }
    
    // Update pressure based on tactics and score
    const scoreDiff = this.score[0] - this.score[1];
    this.pressure.home += scoreDiff < 0 ? 0.1 : -0.05;  // Losing team presses more
    this.pressure.away += scoreDiff > 0 ? 0.1 : -0.05;
    
    this.pressure.home = Math.max(20, Math.min(80, this.pressure.home));
    this.pressure.away = Math.max(20, Math.min(80, this.pressure.away));
  }

  updatePlayers() {
    this.players.forEach(player => {
      // Update stamina
      player.stamina = Math.max(0, player.stamina - 0.01);
      
      // Update effectiveness based on stamina
      if (player.stamina < 50) {
        player.effectiveness *= 0.95;
      }
      
      // Calculate target position based on role and match state
      const target = this.calculatePlayerTarget(player);
      player.targetX = target.x;
      player.targetY = target.y;
      
      // Move towards target position
      const moveSpeed = this.calculateMoveSpeed(player);
      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance > 5) {
        player.x += (dx / distance) * moveSpeed;
        player.y += (dy / distance) * moveSpeed;
      }
      
      // Keep players on field
      player.x = Math.max(10, Math.min(this.width - 10, player.x));
      player.y = Math.max(10, Math.min(this.height - 10, player.y));
    });
  }

  calculatePlayerTarget(player) {
    const ballDistance = Math.hypot(this.ball.x - player.x, this.ball.y - player.y);
    const isNearBall = ballDistance < 100;
    const hasPossession = this.ball.possessionPlayer === player;
    
    // Base position from formation
    let targetX = player.formationX;
    let targetY = player.formationY;
    
    // Adjust based on ball position and role
    if (isNearBall || hasPossession) {
      // Move closer to action
      targetX += (this.ball.x - targetX) * 0.3;
      targetY += (this.ball.y - targetY) * 0.3;
    }
    
    // Role-specific positioning
    switch(player.position) {
      case 'CB':
        // Center backs stay deeper, track attacking runs
        targetY = player.formationY;
        if (this.ball.x > this.width * 0.7) {
          targetX = Math.min(targetX + 50, this.width * 0.4);
        }
        break;
        
      case 'RB': case 'LB':
        // Full backs overlap when attacking
        if (player.instructions.overlap && this.ball.x > this.width * 0.6) {
          targetX = Math.min(targetX + 100, this.width * 0.8);
        }
        break;
        
      case 'DM':
        // Defensive midfielder screens defense
        targetX = Math.max(targetX, this.ball.x - 100);
        break;
        
      case 'ST':
        // Striker makes runs when team has possession
        if (this.ball.possessionTeam === player.teamIndex) {
          targetX = Math.max(targetX + 50, this.width * 0.8);
        }
        break;
    }
    
    return { x: targetX, y: targetY };
  }

  calculateMoveSpeed(player) {
    let baseSpeed = (player.attributes.pace || 50) * 0.1;
    
    // Adjust for stamina
    baseSpeed *= (player.stamina / 100);
    
    // Adjust for effectiveness
    baseSpeed *= (player.effectiveness / 100);
    
    // Position-specific speeds
    switch(player.position) {
      case 'GK':
        baseSpeed *= 0.7; // Goalkeepers move slower
        break;
      case 'CB':
        baseSpeed *= 0.8; // Center backs are typically slower
        break;
      case 'RW': case 'LW':
        baseSpeed *= 1.2; // Wingers are faster
        break;
    }
    
    return Math.max(0.5, Math.min(3, baseSpeed));
  }

  updateBall() {
    // Apply physics
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.vx *= 0.95; // Friction
    this.ball.vy *= 0.95;
    
    // Ball boundaries
    if (this.ball.x < 0 || this.ball.x > this.width) {
      this.checkGoalScored();
    }
    
    if (this.ball.y < 0) {
      this.ball.y = 0;
      this.ball.vy = -this.ball.vy * 0.8;
    }
    if (this.ball.y > this.height) {
      this.ball.y = this.height;
      this.ball.vy = -this.ball.vy * 0.8;
    }
    
    // Update possession
    this.updateBallPossession();
  }

  updateBallPossession() {
    let closestPlayer = null;
    let closestDistance = Infinity;
    
    // Find closest player to ball
    this.players.forEach(player => {
      const distance = Math.hypot(this.ball.x - player.x, this.ball.y - player.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });
    
    // Update possession if player is close enough
    if (closestDistance < 30) {
      this.ball.possessionPlayer = closestPlayer;
      this.ball.possessionTeam = closestPlayer.teamIndex;
      
      // Player controls ball movement
      if (Math.hypot(this.ball.vx, this.ball.vy) < 1) {
        this.decidePlayerAction(closestPlayer);
      }
    } else {
      this.ball.possessionPlayer = null;
      if (closestDistance > 50) {
        this.ball.possessionTeam = null;
      }
    }
  }

  decidePlayerAction(player) {
    // Use player's decision making from complex attribute system
    const context = {
      pressure: this.calculatePressureOnPlayer(player),
      distanceToGoal: this.calculateDistanceToGoal(player),
      teammates: this.getNearbyTeammates(player),
      opponents: this.getNearbyOpponents(player),
      instructions: player.instructions,
      matchMinute: Math.floor(this.time / 60),
      isBigMatch: this.gameState?.importance === 'high',
      ballHeight: 0, // Assuming ground level
      isGK: player.position === 'GK'
    };
    
    const action = player.decideAction ? player.decideAction(context) : this.getSimpleAction(player, context);
    this.executePlayerAction(player, action, context);
  }

  getSimpleAction(player, context) {
    // Simplified decision making if complex system not available
    if (context.distanceToGoal < 200 && Math.random() < 0.3) return 'shoot';
    if (context.teammates.length > 0 && Math.random() < 0.6) return 'pass';
    if (context.pressure > 70) return 'clear';
    return 'hold';
  }

  executePlayerAction(player, action, context) {
    switch(action) {
      case 'shoot':
        this.executeShot(player, context);
        break;
      case 'pass':
        this.executePass(player, context);
        break;
      case 'dribble':
        this.executeDribble(player, context);
        break;
      case 'cross':
        this.executeCross(player, context);
        break;
      case 'clear':
        this.executeClearance(player, context);
        break;
      case 'tackle':
        this.executeTackle(player, context);
        break;
      default:
        this.executeHold(player);
    }
  }

  executeShot(player, context) {
    const shotPower = (player.attributes.shotpower || 50) * 0.1;
    const shotAccuracy = (player.attributes.shotaccuracy || 50) / 100;
    
    // Calculate target (goal)
    const goalX = player.teamIndex === 0 ? this.width : 0;
    const goalY = this.height / 2;
    
    const dx = goalX - this.ball.x;
    const dy = goalY - this.ball.y + (Math.random() - 0.5) * 100 * (1 - shotAccuracy);
    const distance = Math.hypot(dx, dy);
    
    this.ball.vx = (dx / distance) * shotPower;
    this.ball.vy = (dy / distance) * shotPower;
    
    console.log(`⚽ Shot by ${player.name}!`);
  }

  executePass(player, context) {
    if (context.teammates.length === 0) return;
    
    const target = context.teammates[Math.floor(Math.random() * context.teammates.length)];
    const passPower = Math.min(5, Math.hypot(target.x - this.ball.x, target.y - this.ball.y) * 0.05);
    
    const dx = target.x - this.ball.x;
    const dy = target.y - this.ball.y;
    const distance = Math.hypot(dx, dy);
    
    this.ball.vx = (dx / distance) * passPower;
    this.ball.vy = (dy / distance) * passPower;
  }

  executeDribble(player, context) {
    // Dribble towards goal
    const goalX = player.teamIndex === 0 ? this.width : 0;
    const dx = goalX > this.ball.x ? 1 : -1;
    
    this.ball.vx = dx * 2;
    this.ball.vy += (Math.random() - 0.5) * 2;
  }

  executeCross(player, context) {
    // Cross to penalty area
    const targetX = player.teamIndex === 0 ? this.width * 0.85 : this.width * 0.15;
    const targetY = this.height * (0.3 + Math.random() * 0.4);
    
    const dx = targetX - this.ball.x;
    const dy = targetY - this.ball.y;
    const distance = Math.hypot(dx, dy);
    
    this.ball.vx = (dx / distance) * 4;
    this.ball.vy = (dy / distance) * 4;
  }

  executeClearance(player, context) {
    // Clear away from goal
    const ownGoalX = player.teamIndex === 0 ? 0 : this.width;
    const dx = this.ball.x > ownGoalX ? 1 : -1;
    
    this.ball.vx = dx * 5;
    this.ball.vy = (Math.random() - 0.5) * 3;
  }

  executeTackle(player, context) {
    // Attempt to win ball from opponent
    if (context.opponents.length > 0) {
      const opponent = context.opponents[0];
      if (Math.hypot(opponent.x - player.x, opponent.y - player.y) < 20) {
        // Successful tackle
        this.ball.possessionPlayer = player;
        this.ball.possessionTeam = player.teamIndex;
      }
    }
  }

  executeHold(player) {
    // Hold possession, slow ball movement
    this.ball.vx *= 0.8;
    this.ball.vy *= 0.8;
  }

  calculatePressureOnPlayer(player) {
    const nearbyOpponents = this.getNearbyOpponents(player);
    return Math.min(100, nearbyOpponents.length * 25);
  }

  calculateDistanceToGoal(player) {
    const goalX = player.teamIndex === 0 ? this.width : 0;
    const goalY = this.height / 2;
    return Math.hypot(goalX - player.x, goalY - player.y);
  }

  getNearbyTeammates(player) {
    return this.players.filter(p => 
      p.teamIndex === player.teamIndex && 
      p.id !== player.id &&
      Math.hypot(p.x - player.x, p.y - player.y) < 150
    );
  }

  getNearbyOpponents(player) {
    return this.players.filter(p => 
      p.teamIndex !== player.teamIndex &&
      Math.hypot(p.x - player.x, p.y - player.y) < 100
    );
  }

  getBallController() {
    return this.ball.possessionPlayer;
  }

  checkGoalScored() {
    const goalWidth = this.height * 0.3;
    const goalTop = (this.height - goalWidth) / 2;
    const goalBottom = goalTop + goalWidth;

    // Left goal (home team defends)
    if (this.ball.x <= 0 && this.ball.y >= goalTop && this.ball.y <= goalBottom) {
      this.score[1] += 1;
      this.resetAfterGoal(1);
      console.log(`⚽ GOAL! Away team scores! ${this.score[0]}-${this.score[1]}`);
    }
    // Right goal (away team defends) 
    else if (this.ball.x >= this.width && this.ball.y >= goalTop && this.ball.y <= goalBottom) {
      this.score[0] += 1;
      this.resetAfterGoal(0);
      console.log(`⚽ GOAL! Home team scores! ${this.score[0]}-${this.score[1]}`);
    }
  }

  checkMatchEvents() {
    // Check for various match events based on realistic probabilities
    if (Math.random() < 0.001) { // 0.1% chance per update
      this.generateMatchEvent();
    }
  }

  generateMatchEvent() {
    const events = ['foul', 'card', 'injury', 'substitution'];
    const eventType = events[Math.floor(Math.random() * events.length)];
    
    switch(eventType) {
      case 'foul':
        console.log('⚠️ Foul committed');
        break;
      case 'card':
        console.log('🟨 Card shown');
        break;
      case 'injury':
        console.log('🚑 Player injury');
        break;
      case 'substitution':
        console.log('🔄 Substitution');
        break;
    }
  }

  updateTacticalPositioning() {
    // Adjust formation based on score and time
    const scoreDiff = this.score[0] - this.score[1];
    const minutesPlayed = Math.floor(this.time / 60);
    
    // Losing team becomes more attacking in final 20 minutes
    if (minutesPlayed > 70) {
      if (scoreDiff < 0) {
        this.adjustTactics(this.homeTeam, 'more_attacking');
      } else if (scoreDiff > 0) {
        this.adjustTactics(this.awayTeam, 'more_attacking');
      }
    }
    
    // Winning team becomes more defensive in final 10 minutes
    if (minutesPlayed > 80) {
      if (scoreDiff > 0) {
        this.adjustTactics(this.homeTeam, 'more_defensive');
      } else if (scoreDiff < 0) {
        this.adjustTactics(this.awayTeam, 'more_defensive');
      }
    }
  }

  adjustTactics(team, adjustment) {
    const isHome = team === this.homeTeam;
    const tactics = isHome ? this.tactics.home : this.tactics.away;
    
    switch(adjustment) {
      case 'more_attacking':
        tactics.mentality = 'attacking';
        tactics.pressing = 'high';
        tactics.defensiveLine = 'high';
        break;
      case 'more_defensive':
        tactics.mentality = 'defensive';
        tactics.pressing = 'low';
        tactics.defensiveLine = 'deep';
        break;
    }
    
    // Recalculate positions
    this.positionPlayersInFormation();
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw field
    this.drawField();
    
    // Draw players
    this.drawPlayers();
    
    // Draw ball
    this.drawBall();
    
    // Draw UI
    this.drawMatchUI();
  }

  drawField() {
    // Green field
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Field lines
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    
    // Center line
    this.ctx.beginPath();
    this.ctx.moveTo(this.width / 2, 0);
    this.ctx.lineTo(this.width / 2, this.height);
    this.ctx.stroke();
    
    // Center circle
    this.ctx.beginPath();
    this.ctx.arc(this.width / 2, this.height / 2, 50, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Penalty areas
    const penaltyWidth = 120;
    const penaltyHeight = 200;
    
    // Left penalty area
    this.ctx.strokeRect(0, (this.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
    
    // Right penalty area
    this.ctx.strokeRect(this.width - penaltyWidth, (this.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
    
    // Goals
    const goalHeight = this.height * 0.3;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, (this.height - goalHeight) / 2, 10, goalHeight);
    this.ctx.fillRect(this.width - 10, (this.height - goalHeight) / 2, 10, goalHeight);
  }

  drawPlayers() {
    this.players.forEach(player => {
      // Player circle
      this.ctx.beginPath();
      this.ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
      this.ctx.fillStyle = player.teamIndex === 0 ? '#ff0000' : '#0000ff';
      this.ctx.fill();
      this.ctx.strokeStyle = '#000000';
      this.ctx.stroke();
      
      // Player name
      this.ctx.fillStyle = '#000000';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(player.name.split(' ')[0], player.x - 15, player.y - 12);
    });
  }

  drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
    this.ctx.strokeStyle = '#000000';
    this.ctx.stroke();
  }

  drawMatchUI() {
    // Score
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(`${this.score[0]} - ${this.score[1]}`, this.width / 2 - 20, 30);
    
    // Time
    const minutes = Math.floor(this.time / 60);
    this.ctx.font = '18px Arial';
    this.ctx.fillText(`${minutes}'`, this.width / 2 - 10, 55);
    
    // Possession
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`Possession: ${Math.round(this.possession.home)}% - ${Math.round(this.possession.away)}%`, 10, this.height - 10);
  }

  resetAfterGoal(scoringTeam) {
    // Reset ball to center
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.possessionPlayer = null;
    this.ball.possessionTeam = null;
    
    // Reset player positions
    this.positionPlayersInFormation();
    
    // Update momentum
    this.momentum += scoringTeam === 0 ? 20 : -20;
    this.momentum = Math.max(-100, Math.min(100, this.momentum));
  }

  // Legacy compatibility
  playStep() {
    this.update();
    this.draw();
  }
}
