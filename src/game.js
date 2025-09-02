/**
 * Main Game Controller - Integrates all game systems
 * Connects UI, transfers, matches, and world football systems
 */

import { MatchEngine } from './match/matchEngine.js';
import { MatchController } from './match/matchController.js';
import { League } from './league/league.js';
import { generateWorldFootballSystem } from './utils/randomData.js';
import { TransferMarket } from './transfers/transferMarket.js';
import { TransferWindow } from './transfers/transferWindow.js';
import { RegistrationRules } from './transfers/registrationRules.js';
import { initializeUI } from './ui/interactiveUI.js';

export class GameState {
  constructor() {
    // Core game systems
    this.worldSystem = null;
    this.userTeam = null;
    this.currentSeason = 2024;
    this.currentDate = new Date(2024, 8, 1); // September 1st, 2024
    this.gameSpeed = 1;
    
    // Match systems
    this.fixtures = [];
    this.matchHistory = [];
    this.currentMatch = null;
    
    // Transfer systems
    this.transferMarket = null;
    this.transferWindow = null;
    this.registrationRules = null;
    
    // Event callbacks for UI updates
    this.eventCallbacks = {
      uiUpdate: null,
      playerUpdate: null,
      teamUpdate: null,
      transferUpdate: null,
      transferCompleted: null,
      transferWindowOpened: null,
      transferWindowClosed: null,
      matchUpdate: null,
      matchCompleted: null
    };
    
    // Game statistics
    this.stats = {
      matchesPlayed: 0,
      transfersCompleted: 0,
      seasonsCompleted: 0
    };
    
    this.initialize();
  }

  async initialize() {
    console.log('🎮 Initializing Football Management Game...');
    
    try {
      // Generate world football system
      console.log('🌍 Creating world football system...');
      this.worldSystem = generateWorldFootballSystem();
      console.log(`✅ Generated ${this.worldSystem.countries.length} countries with ${this.worldSystem.allTeams.length} teams`);
      
      // Initialize transfer systems
      console.log('💰 Setting up transfer systems...');
      this.transferMarket = new TransferMarket(this);
      this.transferWindow = new TransferWindow(this);
      this.registrationRules = new RegistrationRules(this);
      
      // Select user team (first team from first country's top league)
      const firstCountry = this.worldSystem.countries[0];
      const topLeague = firstCountry.leagues[0];
      this.userTeam = topLeague.teams[0];
      this.league = topLeague;
      
      console.log(`🏟️ User team selected: ${this.userTeam.name} (${firstCountry.name})`);
      
      // Generate initial fixtures
      this.generateSeasonFixtures();
      
      // Initialize transfer window
      this.transferWindow.initializeSeason(this.currentSeason);
      this.transferWindow.openTransferWindow('summer');
      
      // Initialize UI
      console.log('🎨 Initializing interactive UI...');
      const ui = initializeUI(this);
      this.ui = ui;
      
      console.log('✅ Game initialization completed successfully');
      
      // Auto-save system
      this.setupAutoSave();
      
    } catch (error) {
      console.error('❌ Game initialization failed:', error);
    }
  }

