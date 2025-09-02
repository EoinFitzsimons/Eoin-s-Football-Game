/**
 * Transfer Window - Manages transfer window periods and rules
 */

export class TransferWindow {
  constructor(gameState) {
    this.gameState = gameState;
    this.currentWindow = null;
    this.windowHistory = [];
    
    // Transfer window configurations
    this.windowTypes = {
      summer: {
        name: 'Summer Transfer Window',
        startMonth: 6,  // June
        endMonth: 8,    // August
        duration: 90,   // 90 days
        majorWindow: true
      },
      winter: {
        name: 'Winter Transfer Window', 
        startMonth: 0,  // January
        endMonth: 1,    // January (31 days)
        duration: 31,   // 31 days
        majorWindow: false
      }
    };
    
    this.registrationDeadlines = {
      domestic: null,
      european: null
    };
    
    this.emergencyTransfers = [];
  }

  /**
   * Initialize transfer windows for the season
   */
  initializeSeason(season) {
    this.windowHistory = [];
    this.currentWindow = null;
    
    // Set registration deadlines
    this.setRegistrationDeadlines(season);
    
    console.log(`🗓️ Transfer windows initialized for season ${season}`);
  }

  setRegistrationDeadlines(season) {
    // Domestic registration deadline (usually end of summer window)
    this.registrationDeadlines.domestic = new Date(season, 8, 31); // August 31st
    
    // European competition deadline (earlier)
    this.registrationDeadlines.european = new Date(season, 8, 1); // August 1st
  }

  /**
   * Check if transfers are currently allowed
   */
  isTransferWindowOpen() {
    if (!this.currentWindow) return false;
    
    const now = new Date();
    return now >= this.currentWindow.startDate && now <= this.currentWindow.endDate;
  }

  /**
   * Open a transfer window
   */
  openTransferWindow(windowType = 'summer') {
    if (this.currentWindow && this.isTransferWindowOpen()) {
      console.warn('Transfer window already open');
      return false;
    }

    const windowConfig = this.windowTypes[windowType];
    if (!windowConfig) {
      console.error('Invalid window type:', windowType);
      return false;
    }

    const currentYear = this.gameState.currentSeason || new Date().getFullYear();
    const startDate = new Date(currentYear, windowConfig.startMonth, 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + windowConfig.duration - 1);

    this.currentWindow = {
      type: windowType,
      name: windowConfig.name,
      startDate,
      endDate,
      duration: windowConfig.duration,
      majorWindow: windowConfig.majorWindow,
      transfersCompleted: 0,
      totalValue: 0,
      openedAt: Date.now()
    };

    console.log(`🏪 ${windowConfig.name} opened: ${startDate.toDateString()} - ${endDate.toDateString()}`);
    
    // Notify game systems
    if (this.gameState.eventCallbacks?.transferWindowOpened) {
      this.gameState.eventCallbacks.transferWindowOpened(this.currentWindow);
    }

    return true;
  }

  /**
   * Close the current transfer window
   */
  closeTransferWindow() {
    if (!this.currentWindow) {
      console.warn('No transfer window to close');
      return false;
    }

    const window = { ...this.currentWindow };
    window.closedAt = Date.now();
    window.actualDuration = Math.floor((window.closedAt - window.openedAt) / (1000 * 60 * 60 * 24));

    // Generate window summary
    window.summary = this.generateWindowSummary();

    this.windowHistory.push(window);
    this.currentWindow = null;

    console.log(`🔒 ${window.name} closed`);
    console.log(`📊 Window Summary: ${window.transfersCompleted} transfers, €${window.totalValue.toLocaleString()} total value`);

    // Notify game systems
    if (this.gameState.eventCallbacks?.transferWindowClosed) {
      this.gameState.eventCallbacks.transferWindowClosed(window);
    }

    return true;
  }

