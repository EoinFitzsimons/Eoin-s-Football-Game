/**
 * GameState - Centralized state management for football simulation
 * Manages persistent game data, save/load functionality, and cross-system state
 */

export class GameStateManager {
  constructor() {
    // Core game identifiers
    this.gameId = this.generateGameId();
    this.saveVersion = '1.0.0';
    this.createdAt = new Date();
    this.lastSaved = null;
    
    // Game progression tracking
    this.currentSeason = 2024;
    this.currentDate = new Date(2024, 5, 1); // June 1st, 2024
    this.gameWeek = 0;
    this.totalDaysPlayed = 0;
    
    // User progression and achievements
    this.userProfile = {
      managerName: 'Manager',
      nationality: 'Unknown',
      experience: 0, // Days managed
      reputation: 50, // 0-100 scale
      achievements: [],
      careerStats: {
        matchesManaged: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        winPercentage: 0,
        transfersCompleted: 0,
        playersDiscovered: 0,
        seasonsCompleted: 0
      }
    };
    
    // Persistent world state
    this.worldSnapshot = {
      transferMarketHistory: [],
      majorTransfers: [],
      retiredPlayers: [],
      emergingTalents: [],
      managerChanges: [],
      seasonResults: []
    };
    
    // Game settings and preferences
    this.settings = {
      difficulty: 'normal', // easy, normal, hard, realistic
      matchVisualization: true,
      simulationSpeed: 'normal',
      autoSave: true,
      soundEnabled: true,
      notifications: {
        transfers: true,
        matches: true,
        injuries: true,
        contracts: true
      }
    };
    
    // Historical data tracking
    this.seasonHistory = [];
    this.managerialHistory = [];
    
    console.log('📊 GameStateManager initialized');
  }

