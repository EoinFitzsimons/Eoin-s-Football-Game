/**
 * Match Controller - Orchestrates complete match experience
 * Integrates match engine, events, statistics, and UI
 * Handles full 90-minute simulation with post-match processing
 */

import { MatchEngine } from './matchEngine.js';
import { MatchEvents } from './matchEvents.js';
import { MatchStatistics } from './matchStatistics.js';
import { MatchResults } from './matchResults.js';

export class MatchController {
  constructor(homeTeam, awayTeam, gameState, canvas = null) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.gameState = gameState;
    this.canvas = canvas;
    
    // Initialize match systems
    this.matchEngine = canvas ? new MatchEngine(homeTeam, awayTeam, canvas, gameState) : null;
    this.matchEvents = new MatchEvents(homeTeam, awayTeam);
    this.matchStats = new MatchStatistics(homeTeam, awayTeam);
    this.matchResults = new MatchResults(homeTeam, awayTeam);
    
    // Match state
    this.isActive = false;
    this.isPaused = false;
    this.currentMinute = 0;
    this.score = [0, 0];
    this.matchSpeed = 1;
    this.animationFrameId = null;
    this.eventCallback = null;
    
    // Timers and intervals
    this.matchTimer = null;
    this.eventTimer = null;
  }

  /**
   * Start a visual match with animation
   */
  startVisualMatch(speedMultiplier = 1, onEventCallback = null) {
    if (!this.canvas || !this.matchEngine) {
      throw new Error('Canvas required for visual match');
    }

    this.matchSpeed = speedMultiplier;
    this.eventCallback = onEventCallback;
    this.isActive = true;
    
    console.log(`🎮 Starting visual match: ${this.homeTeam.name} vs ${this.awayTeam.name}`);
    
    this.startMatchLoop();
    this.startEventGeneration();
    
    return this;
  }

  /**
   * Start a simulation-only match (no visuals)
   */
  startSimulation(onEventCallback = null) {
    this.eventCallback = onEventCallback;
    this.isActive = true;
    
    console.log(`⚡ Simulating match: ${this.homeTeam.name} vs ${this.awayTeam.name}`);
    
    this.runSimulation();
    
    return this;
  }

  /**
   * Main match loop for visual matches
   */
  startMatchLoop() {
    const loop = () => {
      if (!this.isActive) return;
      
      if (!this.isPaused) {
        // Run multiple updates based on speed
        for (let i = 0; i < this.matchSpeed; i++) {
          if (this.currentMinute < 90 && this.isActive) {
            this.matchEngine.update();
            this.updateMatchTime();
            this.matchEngine.draw();
          }
        }
        
        // Check if match finished
        if (this.currentMinute >= 90) {
          this.endMatch();
          return;
        }
      }
      
      this.animationFrameId = requestAnimationFrame(loop);
    };
    
    loop();
  }

  /**
   * Generate match events during the game
   */
  startEventGeneration() {
    this.eventTimer = setInterval(() => {
      if (this.isActive && !this.isPaused && this.currentMinute < 90) {
        const event = this.matchEvents.generateEvent(
          this.currentMinute, 
          this.getCurrentPossession(),
          this.getCurrentMomentum()
        );
        
        if (event) {
          this.handleMatchEvent(event);
        }
        
        // Update statistics
        this.matchStats.updateMatchMinute(this.currentMinute, this.currentMinute % 2 === 0);
      }
    }, 2000 / this.matchSpeed); // Event check every 2 seconds (scaled by speed)
  }

  /**
   * Run complete simulation without visuals
   */
  runSimulation() {
    const simulationSpeed = 50; // Much faster for simulation
    
    const simulate = () => {
      if (this.currentMinute < 90) {
        // Generate multiple events per step for faster simulation
        for (let minute = this.currentMinute; minute < Math.min(this.currentMinute + 5, 90); minute++) {
          const event = this.matchEvents.generateEvent(
            minute,
            Math.random() > 0.5, // Random possession
            Math.random() // Random momentum
          );
          
          if (event) {
            this.handleMatchEvent(event);
          }
          
          this.matchStats.updateMatchMinute(minute, minute % 2 === 0);
        }
        
        this.currentMinute = Math.min(this.currentMinute + 5, 90);
        
        // Continue simulation
        setTimeout(simulate, 100);
      } else {
        this.endMatch();
      }
    };
    
    simulate();
  }

  /**
   * Handle individual match events
   */
  handleMatchEvent(event) {
    switch (event.type) {
      case 'goal':
        this.handleGoal(event);
        break;
      case 'yellow_card':
      case 'red_card':
        this.handleCard(event);
        break;
      case 'substitution':
        this.handleSubstitution(event);
        break;
      case 'injury':
        this.handleInjury(event);
        break;
    }
    
    // Update match engine if visual
    if (this.matchEngine && event.type === 'goal') {
      this.matchEngine.score = [...this.score];
    }
    
    // Notify UI of event
    if (this.eventCallback) {
      this.eventCallback(event, this.currentMinute, this.score);
    }
  }

  /**
   * Handle goal events
   */
  handleGoal(event) {
    if (event.team === 'home') {
      this.score[0]++;
    } else {
      this.score[1]++;
    }
    
    this.matchStats.recordGoal(event.team, event.minute, event.player);
    
    console.log(`⚽ GOAL! ${event.player} (${event.minute}') - ${this.homeTeam.name} ${this.score[0]}-${this.score[1]} ${this.awayTeam.name}`);
  }

  /**
   * Handle card events
   */
  handleCard(event) {
    this.matchStats.recordCard(event.team, event.type, event.player, event.minute);
    
    if (event.type === 'red_card') {
      console.log(`🟥 RED CARD! ${event.player} (${event.minute}')`);
    } else {
      console.log(`🟨 Yellow Card! ${event.player} (${event.minute}')`);
    }
  }

  /**
   * Handle substitution events
   */
  handleSubstitution(event) {
    this.matchStats.recordSubstitution(event.team, event.minute, event.playerOff, event.playerOn);
    
    console.log(`🔄 SUB! ${event.playerOn} ← ${event.playerOff} (${event.minute}')`);
  }

  /**
   * Handle injury events
   */
  handleInjury(event) {
    this.matchStats.recordInjury(event.team, event.minute, event.player, event.severity);
    
    if (event.severity === 'serious') {
      console.log(`🚑 INJURY! ${event.player} forced off (${event.minute}')`);
    }
  }

  /**
   * Update match time
   */
  updateMatchTime() {
    if (this.matchEngine) {
      this.currentMinute = Math.floor(this.matchEngine.time / 60);
    } else {
      this.currentMinute++;
    }
  }

  /**
   * Get current possession (simplified)
   */
  getCurrentPossession() {
    if (this.matchEngine && this.matchEngine.ball) {
      return this.matchEngine.ball.x < this.matchEngine.width / 2;
    }
    return Math.random() > 0.5;
  }

  /**
   * Get current momentum (simplified)
   */
  getCurrentMomentum() {
    const scoreDiff = this.score[0] - this.score[1];
    return 0.5 + (scoreDiff * 0.1);
  }

  /**
   * Pause the match
   */
  pause() {
    this.isPaused = true;
    console.log('⏸️ Match paused');
  }

  /**
   * Resume the match
   */
  resume() {
    this.isPaused = false;
    console.log('▶️ Match resumed');
  }

  /**
   * Stop the match early
   */
  stop() {
    this.isActive = false;
    this.isPaused = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.eventTimer) {
      clearInterval(this.eventTimer);
      this.eventTimer = null;
    }
    
    console.log('⏹️ Match stopped');
  }

  /**
   * Change match speed (visual matches only)
   */
  setSpeed(multiplier) {
    this.matchSpeed = Math.max(0.1, Math.min(10, multiplier));
    
    // Restart event timer with new speed
    if (this.eventTimer) {
      clearInterval(this.eventTimer);
      this.startEventGeneration();
    }
    
    console.log(`⚡ Match speed set to ${this.matchSpeed}x`);
  }

  /**
   * End the match and process results
   */
  endMatch() {
    this.isActive = false;
    this.stop();
    
    console.log(`🏁 FULL TIME: ${this.homeTeam.name} ${this.score[0]}-${this.score[1]} ${this.awayTeam.name}`);
    
    // Generate final match result
    const result = this.matchResults.generateResult(
      this.score,
      this.matchEvents.getMatchSummary(),
      this.matchStats.getFinalStats()
    );
    
    // Update team and player stats
    this.updateTeamStats(result);
    this.updatePlayerStats(result);
    
    // Update league standings if gameState provided
    if (this.gameState && this.gameState.league) {
      this.gameState.league.recordResult(
        this.homeTeam,
        this.awayTeam,
        this.score[0],
        this.score[1]
      );
    }
    
    return result;
  }

  /**
   * Update team statistics after match
   */
  updateTeamStats(result) {
    // Update home team stats
    this.homeTeam.stats = this.homeTeam.stats || {
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0
    };
    
    // Update away team stats
    this.awayTeam.stats = this.awayTeam.stats || {
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0
    };
    
    // Apply match results
    this.homeTeam.stats.played++;
    this.awayTeam.stats.played++;
    
    this.homeTeam.stats.goalsFor += this.score[0];
    this.homeTeam.stats.goalsAgainst += this.score[1];
    this.awayTeam.stats.goalsFor += this.score[1];
    this.awayTeam.stats.goalsAgainst += this.score[0];
    
    if (this.score[0] > this.score[1]) {
      this.homeTeam.stats.won++;
      this.homeTeam.stats.points += 3;
      this.awayTeam.stats.lost++;
    } else if (this.score[1] > this.score[0]) {
      this.awayTeam.stats.won++;
      this.awayTeam.stats.points += 3;
      this.homeTeam.stats.lost++;
    } else {
      this.homeTeam.stats.drawn++;
      this.awayTeam.stats.drawn++;
      this.homeTeam.stats.points += 1;
      this.awayTeam.stats.points += 1;
    }
  }

  /**
   * Update player statistics after match
   */
  updatePlayerStats(result) {
    const events = this.matchEvents.getMatchSummary();
    
    // Update goal scorers
    events.goalScorers.home.forEach(goal => {
      const player = this.homeTeam.players.find(p => p.name === goal.player);
      if (player) {
        player.stats = player.stats || { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
        player.stats.goals++;
        player.stats.appearances++;
      }
    });
    
    events.goalScorers.away.forEach(goal => {
      const player = this.awayTeam.players.find(p => p.name === goal.player);
      if (player) {
        player.stats = player.stats || { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
        player.stats.goals++;
        player.stats.appearances++;
      }
    });
    
    // Update all starting XI appearances
    [...this.homeTeam.players.slice(0, 11), ...this.awayTeam.players.slice(0, 11)].forEach(player => {
      player.stats = player.stats || { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
      player.stats.appearances++;
    });
  }

  /**
   * Get current match state
   */
  getMatchState() {
    return {
      isActive: this.isActive,
      isPaused: this.isPaused,
      currentMinute: this.currentMinute,
      score: [...this.score],
      matchSpeed: this.matchSpeed,
      events: this.matchEvents.events,
      stats: this.matchStats.getCurrentStats()
    };
  }

  /**
   * Get final match result (call after match ends)
   */
  getFinalResult() {
    return this.matchResults.generateResult(
      this.score,
      this.matchEvents.getMatchSummary(),
      this.matchStats.getFinalStats()
    );
  }
}