  generateWindowSummary() {
    if (!this.gameState.transferMarket) return {};

    const transfers = this.gameState.transferMarket.getTransferHistory({
      season: this.gameState.currentSeason
    });

    const windowTransfers = transfers.filter(t => 
      t.completedAt >= this.currentWindow.openedAt
    );

    const summary = {
      totalTransfers: windowTransfers.length,
      totalValue: windowTransfers.reduce((sum, t) => sum + t.bidAmount, 0),
      averageValue: 0,
      biggestTransfer: null,
      mostActiveClub: null,
      transfersByLeague: {},
      transfersByNationality: {},
      transfersByPosition: {}
    };

    if (summary.totalTransfers > 0) {
      summary.averageValue = Math.round(summary.totalValue / summary.totalTransfers);
      summary.biggestTransfer = windowTransfers.reduce((max, t) => 
        t.bidAmount > (max?.bidAmount || 0) ? t : max, null);

      // Calculate most active club
      const clubActivity = new Map();
      windowTransfers.forEach(t => {
        clubActivity.set(t.buyingTeam.id, (clubActivity.get(t.buyingTeam.id) || 0) + 1);
        clubActivity.set(t.sellingTeam.id, (clubActivity.get(t.sellingTeam.id) || 0) + 1);
      });

      const mostActiveClubId = Array.from(clubActivity.entries()).reduce((max, entry) =>
        entry[1] > (max?.[1] || 0) ? entry : max, null)?.[0];

      if (mostActiveClubId) {
        summary.mostActiveClub = this.gameState.worldSystem.allTeams.find(t => t.id === mostActiveClubId);
      }

      // Analyze transfers by various categories
      windowTransfers.forEach(t => {
        // By league tier
        const tier = t.buyingTeam.league?.tier || 'Unknown';
        summary.transfersByLeague[tier] = (summary.transfersByLeague[tier] || 0) + 1;

        // By nationality
        const nationality = t.player.nationality;
        summary.transfersByNationality[nationality] = (summary.transfersByNationality[nationality] || 0) + 1;

        // By position
        const position = t.player.position;
        summary.transfersByPosition[position] = (summary.transfersByPosition[position] || 0) + 1;
      });
    }

    return summary;
  }

  /**
   * Check if a specific transfer is allowed
   */
  validateTransferTiming(transfer) {
    // Check if window is open
    if (!this.isTransferWindowOpen()) {
      return {
        allowed: false,
        reason: 'Transfer window is closed'
      };
    }

    // Check registration deadlines
    if (!this.canRegisterPlayerByDeadline(transfer.player, transfer.buyingTeam)) {
      return {
        allowed: false,
        reason: 'Registration deadline has passed'
      };
    }

    // Check emergency transfer rules
    if (this.isEmergencyTransferRequired(transfer)) {
      if (!this.validateEmergencyTransfer(transfer)) {
        return {
          allowed: false,
          reason: 'Emergency transfer requirements not met'
        };
      }
    }

    return { allowed: true };
  }

  canRegisterPlayerByDeadline(player, team) {
    const now = new Date();

    // For domestic competitions
    if (now > this.registrationDeadlines.domestic) {
      // Only emergency signings allowed
      return false;
    }

    // For European competitions (if team qualifies)
    if (team.europeanCompetition && now > this.registrationDeadlines.european) {
      return false;
    }

    return true;
  }

  isEmergencyTransferRequired(transfer) {
    // Emergency transfers allowed outside normal windows in special cases
    if (this.isTransferWindowOpen()) return false;

    const team = transfer.buyingTeam;
    const position = transfer.player.position;

    // Check if team has insufficient players in position due to injuries
    const availableInPosition = team.players.filter(p => 
      p.position === position && !p.injured && p.suspension === 0
    ).length;

    // Minimum requirements by position
    const minimumByPosition = {
      'GK': 1,
      'CB': 2, 
      'FB': 2,
      'DM': 1,
      'CM': 2,
      'AM': 1,
      'W': 2,
      'ST': 1
    };

    return availableInPosition < (minimumByPosition[position] || 1);
  }

