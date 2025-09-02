/**
 * Transfer Market - Manages player transfers between clubs
 * Handles valuations, negotiations, and market dynamics
 */

export class TransferMarket {
  constructor(gameState) {
    this.gameState = gameState;
    this.transfersInProgress = new Map(); // transferId -> transfer object
    this.marketHistory = []; // Historical transfer data
    this.currentWindow = null;
    
    // Market dynamics
    this.inflation = 1.0; // Market inflation multiplier
    this.demandFactors = new Map(); // playerId -> demand level
    this.clubFinances = new Map(); // clubId -> financial data
    
    this.initializeMarketData();
  }

  initializeMarketData() {
    // Initialize club financial data
    if (this.gameState.worldSystem) {
      this.gameState.worldSystem.allTeams.forEach(team => {
        this.clubFinances.set(team.id, {
          budget: this.calculateClubBudget(team),
          wages: this.calculateCurrentWages(team),
          wageLimit: this.calculateWageLimit(team),
          transfersIn: [],
          transfersOut: [],
          netSpend: 0
        });
      });
    }
  }

  calculateClubBudget(team) {
    // Budget based on league tier and team reputation
    const tier = team.league?.tier || 3;
    const baseBudget = {
      1: 50000000,  // €50M for top tier
      2: 15000000,  // €15M for second tier  
      3: 5000000    // €5M for third tier
    }[tier];

    const reputationMultiplier = (team.reputation || 50) / 50;
    return Math.round(baseBudget * reputationMultiplier * this.inflation);
  }

  calculateCurrentWages(team) {
    return team.players.reduce((total, player) => total + (player.wage || 0), 0);
  }

  calculateWageLimit(team) {
    const tier = team.league?.tier || 3;
    const baseLimit = {
      1: 2000000,   // €2M per week for top tier
      2: 800000,    // €800K per week for second tier
      3: 300000     // €300K per week for third tier  
    }[tier];

    return Math.round(baseLimit * this.inflation);
  }

  /**
   * List players available for transfer
   */
  getAvailablePlayers(filters = {}) {
    const availablePlayers = [];
    
    if (!this.gameState.worldSystem) return availablePlayers;

    this.gameState.worldSystem.allTeams.forEach(team => {
      team.players.forEach(player => {
        if (this.isPlayerAvailable(player, team, filters)) {
          availablePlayers.push({
            player,
            currentTeam: team,
            askingPrice: this.calculateAskingPrice(player, team),
            marketValue: player.value,
            demand: this.demandFactors.get(player.id) || 0.5,
            transferListed: player.transferListed || false
          });
        }
      });
    });

    return this.sortPlayersByRelevance(availablePlayers, filters);
  }

  isPlayerAvailable(player, team, filters) {
    // Check basic availability
    if (player.injured && player.injuryDays > 30) return false;
    if (player.suspension > 5) return false;
    
    // Check transfer listing
    if (filters.transferListedOnly && !player.transferListed) return false;
    
    // Check age filters
    if (filters.minAge && player.age < filters.minAge) return false;
    if (filters.maxAge && player.age > filters.maxAge) return false;
    
    // Check position filters
    if (filters.positions && !filters.positions.includes(player.position)) return false;
    
    // Check nationality filters
    if (filters.nationalities && !filters.nationalities.includes(player.nationality)) return false;
    
    // Check value range
    if (filters.minValue && player.value < filters.minValue) return false;
    if (filters.maxValue && player.value > filters.maxValue) return false;
    
    return true;
  }

  calculateAskingPrice(player, team) {
    let basePrice = player.value;
    
    // Team reluctance factors
    if (this.isKeyPlayer(player, team)) {
      basePrice *= 1.5; // 50% premium for key players
    }
    
    if (player.transferListed) {
      basePrice *= 0.85; // 15% discount for listed players
    }
    
    // Contract situation
    const contractYearsLeft = this.getContractYearsLeft(player);
    if (contractYearsLeft < 1) {
      basePrice *= 0.6; // 40% discount for expiring contracts
    } else if (contractYearsLeft < 2) {
      basePrice *= 0.8; // 20% discount for short contracts
    }
    
    // Age factors
    if (player.age > 30) {
      basePrice *= 0.9; // 10% discount for older players
    } else if (player.age < 21) {
      basePrice *= 1.2; // 20% premium for young players
    }
    
    // Market demand
    const demand = this.demandFactors.get(player.id) || 0.5;
    basePrice *= (0.7 + demand * 0.6); // 70% to 130% based on demand
    
    return Math.max(50000, Math.round(basePrice));
  }