  /**
   * Generate unique game identifier
   */
  generateGameId() {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Update user manager profile
   */
  updateManagerProfile(updates) {
    this.userProfile = { ...this.userProfile, ...updates };
    this.logManagerialEvent('profile_update', updates);
  }

  /**
   * Record career statistics
   */
  recordMatchResult(result) {
    const stats = this.userProfile.careerStats;
    stats.matchesManaged++;
    
    if (result === 'win') stats.wins++;
    else if (result === 'draw') stats.draws++;
    else if (result === 'loss') stats.losses++;
    
    stats.winPercentage = stats.matchesManaged > 0 
      ? (stats.wins / stats.matchesManaged * 100).toFixed(1)
      : 0;
      
    this.logManagerialEvent('match_result', { result, stats });
  }

  /**
   * Record transfer activity
   */
  recordTransfer(transferData) {
    this.userProfile.careerStats.transfersCompleted++;
    this.worldSnapshot.transferMarketHistory.push({
      ...transferData,
      date: new Date(this.currentDate),
      season: this.currentSeason
    });
    
    // Track major transfers (>10M)
    if (transferData.fee >= 10000000) {
      this.worldSnapshot.majorTransfers.push(transferData);
    }
    
    this.logManagerialEvent('transfer_completed', transferData);
  }

  /**
   * Add achievement
   */
  addAchievement(achievementId, title, description) {
    const achievement = {
      id: achievementId,
      title,
      description,
      unlockedAt: new Date(this.currentDate),
      season: this.currentSeason
    };
    
    this.userProfile.achievements.push(achievement);
    console.log(`🏆 Achievement unlocked: ${title}`);
    
    return achievement;
  }

  /**
   * Log significant managerial events
   */
  logManagerialEvent(eventType, data) {
    this.managerialHistory.push({
      type: eventType,
      data,
      date: new Date(this.currentDate),
      season: this.currentSeason,
      gameWeek: this.gameWeek
    });
    
    // Keep history manageable (last 1000 events)
    if (this.managerialHistory.length > 1000) {
      this.managerialHistory = this.managerialHistory.slice(-1000);
    }
  }

  /**
   * Complete season and archive data
   */
  completeSeason(seasonData) {
    this.seasonHistory.push({
      season: this.currentSeason,
      completedAt: new Date(this.currentDate),
      finalPosition: seasonData.finalPosition,
      points: seasonData.points,
      goalsFor: seasonData.goalsFor,
      goalsAgainst: seasonData.goalsAgainst,
      transfers: seasonData.transfers || [],
      achievements: seasonData.achievements || [],
      topScorer: seasonData.topScorer,
      playerOfSeason: seasonData.playerOfSeason
    });
    
    this.userProfile.careerStats.seasonsCompleted++;
    this.currentSeason++;
    this.gameWeek = 0;
    
    this.logManagerialEvent('season_completed', seasonData);
    console.log(`📅 Season ${this.currentSeason - 1} archived`);
  }

  /**
   * Advance game time and update state
   */
  advanceGameTime(days = 1) {
    const previousDate = new Date(this.currentDate);
    
    for (let i = 0; i < days; i++) {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.totalDaysPlayed++;
      this.userProfile.experience++;
      
      // Check for week transition
      if (this.currentDate.getDay() === 1 && i === days - 1) { // Monday
        this.gameWeek++;
      }
    }
    
    this.logManagerialEvent('time_advanced', {
      from: previousDate,
      to: new Date(this.currentDate),
      daysAdvanced: days
    });
  }

  /**
   * Calculate manager reputation
   */
  updateReputation(change, reason) {
    const oldReputation = this.userProfile.reputation;
    this.userProfile.reputation = Math.max(0, Math.min(100, 
      this.userProfile.reputation + change
    ));
    
    this.logManagerialEvent('reputation_change', {
      oldValue: oldReputation,
      newValue: this.userProfile.reputation,
      change,
      reason
    });
    
    console.log(`📈 Reputation ${change > 0 ? 'gained' : 'lost'}: ${Math.abs(change)} (${reason})`);
  }

  /**
   * Get game state summary for UI
   */
  getStateSummary() {
    return {
      gameId: this.gameId,
      currentSeason: this.currentSeason,
      currentDate: this.currentDate,
      gameWeek: this.gameWeek,
      totalDaysPlayed: this.totalDaysPlayed,
      managerProfile: this.userProfile,
      recentEvents: this.managerialHistory.slice(-10),
      achievements: this.userProfile.achievements.slice(-5)
    };
  }

  /**
   * Save game state to localStorage
   */
  saveGame() {
    try {
      const saveData = {
        version: this.saveVersion,
        gameId: this.gameId,
        createdAt: this.createdAt,
        savedAt: new Date(),
        
        // Core state
        currentSeason: this.currentSeason,
        currentDate: this.currentDate,
        gameWeek: this.gameWeek,
        totalDaysPlayed: this.totalDaysPlayed,
        
        // User data
        userProfile: this.userProfile,
        worldSnapshot: this.worldSnapshot,
        settings: this.settings,
        
        // History
        seasonHistory: this.seasonHistory,
        managerialHistory: this.managerialHistory.slice(-500) // Limit save size
      };
      
      const saveString = JSON.stringify(saveData);
      localStorage.setItem(`football_manager_save_${this.gameId}`, saveString);
      localStorage.setItem('football_manager_last_save', this.gameId);
      
      this.lastSaved = new Date();
      console.log('💾 Game saved successfully');
      
      return { success: true, saveId: this.gameId };
    } catch (error) {
      console.error('❌ Failed to save game:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load game state from localStorage
   */
  loadGame(gameId = null) {
    try {
      const loadId = gameId || localStorage.getItem('football_manager_last_save');
      if (!loadId) {
        throw new Error('No save file found');
      }
      
      const saveString = localStorage.getItem(`football_manager_save_${loadId}`);
      if (!saveString) {
        throw new Error('Save file not found');
      }
      
      const saveData = JSON.parse(saveString);
      
      // Validate save version
      if (saveData.version !== this.saveVersion) {
        console.warn('⚠️ Save file version mismatch, attempting migration...');
        this.migrateSaveData(saveData);
      }
      
      // Restore state
      this.gameId = saveData.gameId;
      this.createdAt = new Date(saveData.createdAt);
      this.currentSeason = saveData.currentSeason;
      this.currentDate = new Date(saveData.currentDate);
      this.gameWeek = saveData.gameWeek;
      this.totalDaysPlayed = saveData.totalDaysPlayed;
      
      this.userProfile = saveData.userProfile;
      this.worldSnapshot = saveData.worldSnapshot;
      this.settings = { ...this.settings, ...saveData.settings };
      this.seasonHistory = saveData.seasonHistory || [];
      this.managerialHistory = saveData.managerialHistory || [];
      
      console.log('📁 Game loaded successfully');
      return { success: true, gameId: loadId };
    } catch (error) {
      console.error('❌ Failed to load game:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate old save data to current version
   */
  migrateSaveData(saveData) {
    // Handle save file migrations for backwards compatibility
    if (!saveData.userProfile.careerStats) {
      saveData.userProfile.careerStats = {
        matchesManaged: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        winPercentage: 0,
        transfersCompleted: 0,
        playersDiscovered: 0,
        seasonsCompleted: 0
      };
    }
    
    if (!saveData.worldSnapshot) {
      saveData.worldSnapshot = {
        transferMarketHistory: [],
        majorTransfers: [],
        retiredPlayers: [],
        emergingTalents: [],
        managerChanges: [],
        seasonResults: []
      };
    }
    
    console.log('🔄 Save data migrated to current version');
  }

  /**
   * Get all available save files
   */
  static getAllSaves() {
    const saves = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('football_manager_save_')) {
        try {
          const saveString = localStorage.getItem(key);
          const saveData = JSON.parse(saveString);
          
          saves.push({
            gameId: saveData.gameId,
            createdAt: new Date(saveData.createdAt),
            savedAt: new Date(saveData.savedAt),
            currentSeason: saveData.currentSeason,
            managerName: saveData.userProfile?.managerName,
            seasonsCompleted: saveData.userProfile?.careerStats?.seasonsCompleted
          });
        } catch (error) {
          console.warn(`⚠️ Corrupted save file: ${key}`, error);
        }
      }
    }
    
    return saves.sort((a, b) => b.savedAt - a.savedAt);
  }

  /**
   * Delete a save file
   */
  static deleteSave(gameId) {
    try {
      localStorage.removeItem(`football_manager_save_${gameId}`);
      
      // Update last save reference if needed
      const lastSave = localStorage.getItem('football_manager_last_save');
      if (lastSave === gameId) {
        const allSaves = GameStateManager.getAllSaves();
        if (allSaves.length > 0) {
          localStorage.setItem('football_manager_last_save', allSaves[0].gameId);
        } else {
          localStorage.removeItem('football_manager_last_save');
        }
      }
      
      console.log(`🗑️ Save file deleted: ${gameId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete save:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export save data for backup
   */
  exportSave() {
    try {
      const saveData = {
        version: this.saveVersion,
        exportedAt: new Date(),
        gameData: {
          gameId: this.gameId,
          createdAt: this.createdAt,
          currentSeason: this.currentSeason,
          currentDate: this.currentDate,
          gameWeek: this.gameWeek,
          totalDaysPlayed: this.totalDaysPlayed,
          userProfile: this.userProfile,
          worldSnapshot: this.worldSnapshot,
          settings: this.settings,
          seasonHistory: this.seasonHistory,
          managerialHistory: this.managerialHistory
        }
      };
      
      const exportString = JSON.stringify(saveData, null, 2);
      return { success: true, data: exportString };
    } catch (error) {
      console.error('❌ Failed to export save:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import save data from backup
   */
  importSave(importData) {
    try {
      const saveData = JSON.parse(importData);
      
      if (!saveData.gameData) {
        throw new Error('Invalid save file format');
      }
      
      // Generate new game ID to avoid conflicts
      const originalId = saveData.gameData.gameId;
      saveData.gameData.gameId = this.generateGameId();
      
      // Load the imported data
      const result = this.loadGame(null, saveData.gameData);
      
      if (result.success) {
        // Save as new game
        this.saveGame();
        console.log(`📥 Save imported successfully (${originalId} → ${this.gameId})`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to import save:', error);
      return { success: false, error: error.message };
    }
  }
}