  validateEmergencyTransfer(transfer) {
    // Must be a free agent or loan
    if (transfer.bidAmount > 0) return false;

    // Player must be available (not injured, etc.)
    if (transfer.player.injured || transfer.player.suspension > 0) return false;

    // Must address genuine squad shortage
    return this.isEmergencyTransferRequired(transfer);
  }

  /**
   * Request emergency transfer outside window
   */
  requestEmergencyTransfer(buyingTeam, player, justification) {
    if (this.isTransferWindowOpen()) {
      return { approved: false, reason: 'Transfer window is open - use normal process' };
    }

    const emergency = {
      id: 'E' + Date.now(),
      buyingTeam,
      player,
      justification,
      requestedAt: Date.now(),
      status: 'pending'
    };

    // Auto-approve if meets emergency criteria
    if (this.isEmergencyTransferRequired({ buyingTeam, player })) {
      emergency.status = 'approved';
      emergency.approvedAt = Date.now();
      this.emergencyTransfers.push(emergency);

      console.log(`🚨 Emergency transfer approved: ${player.name} → ${buyingTeam.name}`);
      return { approved: true, emergencyId: emergency.id };
    }

    emergency.status = 'rejected';
    emergency.rejectedAt = Date.now();
    emergency.rejectionReason = 'Does not meet emergency criteria';

    return { 
      approved: false, 
      reason: emergency.rejectionReason,
      emergencyId: emergency.id
    };
  }

  /**
   * Auto-manage transfer windows based on game date
   */
  updateTransferWindows(gameDate = new Date()) {
    const month = gameDate.getMonth();
    const currentWindowType = this.currentWindow?.type;

    // Summer window (June - August)
    if (month >= 5 && month <= 7) { // June, July, August
      if (currentWindowType !== 'summer') {
        if (this.currentWindow) this.closeTransferWindow();
        this.openTransferWindow('summer');
      }
    }
    // Winter window (January)
    else if (month === 0) { // January
      if (currentWindowType !== 'winter') {
        if (this.currentWindow) this.closeTransferWindow();
        this.openTransferWindow('winter');
      }
    }
    // Closed period
    else if (this.currentWindow) {
      this.closeTransferWindow();
    }
  }

  /**
   * Get transfer window status
   */
  getWindowStatus() {
    if (!this.currentWindow) {
      return {
        isOpen: false,
        timeUntilNext: this.getTimeUntilNextWindow(),
        nextWindowType: this.getNextWindowType()
      };
    }

    const now = new Date();
    const timeRemaining = this.currentWindow.endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

    return {
      isOpen: this.isTransferWindowOpen(),
      currentWindow: this.currentWindow,
      daysRemaining: Math.max(0, daysRemaining),
      timeRemaining,
      registrationDeadlines: this.registrationDeadlines
    };
  }

  getTimeUntilNextWindow() {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    // Calculate next window start
    let nextWindowStart;
    if (currentMonth < 0 || currentMonth > 0 && currentMonth < 5) {
      // Next window is summer (June)
      nextWindowStart = new Date(now.getFullYear(), 5, 1);
    } else if (currentMonth >= 8) {
      // Next window is winter (January next year)
      nextWindowStart = new Date(now.getFullYear() + 1, 0, 1);
    } else {
      // Should be in a window period
      return 0;
    }

    return nextWindowStart.getTime() - now.getTime();
  }

  getNextWindowType() {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    if (currentMonth < 0 || (currentMonth > 0 && currentMonth < 5)) {
      return 'summer';
    } else if (currentMonth >= 8) {
      return 'winter';
    }
    
    return null;
  }

  /**
   * Get window history
   */
  getWindowHistory() {
    return [...this.windowHistory].sort((a, b) => b.closedAt - a.closedAt);
  }

  /**
   * Record transfer completion in current window
   */
  recordTransfer(transfer) {
    if (this.currentWindow) {
      this.currentWindow.transfersCompleted++;
      this.currentWindow.totalValue += transfer.bidAmount;
    }
  }
}