  isKeyPlayer(player, team) {
    // Check if player is in starting XI regularly
    const teamAverageRating = team.players.reduce((sum, p) => sum + p.overallRating, 0) / team.players.length;
    return player.overallRating > teamAverageRating * 1.1;
  }

  getContractYearsLeft(player) {
    // Simple contract system - can be expanded
    return player.contractYears || Math.floor(Math.random() * 4) + 1;
  }

  /**
   * Initiate a transfer bid
   */
  makeBid(buyingTeam, sellingTeam, player, bidAmount, playerTerms = {}) {
    const transferId = this.generateTransferId();
    
    // Validate bid
    const validation = this.validateBid(buyingTeam, sellingTeam, player, bidAmount);
    if (!validation.valid) {
      return { success: false, reason: validation.reason, transferId: null };
    }
    
    const transfer = {
      id: transferId,
      buyingTeam,
      sellingTeam,
      player,
      bidAmount,
      playerTerms: {
        wage: playerTerms.wage || player.wage * 1.1,
        contractYears: playerTerms.contractYears || 3,
        bonuses: playerTerms.bonuses || {}
      },
      status: 'pending_club_response',
      bidHistory: [{
        amount: bidAmount,
        timestamp: Date.now(),
        type: 'initial_bid'
      }],
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    this.transfersInProgress.set(transferId, transfer);
    
    // Process club response
    setTimeout(() => this.processClubResponse(transferId), 1000);
    
    return { success: true, transferId, transfer };
  }

  validateBid(buyingTeam, sellingTeam, player, bidAmount) {
    // Check if player exists in selling team
    if (!sellingTeam.players.find(p => p.id === player.id)) {
      return { valid: false, reason: 'Player not found in selling team' };
    }
    
    // Check buying team budget
    const clubFinances = this.clubFinances.get(buyingTeam.id);
    if (!clubFinances || clubFinances.budget < bidAmount) {
      return { valid: false, reason: 'Insufficient funds' };
    }
    
    // Check wage constraints
    const proposedWages = this.calculateCurrentWages(buyingTeam) + (player.wage * 1.1);
    if (proposedWages > clubFinances.wageLimit) {
      return { valid: false, reason: 'Would exceed wage limit' };
    }
    
    // Check squad registration rules
    if (!this.canRegisterPlayer(buyingTeam, player)) {
      return { valid: false, reason: 'Cannot register player (squad rules)' };
    }
    
    return { valid: true };
  }

  canRegisterPlayer(team, player) {
    // Basic squad size check
    if (team.players.length >= 30) return false;
    
    // Position-specific limits (simplified)
    const positionCount = team.players.filter(p => p.position === player.position).length;
    const maxByPosition = { 'GK': 3, 'CB': 6, 'FB': 4, 'DM': 4, 'CM': 6, 'AM': 4, 'W': 6, 'ST': 4 };
    
    for (const [pos, max] of Object.entries(maxByPosition)) {
      if (player.position.includes(pos) && positionCount >= max) return false;
    }
    
    return true;
  }

  processClubResponse(transferId) {
    const transfer = this.transfersInProgress.get(transferId);
    if (!transfer || transfer.status !== 'pending_club_response') return;
    
    const askingPrice = this.calculateAskingPrice(transfer.player, transfer.sellingTeam);
    const bidRatio = transfer.bidAmount / askingPrice;
    
    let responseChance;
    if (bidRatio >= 1.2) responseChance = 0.95; // Very high bid
    else if (bidRatio >= 1.0) responseChance = 0.8; // Fair bid  
    else if (bidRatio >= 0.8) responseChance = 0.4; // Low bid
    else responseChance = 0.1; // Very low bid
    
    // Adjust for player/team factors
    if (transfer.player.transferListed) responseChance += 0.2;
    if (this.isKeyPlayer(transfer.player, transfer.sellingTeam)) responseChance -= 0.3;
    
    const accepted = Math.random() < responseChance;
    
    if (accepted) {
      transfer.status = 'pending_player_response';
      transfer.clubAcceptedAt = Date.now();
      setTimeout(() => this.processPlayerResponse(transferId), 500);
    } else {
      // Counter offer or rejection
      if (bidRatio > 0.7 && Math.random() < 0.6) {
        const counterOffer = Math.round(askingPrice * (0.9 + Math.random() * 0.2));
        transfer.status = 'counter_offer';
        transfer.counterOffer = counterOffer;
        transfer.bidHistory.push({
          amount: counterOffer,
          timestamp: Date.now(),
          type: 'counter_offer'
        });
      } else {
        transfer.status = 'rejected_by_club';
        transfer.rejectedAt = Date.now();
        this.transfersInProgress.delete(transferId);
      }
    }
    
    // Notify game state of transfer update
    if (this.gameState.eventCallbacks?.transferUpdate) {
      this.gameState.eventCallbacks.transferUpdate(transfer);
    }
  }

  processPlayerResponse(transferId) {
    const transfer = this.transfersInProgress.get(transferId);
    if (!transfer || transfer.status !== 'pending_player_response') return;
    
    // Player acceptance based on various factors
    let acceptanceChance = 0.7; // Base 70%
    
    // Wage improvement
    const currentWage = transfer.player.wage;
    const offeredWage = transfer.playerTerms.wage;
    const wageRatio = offeredWage / currentWage;
    
    if (wageRatio > 1.5) acceptanceChance += 0.2;
    else if (wageRatio > 1.2) acceptanceChance += 0.1;
    else if (wageRatio < 1.0) acceptanceChance -= 0.3;
    
    // League tier comparison
    const currentTier = transfer.sellingTeam.league?.tier || 3;
    const newTier = transfer.buyingTeam.league?.tier || 3;
    
    if (newTier < currentTier) acceptanceChance += 0.2; // Moving to better league
    else if (newTier > currentTier) acceptanceChance -= 0.2; // Moving to worse league
    
    // Team reputation
    const repDiff = (transfer.buyingTeam.reputation || 50) - (transfer.sellingTeam.reputation || 50);
    acceptanceChance += repDiff * 0.01;
    
    // Player traits influence
    if (transfer.player.traits?.includes('Ambitious')) acceptanceChance += 0.1;
    if (transfer.player.traits?.includes('Loyal')) acceptanceChance -= 0.15;
    
    const accepted = Math.random() < Math.max(0.1, Math.min(0.95, acceptanceChance));
    
    if (accepted) {
      this.completeTransfer(transferId);
    } else {
      transfer.status = 'rejected_by_player';
      transfer.rejectedAt = Date.now();
      this.transfersInProgress.delete(transferId);
    }
    
    // Notify game state
    if (this.gameState.eventCallbacks?.transferUpdate) {
      this.gameState.eventCallbacks.transferUpdate(transfer);
    }
  }

  completeTransfer(transferId) {
    const transfer = this.transfersInProgress.get(transferId);
    if (!transfer) return;
    
    // Execute the transfer
    const success = this.executePlayerTransfer(transfer);
    
    if (success) {
      transfer.status = 'completed';
      transfer.completedAt = Date.now();
      
      // Update club finances
      this.updateClubFinances(transfer);
      
      // Record in history
      this.marketHistory.push({
        ...transfer,
        season: this.gameState.currentSeason,
        window: this.currentWindow
      });
      
      console.log(`✅ Transfer completed: ${transfer.player.name} → ${transfer.buyingTeam.name} for €${transfer.bidAmount.toLocaleString()}`);
    } else {
      transfer.status = 'failed';
      transfer.failedAt = Date.now();
    }
    
    this.transfersInProgress.delete(transferId);
    
    if (this.gameState.eventCallbacks?.transferCompleted) {
      this.gameState.eventCallbacks.transferCompleted(transfer);
    }
  }

  executePlayerTransfer(transfer) {
    try {
      // Remove player from selling team
      const sellingIndex = transfer.sellingTeam.players.findIndex(p => p.id === transfer.player.id);
      if (sellingIndex === -1) return false;
      
      transfer.sellingTeam.players.splice(sellingIndex, 1);
      
      // Update player contract details
      transfer.player.wage = transfer.playerTerms.wage;
      transfer.player.contractYears = transfer.playerTerms.contractYears;
      transfer.player.morale = Math.min(100, transfer.player.morale + 10); // Happy with move
      transfer.player.transferListed = false;
      
      // Add player to buying team  
      transfer.buyingTeam.players.push(transfer.player);
      
      return true;
    } catch (error) {
      console.error('Transfer execution failed:', error);
      return false;
    }
  }

  updateClubFinances(transfer) {
    const buyingFinances = this.clubFinances.get(transfer.buyingTeam.id);
    const sellingFinances = this.clubFinances.get(transfer.sellingTeam.id);
    
    if (buyingFinances) {
      buyingFinances.budget -= transfer.bidAmount;
      buyingFinances.netSpend += transfer.bidAmount;
      buyingFinances.transfersIn.push(transfer);
    }
    
    if (sellingFinances) {
      sellingFinances.budget += transfer.bidAmount * 0.9; // 10% agent/admin fees
      sellingFinances.netSpend -= transfer.bidAmount;
      sellingFinances.transfersOut.push(transfer);
    }
  }

  generateTransferId() {
    return 'T' + Date.now() + Math.random().toString(36).substr(2, 5);
  }

  sortPlayersByRelevance(players, filters) {
    return players.sort((a, b) => {
      // Primary sort by overall rating
      const ratingDiff = (b.player.overallRating || 50) - (a.player.overallRating || 50);
      if (Math.abs(ratingDiff) > 5) return ratingDiff;
      
      // Secondary sort by age (prefer younger)
      const ageDiff = a.player.age - b.player.age;
      if (Math.abs(ageDiff) > 3) return ageDiff;
      
      // Tertiary sort by value
      return b.marketValue - a.marketValue;
    });
  }

  /**
   * Get all active transfers
   */
  getActiveTransfers() {
    return Array.from(this.transfersInProgress.values());
  }

  /**
   * Get transfer history
   */
  getTransferHistory(filters = {}) {
    let history = [...this.marketHistory];
    
    if (filters.season) {
      history = history.filter(t => t.season === filters.season);
    }
    
    if (filters.team) {
      history = history.filter(t => 
        t.buyingTeam.id === filters.team.id || t.sellingTeam.id === filters.team.id
      );
    }
    
    return history.sort((a, b) => b.completedAt - a.completedAt);
  }

  /**
   * Update market dynamics (call periodically)
   */
  updateMarketDynamics() {
    // Update inflation
    this.inflation *= 1 + (Math.random() - 0.5) * 0.02; // ±1% random change
    this.inflation = Math.max(0.8, Math.min(1.5, this.inflation)); // Clamp between 80%-150%
    
    // Update player demand based on recent performance
    if (this.gameState.worldSystem) {
      this.gameState.worldSystem.allTeams.forEach(team => {
        team.players.forEach(player => {
          let demand = this.demandFactors.get(player.id) || 0.5;
          
          // Adjust based on recent form and performance
          if (player.form > 80) demand += 0.1;
          else if (player.form < 30) demand -= 0.1;
          
          if (player.lastMatchRating > 8.0) demand += 0.05;
          else if (player.lastMatchRating < 5.0) demand -= 0.05;
          
          // Age factors
          if (player.age < 22 && player.potential > 80) demand += 0.1;
          if (player.age > 32) demand -= 0.05;
          
          this.demandFactors.set(player.id, Math.max(0.1, Math.min(1.0, demand)));
        });
      });
    }
  }

  /**
   * Process a transfer between clubs
   * @param {Player} player - The player being transferred
   * @param {Team} buyingClub - The club buying the player
   * @param {number} offerAmount - The transfer fee offered
   * @returns {Object} Transfer result with success status and details
   */
  processTransfer(player, buyingClub, offerAmount) {
    try {
      console.log(`💰 Processing transfer: ${player.name} to ${buyingClub.name} for ${this.formatMoney(offerAmount)}`);
      
      // Find current club
      const currentClub = this.findPlayerClub(player);
      if (!currentClub) {
        return { success: false, message: 'Player\'s current club not found' };
      }
      
      // Check if transfer window is open
      if (!this.gameState.transferWindow?.isTransferWindowOpen()) {
        return { success: false, message: 'Transfer window is closed' };
      }
      
      // Check buying club budget
      const buyingClubFinances = this.clubFinances.get(buyingClub.id);
      if (!buyingClubFinances || buyingClubFinances.budget < offerAmount) {
        return { success: false, message: 'Insufficient funds' };
      }
      
      // Check squad space
      if (buyingClub.players.length >= 25) {
        return { success: false, message: 'Squad is full (maximum 25 players)' };
      }
      
      // Calculate player value and negotiate
      const playerValue = this.getPlayerValue(player);
      const minimumAcceptable = playerValue * 0.8; // Clubs will accept 80% of value
      
      if (offerAmount < minimumAcceptable) {
        return { 
          success: false, 
          message: `Offer too low. Minimum acceptable: ${this.formatMoney(minimumAcceptable)}` 
        };
      }
      
      // Process the transfer
      const transferFee = offerAmount;
      const wages = this.calculatePlayerWages(player, buyingClub);
      const contractLength = this.calculateContractLength(player);
      
      // Remove player from current club
      const playerIndex = currentClub.players.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        currentClub.players.splice(playerIndex, 1);
      }
      
      // Add player to buying club
      player.club = buyingClub.name;
      player.clubId = buyingClub.id;
      player.contractLength = contractLength;
      player.wages = wages;
      player.transferValue = transferFee;
      buyingClub.players.push(player);
      
      // Update club finances
      if (buyingClubFinances) {
        buyingClubFinances.budget -= transferFee;
        buyingClubFinances.transfersIn.push({
          player: player.name,
          from: currentClub.name,
          fee: transferFee,
          date: new Date(),
          wages: wages,
          contract: contractLength
        });
        buyingClubFinances.netSpend += transferFee;
      }
      
      // Update selling club finances
      const sellingClubFinances = this.clubFinances.get(currentClub.id);
      if (sellingClubFinances) {
        sellingClubFinances.budget += transferFee;
        sellingClubFinances.transfersOut.push({
          player: player.name,
          to: buyingClub.name,
          fee: transferFee,
          date: new Date()
        });
        sellingClubFinances.netSpend -= transferFee;
      }
      
      // Record transfer in history
      const transferRecord = {
        id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        player: {
          id: player.id,
          name: player.name,
          position: player.position,
          age: player.age,
          rating: player.overallRating || player.rating
        },
        from: {
          id: currentClub.id,
          name: currentClub.name,
          league: currentClub.league
        },
        to: {
          id: buyingClub.id,
          name: buyingClub.name,
          league: buyingClub.league
        },
        fee: transferFee,
        wages: wages,
        contractLength: contractLength,
        date: new Date(),
        window: this.currentWindow || 'summer'
      };
      
      this.marketHistory.push(transferRecord);
      
      // Update game statistics
      if (this.gameState.stats) {
        this.gameState.stats.transfersCompleted++;
      }
      
      console.log(`✅ Transfer completed: ${player.name} → ${buyingClub.name}`);
      
      return {
        success: true,
        message: `Transfer completed successfully`,
        transfer: transferRecord,
        playerWages: wages,
        contractLength: contractLength
      };
      
    } catch (error) {
      console.error('❌ Error processing transfer:', error);
      return { success: false, message: 'Transfer processing error' };
    }
  }