  generateSeasonFixtures() {
    if (!this.league || !this.userTeam) return;
    
    this.fixtures = [];
    const teams = this.league.teams;
    const userTeamIndex = teams.indexOf(this.userTeam);
    
    // Generate fixtures only involving user team for now (can be expanded)
    teams.forEach((opponent, index) => {
      if (index === userTeamIndex) return;
      
      // Home fixture
      this.fixtures.push({
        id: `${this.currentSeason}_${userTeamIndex}_${index}_H`,
        homeTeam: this.userTeam,
        awayTeam: opponent,
        date: new Date(2024, 8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 28) + 1),
        played: false,
        season: this.currentSeason
      });
      
      // Away fixture
      this.fixtures.push({
        id: `${this.currentSeason}_${index}_${userTeamIndex}_A`,
        homeTeam: opponent,
        awayTeam: this.userTeam,
        date: new Date(2024, 8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 28) + 1),
        played: false,
        season: this.currentSeason
      });
    });
    
    // Sort fixtures by date
    this.fixtures.sort((a, b) => a.date - b.date);
    
    console.log(`📅 Generated ${this.fixtures.length} fixtures for ${this.userTeam.name}`);
  }

  /**
   * Start a match with visual simulation
   */
  startMatch(fixtureId, useCanvas = true) {
    const fixture = this.fixtures.find(f => f.id === fixtureId);
    if (!fixture) {
      console.error('Fixture not found:', fixtureId);
      return null;
    }
    
    const canvas = useCanvas ? document.getElementById('pitch') : null;
    
    const matchController = new MatchController(
      fixture.homeTeam,
      fixture.awayTeam,
      this,
      canvas
    );
    
    this.currentMatch = matchController;
    
    // Set up match event callbacks
    const onEventCallback = (event, minute, score) => {
      if (this.eventCallbacks.matchUpdate) {
        this.eventCallbacks.matchUpdate(event, minute, score);
      }
    };
    
    // Start match based on type
    if (useCanvas && canvas) {
      return matchController.startVisualMatch(this.gameSpeed, onEventCallback);
    } else {
      return matchController.startSimulation(onEventCallback);
    }
  }

  /**
   * Complete a match and update game state
   */
  completeMatch(matchResult) {
    if (!this.currentMatch) return;
    
    const fixture = this.fixtures.find(f => f.id === matchResult.fixtureId);
    if (fixture) {
      fixture.played = true;
      fixture.result = matchResult;
      
      this.matchHistory.push({
        ...fixture,
        result: matchResult
      });
      
      this.stats.matchesPlayed++;
    }
    
    // Update league standings
    if (this.league && matchResult.homeTeam && matchResult.awayTeam) {
      this.league.recordResult(
        matchResult.homeTeam,
        matchResult.awayTeam,
        matchResult.homeScore,
        matchResult.awayScore
      );
    }
    
    this.currentMatch = null;
    
    if (this.eventCallbacks.matchCompleted) {
      this.eventCallbacks.matchCompleted(matchResult);
    }
    
    console.log(`⚽ Match completed: ${matchResult.homeTeam.name} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeam.name}`);
  }

  /**
   * Advance game time
   */
  advanceTime(days = 1) {
    this.currentDate.setDate(this.currentDate.getDate() + days);
    
    // Update transfer windows
    this.transferWindow.updateTransferWindows(this.currentDate);
    
    // Update transfer market dynamics
    this.transferMarket.updateMarketDynamics();
    
    // Process player development/decay
    this.processPlayerDevelopment();
    
    // Check for season end
    this.checkSeasonEnd();
    
    // Update UI
    if (this.eventCallbacks.uiUpdate) {
      this.eventCallbacks.uiUpdate();
    }
  }

  processPlayerDevelopment() {
    // Process development for all players in world system
    this.worldSystem.allTeams.forEach(team => {
      team.players.forEach(player => {
        // Reduce fatigue over time
        if (player.fatigue > 0) {
          player.fatigue = Math.max(0, player.fatigue - 2);
        }
        
        // Gradual morale changes
        player.morale = Math.max(20, Math.min(80, 
          player.morale + (Math.random() - 0.5) * 2
        ));
        
        // Injury recovery
        if (player.injured && player.injuryDays > 0) {
          player.injuryDays--;
          if (player.injuryDays <= 0) {
            player.injured = false;
            console.log(`🏥 ${player.name} has recovered from injury`);
          }
        }
        
        // Weekly attribute development (small changes)
        if (Math.random() < 0.1) { // 10% chance
          const attribute = Object.keys(player.attributes)[Math.floor(Math.random() * Object.keys(player.attributes).length)];
          const change = (Math.random() - 0.5) * 0.5; // ±0.25
          player.attributes[attribute] = Math.max(1, Math.min(99, player.attributes[attribute] + change));
        }
      });
    });
  }

  checkSeasonEnd() {
    // Check if all fixtures are completed
    const remainingFixtures = this.fixtures.filter(f => !f.played);
    
    if (remainingFixtures.length === 0) {
      this.endSeason();
    }
  }

  endSeason() {
    console.log(`🏆 Season ${this.currentSeason} completed!`);
    
    // Process league promotion/relegation
    this.worldSystem.countries.forEach(country => {
      country.processSeasonEnd();
    });
    
    // Close transfer window if open
    if (this.transferWindow.currentWindow) {
      this.transferWindow.closeTransferWindow();
    }
    
    // Update statistics
    this.stats.seasonsCompleted++;
    
    // Start new season
    this.startNewSeason();
  }

  startNewSeason() {
    this.currentSeason++;
    this.currentDate = new Date(this.currentSeason, 8, 1); // New season starts September 1st
    
    // Reset player seasonal stats
    this.worldSystem.allTeams.forEach(team => {
      team.players.forEach(player => {
        if (player.resetSeason) {
          player.resetSeason();
        }
      });
    });
    
    // Initialize new season systems
    this.transferWindow.initializeSeason(this.currentSeason);
    this.registrationRules.updateRegistrationPeriods(this.currentSeason);
    
    // Generate new fixtures
    this.generateSeasonFixtures();
    
    console.log(`🆕 Season ${this.currentSeason} started!`);
  }

  /**
   * Save game state to localStorage
   */
  save() {
    try {
      const saveData = {
        currentSeason: this.currentSeason,
        currentDate: this.currentDate.toISOString(),
        userTeamId: this.userTeam?.id,
        stats: this.stats,
        worldSystemData: this.serializeWorldSystem(),
        fixtures: this.fixtures,
        matchHistory: this.matchHistory.slice(-50) // Keep last 50 matches
      };
      
      localStorage.setItem('footballManagerSave', JSON.stringify(saveData));
      console.log('💾 Game saved successfully');
      
    } catch (error) {
      console.error('❌ Failed to save game:', error);
    }
  }

  /**
   * Load game state from localStorage
   */
  load() {
    try {
      const saveData = localStorage.getItem('footballManagerSave');
      if (!saveData) return false;
      
      const data = JSON.parse(saveData);
      
      this.currentSeason = data.currentSeason;
      this.currentDate = new Date(data.currentDate);
      this.stats = data.stats;
      this.fixtures = data.fixtures || [];
      this.matchHistory = data.matchHistory || [];
      
      // Restore world system
      this.deserializeWorldSystem(data.worldSystemData);
      
      // Find user team
      if (data.userTeamId && this.worldSystem) {
        this.userTeam = this.worldSystem.allTeams.find(t => t.id === data.userTeamId);
      }
      
      console.log('📁 Game loaded successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load game:', error);
      return false;
    }
  }

  serializeWorldSystem() {
    // Simplified serialization - can be expanded
    return {
      countries: this.worldSystem.countries.map(country => ({
        name: country.name,
        leagues: country.leagues.map(league => ({
          name: league.name,
          tier: league.tier,
          teams: league.teams.map(team => ({
            id: team.id,
            name: team.name,
            players: team.players.map(player => ({
              id: player.id,
              name: player.name,
              position: player.position,
              age: player.age,
              attributes: player.attributes,
              // Add other essential player data
            }))
          }))
        }))
      }))
    };
  }

  deserializeWorldSystem(data) {
    // Restore world system from saved data
    // This is a simplified version - full implementation would recreate all objects
    console.log('🔄 Restoring world system from save data...');
    // Implementation would go here
  }

  setupAutoSave() {
    // Auto-save every 5 minutes
    setInterval(() => {
      this.save();
    }, 5 * 60 * 1000);
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.save();
    });
  }

  /**
   * Get game statistics for display
   */
  getGameStats() {
    return {
      ...this.stats,
      currentSeason: this.currentSeason,
      userTeam: this.userTeam?.name,
      transferBudget: this.transferMarket?.getTransferBudget?.(this.userTeam) || 0,
      leaguePosition: this.league?.getPosition?.(this.userTeam) || 'Unknown'
    };
  }
}

// Initialize game when page loads
let gameState = null;

// Create a promise that resolves when gameState is initialized
let gameStatePromise = new Promise((resolve) => {
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting Football Management Game...');
    
    gameState = new GameState();
    
    // Try to load saved game
    if (!gameState.load()) {
      console.log('🆕 Starting new game...');
    }
    
    // Make game state globally accessible for debugging
    window.gameState = gameState;
    
    // Resolve the promise with the initialized gameState
    resolve(gameState);
    
    // Legacy match engine for canvas demo
    const canvas = document.getElementById('pitch');
    if (canvas && gameState.userTeam) {
      // Create demo match
      const opponent = gameState.league?.teams?.find(t => t.id !== gameState.userTeam.id);
      if (opponent) {
        const engine = new MatchEngine(gameState.userTeam, opponent, canvas, gameState);
        
        function gameLoop() {
          engine.update();
          engine.draw();
          requestAnimationFrame(gameLoop);
        }
        
        gameLoop();
      }
    }
  });
});

// Export for use in other modules
export { gameState, gameStatePromise };
