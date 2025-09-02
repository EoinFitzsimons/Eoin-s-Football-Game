/**
 * Main Game Controller - Integrates all game systems
 * Connects UI, transfers, matches, and world football systems
 */

import { MatchController } from './match/matchController.js';
import { MatchEngine } from './match/matchEngine.js';
import { generateWorldFootballSystem } from './utils/randomData.js';
import { TransferMarket } from './transfers/transferMarket.js';
import { TransferWindow } from './transfers/transferWindow.js';
import { RegistrationRules } from './transfers/registrationRules.js';

export class GameState {
  constructor() {
    // Core game systems
    this.worldSystem = null;
    this.userTeam = null;
    this.currentSeason = 2024;
    this.currentDate = new Date(2024, 5, 1); // June 1st, 2024 (summer transfer window)
    this.gameSpeed = 1;
    
    // Match systems
    this.fixtures = [];
    this.matchHistory = [];
    this.currentMatch = null;
    this.MatchEngine = MatchEngine; // Expose MatchEngine class for UI
    
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

    // Don't auto-initialize - let main.js control initialization
    console.log('🎮 GameState created, awaiting initialization...');
  }

  /**
   * Set the user team after selection from UI
   */
  setUserTeam(team, league, country) {
    this.userTeam = team;
    this.league = league;
    this.userCountry = country;
    
    console.log(`🏟️ User team selected: ${team.name} (${country.name})`);
    
    // Generate fixtures now that team is selected
    this.generateSeasonFixtures();
    
    // Initialize transfer window with selected team
    this.transferWindow.initializeSeason(this.currentSeason);
    this.transferWindow.openTransferWindow('summer');
    
    // Trigger UI update
    if (this.eventCallbacks.uiUpdate) {
      this.eventCallbacks.uiUpdate();
    }
    
    console.log('🎯 Team selection completed, game ready to play!');
  }  async initialize() {
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
      
      // User team will be selected through UI - no auto-selection
      this.userTeam = null;
      this.league = null;
      
      console.log('🏟️ User team selection deferred to UI...');
      
      // Fixtures will be generated after team selection
      
      // Transfer window initialization will happen after team selection
      console.log('💰 Transfer systems ready, awaiting team selection...');
      
      // Skip old UI initialization - will be handled by GameUI
      console.log('🎨 Game core systems initialized, UI will be handled separately...');
      
      console.log('✅ Game initialization completed successfully');
      
      // Trigger UI update now that game is fully initialized
      if (this.eventCallbacks.uiUpdate) {
        this.eventCallbacks.uiUpdate();
      }
      
      // Auto-save system
      this.setupAutoSave();
      
    } catch (error) {
      console.error('❌ Game initialization failed:', error);
      throw error;
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
    // Advance day by day until we hit a match day or reach the target
    for (let i = 0; i < days; i++) {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      
      // Check if there are any matches scheduled for today
      const todaysMatches = this.fixtures.filter(fixture => {
        if (fixture.played) return false;
        
        const fixtureDate = new Date(fixture.date);
        return fixtureDate.toDateString() === this.currentDate.toDateString();
      });
      
      // Update transfer windows
      this.transferWindow.updateTransferWindows(this.currentDate);
      
      // Update transfer market dynamics
      this.transferMarket.updateMarketDynamics();
      
      // Process player development/decay (lighter processing for daily updates)
      if (i === days - 1 || todaysMatches.length > 0) {
        this.processPlayerDevelopment();
      }
      
      // If we hit a match day, stop advancing and notify
      if (todaysMatches.length > 0) {
        console.log(`📅 Stopped on match day: ${this.currentDate.toDateString()}`);
        console.log(`⚽ Matches today: ${todaysMatches.length}`);
        break;
      }
      
      // Check for season end
      this.checkSeasonEnd();
    }
    
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
        // Serialize only essential world data to save space
        worldSystemData: this.serializeMinimalWorldSystem(),
        fixtures: this.fixtures.slice(0, 100), // Keep only next 100 fixtures
        matchHistory: this.matchHistory.slice(-20) // Keep last 20 matches only
      };
      
      const jsonData = JSON.stringify(saveData);
      // Check size before saving
      const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
      
      if (sizeInMB > 4) { // Limit to 4MB
        console.warn(`⚠️ Save data too large (${sizeInMB.toFixed(2)}MB), clearing history...`);
        saveData.matchHistory = [];
        saveData.fixtures = this.fixtures.slice(0, 50);
      }
      
      localStorage.setItem('footballManagerSave', JSON.stringify(saveData));
      console.log('💾 Game saved successfully');
      
    } catch (error) {
      console.error('❌ Failed to save game:', error);
      // Try emergency save with minimal data
      try {
        const minimalSave = {
          currentSeason: this.currentSeason,
          currentDate: this.currentDate.toISOString(),
          userTeamId: this.userTeam?.id
        };
        localStorage.setItem('footballManagerSave_minimal', JSON.stringify(minimalSave));
        console.log('💾 Minimal save completed');
      } catch (emergencyError) {
        console.error('❌ Emergency save also failed:', emergencyError);
      }
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

  serializeMinimalWorldSystem() {
    // Very minimal serialization to save storage space
    return {
      userTeamData: this.userTeam ? {
        id: this.userTeam.id,
        name: this.userTeam.name,
        league: this.userTeam.league,
        country: this.userTeam.country
      } : null,
      countryCount: this.worldSystem?.countries?.length || 0,
      teamCount: this.worldSystem?.countries?.reduce((total, country) => 
        total + country.leagues.reduce((leagueTotal, league) => 
          leagueTotal + league.teams.length, 0), 0) || 0
    };
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
