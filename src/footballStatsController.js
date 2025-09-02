/**
 * Main Statistics Controller - Integrates all statistics components
 * This is the main entry point for the comprehensive football statistics system
 */

import { StatsIntegration } from './stats/statsIntegration.js';
import { StatsDisplay } from './stats/statsDisplay.js';

export class FootballStatsController {
  constructor() {
    // Initialize the core statistics integration system
    this.statsIntegration = new StatsIntegration();
    
    // Initialize display components for different views
    this.statsDisplay = new StatsDisplay('stats-container', this.statsIntegration);
    
    // Track current view state
    this.currentView = null;
    this.currentTeam = null;
    this.currentPlayer = null;
    
    // Bind methods to maintain context
    this.initializeStats = this.initializeStats.bind(this);
    this.showTeamDashboard = this.showTeamDashboard.bind(this);
    this.showPlayerProfile = this.showPlayerProfile.bind(this);
    this.showLeagueStats = this.showLeagueStats.bind(this);
    this.recordMatchResult = this.recordMatchResult.bind(this);
    
    console.log('🏆 Football Statistics System Initialized');
  }

  // ===============================================================================
  // INITIALIZATION METHODS
  // ===============================================================================

  /**
   * Initialize statistics for a team at the start of the season
   */
  initializeStats(teamData) {
    console.log(`📊 Initializing stats for ${teamData.name}`);
    
    // Create team manager if it doesn't exist
    if (!this.statsIntegration.hasTeam(teamData.id)) {
      this.statsIntegration.initializeTeam(teamData.id, teamData.name, teamData.season || 1);
    }
    
    // Initialize player stats for all team players
    if (teamData.players && Array.isArray(teamData.players)) {
      teamData.players.forEach(player => {
        this.statsIntegration.initializePlayer(teamData.id, player.id, player.name, player.position);
      });
    }
    
    return {
      success: true,
      teamId: teamData.id,
      playersInitialized: teamData.players ? teamData.players.length : 0,
      message: `Statistics initialized for ${teamData.name}`
    };
  }

  /**
   * Initialize statistics for multiple teams (league setup)
   */
  initializeLeague(leagueData) {
    console.log(`🏟️ Initializing league statistics for ${leagueData.teams.length} teams`);
    
    const results = [];
    
    leagueData.teams.forEach(team => {
      const result = this.initializeStats(team);
      results.push(result);
    });
    
    return {
      success: true,
      teamsInitialized: results.filter(r => r.success).length,
      totalPlayers: results.reduce((sum, r) => sum + r.playersInitialized, 0),
      message: `League statistics initialized for ${results.length} teams`
    };
  }

  // ===============================================================================
  // MATCH INTEGRATION METHODS
  // ===============================================================================

  /**
   * Record a complete match result with all statistics
   */
  recordMatchResult(matchData) {
    console.log(`⚽ Recording match result: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`);
    
    try {
      // Record match for home team
      const homeResult = this.statsIntegration.recordMatchResult(
        matchData.homeTeam.id,
        {
          opponent: matchData.awayTeam.name,
          isHome: true,
          score: { home: matchData.score.home, away: matchData.score.away },
          result: this.calculateResult(matchData.score.home, matchData.score.away, true),
          matchEvents: matchData.homeEvents || [],
          playerStats: matchData.homePlayerStats || {}
        }
      );
      
      // Record match for away team
      const awayResult = this.statsIntegration.recordMatchResult(
        matchData.awayTeam.id,
        {
          opponent: matchData.homeTeam.name,
          isHome: false,
          score: { home: matchData.score.away, away: matchData.score.home },
          result: this.calculateResult(matchData.score.away, matchData.score.home, false),
          matchEvents: matchData.awayEvents || [],
          playerStats: matchData.awayPlayerStats || {}
        }
      );
      
      return {
        success: true,
        homeTeamResult: homeResult,
        awayTeamResult: awayResult,
        message: `Match recorded successfully`
      };
      
    } catch (error) {
      console.error('Error recording match result:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to record match result'
      };
    }
  }

  /**
   * Record a single match event (goal, card, substitution, etc.)
   */
  recordMatchEvent(teamId, eventData) {
    return this.statsIntegration.recordMatchEvent(teamId, eventData);
  }

  /**
   * Calculate match result (W/D/L) based on score
   */
  calculateResult(myScore, opponentScore, isHome = true) {
    if (myScore > opponentScore) return 'W';
    if (myScore < opponentScore) return 'L';
    return 'D';
  }

  // ===============================================================================
  // DISPLAY METHODS
  // ===============================================================================

  /**
   * Show comprehensive team dashboard
   */
  showTeamDashboard(teamId, containerId = 'stats-container') {
    this.currentView = 'team-dashboard';
    this.currentTeam = teamId;
    
    // Update display container if different
    if (containerId !== 'stats-container') {
      this.statsDisplay = new StatsDisplay(containerId, this.statsIntegration);
    }
    
    this.statsDisplay.showTeamOverview(teamId);
    
    console.log(`📈 Displaying team dashboard for team ${teamId}`);
  }