  /**
   * Find which club a player currently belongs to
   */
  findPlayerClub(player) {
    if (!this.gameState.worldSystem?.allTeams) return null;
    
    for (const team of this.gameState.worldSystem.allTeams) {
      if (team.players.some(p => p.id === player.id)) {
        return team;
      }
    }
    return null;
  }

  /**
   * Calculate appropriate wages for a player at a specific club
   */
  calculatePlayerWages(player, club) {
    const baseWage = (player.overallRating || player.rating || 50) * 1000; // €1k per rating point per week
    const clubMultiplier = this.getClubWageMultiplier(club);
    const positionMultiplier = this.getPositionWageMultiplier(player.position);
    
    return Math.round(baseWage * clubMultiplier * positionMultiplier);
  }

  /**
   * Calculate contract length based on player age and quality
   */
  calculateContractLength(player) {
    const age = player.age;
    const rating = player.overallRating || player.rating || 50;
    
    if (age < 20 && rating > 70) return 5; // Long contract for young talent
    if (age < 25 && rating > 80) return 4; // Good contract for prime talent
    if (age < 30 && rating > 75) return 3; // Standard contract
    if (age < 35) return 2; // Shorter for older players
    return 1; // Short contract for veterans
  }

  /**
   * Get club wage multiplier based on league tier and reputation
   */
  getClubWageMultiplier(club) {
    const tier = club.tier || 3;
    const baseMultiplier = {
      1: 1.5,  // Top tier clubs pay 150% of base
      2: 1.0,  // Second tier pays base rate
      3: 0.7   // Third tier pays 70% of base
    }[tier];
    
    const reputationMultiplier = ((club.reputation || 50) / 50);
    return baseMultiplier * reputationMultiplier;
  }

  /**
   * Get position wage multiplier (some positions command higher wages)
   */
  getPositionWageMultiplier(position) {
    const multipliers = {
      'GK': 0.9,
      'CB': 1.0,
      'LB': 1.0,
      'RB': 1.0,
      'DM': 1.0,
      'CM': 1.1,
      'AM': 1.2,
      'LW': 1.2,
      'RW': 1.2,
      'ST': 1.3
    };
    
    return multipliers[position] || 1.0;
  }

  /**
   * Format money amount for display
   */
  formatMoney(amount) {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`;
    } else {
      return `€${amount}`;
    }
  }
}