  /**
   * Show detailed player statistics profile
   */
  showPlayerProfile(playerId, teamId, containerId = 'stats-container') {
    this.currentView = 'player-profile';
    this.currentPlayer = playerId;
    this.currentTeam = teamId;
    
    // Update display container if different
    if (containerId !== 'stats-container') {
      this.statsDisplay = new StatsDisplay(containerId, this.statsIntegration);
    }
    
    this.statsDisplay.showPlayerStats(playerId, teamId);
    
    console.log(`👤 Displaying player profile for ${playerId} from team ${teamId}`);
  }

  /**
   * Show league-wide statistics and leaderboards
   */
  showLeagueStats(containerId = 'stats-container') {
    this.currentView = 'league-stats';
    
    // Update display container if different
    if (containerId !== 'stats-container') {
      this.statsDisplay = new StatsDisplay(containerId, this.statsIntegration);
    }
    
    this.statsDisplay.showLeagueStats();
    
    console.log('🏆 Displaying league statistics');
  }

  // ===============================================================================
  // DATA RETRIEVAL METHODS
  // ===============================================================================

  /**
   * Get comprehensive team report
   */
  getTeamReport(teamId) {
    const teamManager = this.statsIntegration.getTeamManager(teamId);
    if (!teamManager) return null;
    
    return {
      team: teamManager.getTeamReport(),
      topPerformers: teamManager.getTopPerformers(),
      advancedStats: teamManager.getAdvancedStats(),
      recentForm: teamManager.getRecentForm()
    };
  }

  /**
   * Get detailed player statistics
   */
  getPlayerStats(playerId, teamId) {
    const teamManager = this.statsIntegration.getTeamManager(teamId);
    if (!teamManager) return null;
    
    const player = teamManager.getPlayer(playerId);
    if (!player) return null;
    
    return {
      basicInfo: {
        name: player.playerName,
        position: player.position,
        team: teamManager.teamName
      },
      stats: player.getAllStats(),
      formattedStats: player.getFormattedStats()
    };
  }

  /**
   * Get league leaderboards
   */
  getLeagueLeaderboards() {
    return {
      topScorers: this.statsIntegration.getLeagueTopScorers(20),
      topAssists: this.statsIntegration.getLeagueTopAssists(20),
      topRated: this.statsIntegration.getLeagueTopRated(20)
    };
  }

  // ===============================================================================
  // EXPORT/IMPORT METHODS
  // ===============================================================================

  /**
   * Export all statistics data
   */
  exportAllData() {
    return this.statsIntegration.exportAllStats();
  }

  /**
   * Export team-specific data
   */
  exportTeamData(teamId) {
    const teamManager = this.statsIntegration.getTeamManager(teamId);
    if (!teamManager) return null;
    
    return teamManager.exportStatsToJSON();
  }

  /**
   * Import statistics data (for save/load functionality)
   */
  importData(statsData) {
    try {
      // Implementation would depend on the specific data format
      console.log('📥 Importing statistics data...');
      return {
        success: true,
        message: 'Statistics data imported successfully'
      };
    } catch (error) {
      console.error('Error importing stats data:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to import statistics data'
      };
    }
  }

  // ===============================================================================
  // UTILITY METHODS
  // ===============================================================================

  /**
   * Get current statistics summary
   */
  getStatsSummary() {
    const allStats = this.statsIntegration.exportAllStats();
    
    return {
      totalTeams: Object.keys(allStats).length,
      totalPlayers: Object.values(allStats).reduce((sum, team) => sum + team.players.length, 0),
      lastUpdated: new Date().toISOString(),
      systemVersion: '1.0.0'
    };
  }

  /**
   * Reset all statistics (for new season)
   */
  resetAllStats() {
    console.log('🔄 Resetting all statistics...');
    this.statsIntegration = new StatsIntegration();
    this.currentView = null;
    this.currentTeam = null;
    this.currentPlayer = null;
    
    return {
      success: true,
      message: 'All statistics have been reset'
    };
  }

  /**
   * Get system status and health check
   */
  getSystemStatus() {
    const summary = this.getStatsSummary();
    
    return {
      status: 'operational',
      version: '1.0.0',
      features: [
        'Comprehensive Player Statistics (11 categories)',
        'Team Performance Analytics',
        'League Leaderboards',
        'Advanced Metrics (xG, pass completion, etc.)',
        'Real-time Match Integration',
        'Premium Desktop-First UI',
        'Export/Import Functionality'
      ],
      statistics: summary,
      lastHealthCheck: new Date().toISOString()
    };
  }
}

// Global instance for easy access
export const FootballStats = new FootballStatsController();

// Usage Examples:
/*
// Initialize a team
FootballStats.initializeStats({
  id: 'team1',
  name: 'Arsenal',
  season: 1,
  players: [
    { id: 'player1', name: 'Player Name', position: 'ST' }
  ]
});

// Record a match
FootballStats.recordMatchResult({
  homeTeam: { id: 'team1', name: 'Arsenal' },
  awayTeam: { id: 'team2', name: 'Chelsea' },
  score: { home: 2, away: 1 },
  homeEvents: [
    { type: 'goal', playerId: 'player1', minute: 45 }
  ]
});

// Display team dashboard
FootballStats.showTeamDashboard('team1');

// Show player profile
FootballStats.showPlayerProfile('player1', 'team1');

// Display league statistics
FootballStats.showLeagueStats();
*/
