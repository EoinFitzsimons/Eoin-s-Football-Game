/**
 * PlayerStats - Comprehensive football statistics tracking system
 * Tracks all standard and advanced metrics for realistic football simulation
 */
export class PlayerStats {
  constructor(playerId, playerName, position) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.position = position;
    this.season = new Date().getFullYear();
    
    // Initialize all stat categories
    this.stats = {
      // 1. Standard Stats
      standard: {
        matchesPlayed: 0,
        starts: 0,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        nonPenaltyGoals: 0,
        yellowCards: 0,
        redCards: 0,
        // Per 90 metrics (calculated)
        goalsPer90: 0,
        assistsPer90: 0,
        nonPenaltyGoalsPer90: 0
      },
      
      // 2. Shooting
      shooting: {
        shots: 0,
        shotsOnTarget: 0,
        shotAccuracy: 0, // calculated
        goalsPerShot: 0, // calculated
        expectedGoals: 0,
        nonPenaltyXG: 0,
        postShotXG: 0,
        shotsFromInsideBox: 0,
        shotsFromOutsideBox: 0,
        bigChances: 0,
        bigChancesMissed: 0
      },
      
      // 3. Passing
      passing: {
        passesAttempted: 0,
        passesCompleted: 0,
        passCompletion: 0, // calculated
        progressivePasses: 0,
        keyPasses: 0,
        passesIntoFinalThird: 0,
        passesIntoPenaltyArea: 0,
        shortPasses: 0,
        mediumPasses: 0,
        longPasses: 0,
        backwardsPasses: 0,
        sidewaysPasses: 0,
        forwardPasses: 0
      },
      
      // 4. Passing Types
      passingTypes: {
        crosses: 0,
        crossesCompleted: 0,
        throughBalls: 0,
        throughBallsCompleted: 0,
        longBalls: 0,
        longBallsCompleted: 0,
        passesUnderPressure: 0,
        passesUnderPressureCompleted: 0,
        switches: 0,
        switchesCompleted: 0
      },
      
      // 5. Goal & Shot Creation
      creation: {
        shotCreatingActions: 0,
        goalCreatingActions: 0,
        scaPassLive: 0,
        scaPassDead: 0,
        scaDribbles: 0,
        scaShots: 0,
        scaFoulsDrawn: 0,
        gcaPassLive: 0,
        gcaPassDead: 0,
        gcaDribbles: 0,
        gcaShots: 0,
        gcaFoulsDrawn: 0
      },
      
      // 6. Defensive Actions
      defensive: {
        tackles: 0,
        tacklesWon: 0,
        tackleSuccess: 0, // calculated
        interceptions: 0,
        blocks: 0,
        shotsBlocked: 0,
        passesBlocked: 0,
        clearances: 0,
        headedClearances: 0,
        pressures: 0,
        pressuresSuccessful: 0,
        pressureSuccess: 0, // calculated
        recoveriesWon: 0,
        recoveriesLost: 0
      },
      
      // 7. Possession & Carrying
      possession: {
        touches: 0,
        touchesDefensiveThird: 0,
        touchesMiddleThird: 0,
        touchesAttackingThird: 0,
        touchesPenaltyArea: 0,
        progressiveCarries: 0,
        carriesIntoFinalThird: 0,
        carriesIntoPenaltyArea: 0,
        dribblesAttempted: 0,
        dribblesCompleted: 0,
        dribbleSuccess: 0, // calculated
        timesDispossessed: 0,
        timesTackled: 0
      },
      
      // 8. Aerial & Duels
      duels: {
        aerialDuelsWon: 0,
        aerialDuelsLost: 0,
        aerialWinPercentage: 0, // calculated
        groundDuelsWon: 0,
        groundDuelsLost: 0,
        groundDuelWinPercentage: 0, // calculated
        totalDuelsWon: 0,
        totalDuelsLost: 0,
        overallDuelWinPercentage: 0 // calculated
      },
      
      // 9. Fouls & Discipline
      discipline: {
        foulsCommitted: 0,
        foulsSuffered: 0,
        offsides: 0,
        handballs: 0,
        penaltiesWon: 0,
        penaltiesConceded: 0,
        penaltiesTaken: 0,
        penaltiesScored: 0,
        penaltiesMissed: 0,
        penaltySavesMade: 0, // for goalkeepers
        ownGoals: 0,
        errorLeadingToGoal: 0,
        errorLeadingToShot: 0
      },
      
      // 10. Goalkeeping (only for goalkeepers)
      goalkeeping: {
        saves: 0,
        savePercentage: 0, // calculated
        goalsAgainst: 0,
        cleanSheets: 0,
        postShotXGFaced: 0,
        goalsPrevented: 0, // calculated
        shotsFaced: 0,
        savesFromInsideBox: 0,
        savesFromOutsideBox: 0,
        crossesCaught: 0,
        crossesPunched: 0,
        highClaims: 0,
        distributionPasses: 0,
        distributionPassesCompleted: 0,
        goalkicks: 0,
        throwOuts: 0,
        averageLength: 0
      },
      
      // 11. Advanced Metrics
      advanced: {
        expectedAssists: 0,
        progressiveDistance: 0,
        pressingEfficiency: 0, // calculated
        passesReceived: 0,
        progressivePassesReceived: 0,
        miscontrols: 0,
        badTouches: 0,
        ballRecoveries: 0,
        timesPressured: 0,
        successfulPressureEvasions: 0
      }
    };
  }

  // ===============================================================================
  // STAT RECORDING METHODS
  // ===============================================================================

  recordMatchAppearance(startedMatch, minutesPlayed) {
    this.stats.standard.matchesPlayed++;
    if (startedMatch) this.stats.standard.starts++;
    this.stats.standard.minutesPlayed += minutesPlayed;
    this.calculatePer90Stats();
  }

  recordGoal(isPenalty = false, xGValue = 0.1, postShotXG = 0.1) {
    this.stats.standard.goals++;
    this.stats.shooting.expectedGoals += xGValue;
    this.stats.shooting.postShotXG += postShotXG;
    
    if (!isPenalty) {
      this.stats.standard.nonPenaltyGoals++;
      this.stats.shooting.nonPenaltyXG += xGValue;
    } else {
      this.stats.discipline.penaltiesTaken++;
      this.stats.discipline.penaltiesScored++;
    }
    
    this.calculateShootingStats();
    this.calculatePer90Stats();
  }

  recordAssist(expectedAssistValue = 0.1) {
    this.stats.standard.assists++;
    this.stats.advanced.expectedAssists += expectedAssistValue;
    this.calculatePer90Stats();
  }

  recordShot(onTarget = false, xGValue = 0.1, fromInsideBox = true, isBigChance = false) {
    this.stats.shooting.shots++;
    this.stats.shooting.expectedGoals += xGValue;
    
    if (onTarget) {
      this.stats.shooting.shotsOnTarget++;
    }
    
    if (fromInsideBox) {
      this.stats.shooting.shotsFromInsideBox++;
    } else {
      this.stats.shooting.shotsFromOutsideBox++;
    }
    
    if (isBigChance) {
      this.stats.shooting.bigChances++;
      if (!onTarget) {
        this.stats.shooting.bigChancesMissed++;
      }
    }
    
    this.calculateShootingStats();
  }

  recordPass(completed = true, distance = 'short', isProgressive = false, isKey = false, 
            intoFinalThird = false, intoPenaltyArea = false, underPressure = false) {
    this.stats.passing.passesAttempted++;
    
    if (completed) {
      this.stats.passing.passesCompleted++;
      
      // Distance categorization
      switch (distance) {
        case 'short':
          this.stats.passing.shortPasses++;
          break;
        case 'medium':
          this.stats.passing.mediumPasses++;
          break;
        case 'long':
          this.stats.passing.longPasses++;
          this.stats.passingTypes.longBalls++;
          this.stats.passingTypes.longBallsCompleted++;
          break;
      }
      
      if (isProgressive) this.stats.passing.progressivePasses++;
      if (isKey) this.stats.passing.keyPasses++;
      if (intoFinalThird) this.stats.passing.passesIntoFinalThird++;
      if (intoPenaltyArea) this.stats.passing.passesIntoPenaltyArea++;
    } else {
      // Incomplete pass
      if (distance === 'long') {
        this.stats.passingTypes.longBalls++;
      }
    }
    
    if (underPressure) {
      this.stats.passingTypes.passesUnderPressure++;
      if (completed) {
        this.stats.passingTypes.passesUnderPressureCompleted++;
      }
    }
    
    this.calculatePassingStats();
  }

  recordCross(completed = false) {
    this.stats.passingTypes.crosses++;
    if (completed) {
      this.stats.passingTypes.crossesCompleted++;
    }
  }

  recordThroughBall(completed = false) {
    this.stats.passingTypes.throughBalls++;
    if (completed) {
      this.stats.passingTypes.throughBallsCompleted++;
    }
  }

  recordDefensiveAction(type, successful = true) {
    switch (type) {
      case 'tackle':
        this.stats.defensive.tackles++;
        if (successful) this.stats.defensive.tacklesWon++;
        break;
      case 'interception':
        this.stats.defensive.interceptions++;
        break;
      case 'block':
        this.stats.defensive.blocks++;
        break;
      case 'clearance':
        this.stats.defensive.clearances++;
        break;
      case 'pressure':
        this.stats.defensive.pressures++;
        if (successful) this.stats.defensive.pressuresSuccessful++;
        break;
    }
    
    this.calculateDefensiveStats();
  }

  recordDribble(successful = true) {
    this.stats.possession.dribblesAttempted++;
    if (successful) {
      this.stats.possession.dribblesCompleted++;
    } else {
      this.stats.possession.timesDispossessed++;
    }
    this.calculatePossessionStats();
  }

  recordDuel(type, won = true) {
    switch (type) {
      case 'aerial':
        if (won) {
          this.stats.duels.aerialDuelsWon++;
        } else {
          this.stats.duels.aerialDuelsLost++;
        }
        break;
      case 'ground':
        if (won) {
          this.stats.duels.groundDuelsWon++;
        } else {
          this.stats.duels.groundDuelsLost++;
        }
        break;
    }
    
    this.calculateDuelStats();
  }

  recordCard(type) {
    if (type === 'yellow') {
      this.stats.standard.yellowCards++;
    } else if (type === 'red') {
      this.stats.standard.redCards++;
    }
  }

  recordFoul(committed = true) {
    if (committed) {
      this.stats.discipline.foulsCommitted++;
    } else {
      this.stats.discipline.foulsSuffered++;
    }
  }

  // Goalkeeper specific methods
  recordSave(fromInsideBox = true, postShotXG = 0.3) {
    if (this.position !== 'GK') return;
    
    this.stats.goalkeeping.saves++;
    this.stats.goalkeeping.shotsFaced++;
    this.stats.goalkeeping.postShotXGFaced += postShotXG;
    
    if (fromInsideBox) {
      this.stats.goalkeeping.savesFromInsideBox++;
    } else {
      this.stats.goalkeeping.savesFromOutsideBox++;
    }
    
    this.calculateGoalkeepingStats();
  }

  recordGoalConceded(postShotXG = 0.3) {
    if (this.position !== 'GK') return;
    
    this.stats.goalkeeping.goalsAgainst++;
    this.stats.goalkeeping.shotsFaced++;
    this.stats.goalkeeping.postShotXGFaced += postShotXG;
    
    this.calculateGoalkeepingStats();
  }

  recordCleanSheet() {
    if (this.position !== 'GK') return;
    this.stats.goalkeeping.cleanSheets++;
  }

  // ===============================================================================
  // CALCULATION METHODS
  // ===============================================================================

  calculatePer90Stats() {
    const minutes = this.stats.standard.minutesPlayed;
    if (minutes === 0) return;
    
    const per90Factor = 90 / minutes;
    
    this.stats.standard.goalsPer90 = this.stats.standard.goals * per90Factor;
    this.stats.standard.assistsPer90 = this.stats.standard.assists * per90Factor;
    this.stats.standard.nonPenaltyGoalsPer90 = this.stats.standard.nonPenaltyGoals * per90Factor;
  }

  calculateShootingStats() {
    const shots = this.stats.shooting.shots;
    if (shots > 0) {
      this.stats.shooting.shotAccuracy = (this.stats.shooting.shotsOnTarget / shots) * 100;
      this.stats.shooting.goalsPerShot = this.stats.standard.goals / shots;
    }
  }

  calculatePassingStats() {
    const attempted = this.stats.passing.passesAttempted;
    if (attempted > 0) {
      this.stats.passing.passCompletion = (this.stats.passing.passesCompleted / attempted) * 100;
    }
  }

  calculateDefensiveStats() {
    const tackles = this.stats.defensive.tackles;
    const pressures = this.stats.defensive.pressures;
    
    if (tackles > 0) {
      this.stats.defensive.tackleSuccess = (this.stats.defensive.tacklesWon / tackles) * 100;
    }
    
    if (pressures > 0) {
      this.stats.defensive.pressureSuccess = (this.stats.defensive.pressuresSuccessful / pressures) * 100;
      this.stats.advanced.pressingEfficiency = this.stats.defensive.pressureSuccess;
    }
  }

  calculatePossessionStats() {
    const dribbles = this.stats.possession.dribblesAttempted;
    if (dribbles > 0) {
      this.stats.possession.dribbleSuccess = (this.stats.possession.dribblesCompleted / dribbles) * 100;
    }
  }

  calculateDuelStats() {
    const aerialTotal = this.stats.duels.aerialDuelsWon + this.stats.duels.aerialDuelsLost;
    const groundTotal = this.stats.duels.groundDuelsWon + this.stats.duels.groundDuelsLost;
    
    if (aerialTotal > 0) {
      this.stats.duels.aerialWinPercentage = (this.stats.duels.aerialDuelsWon / aerialTotal) * 100;
    }
    
    if (groundTotal > 0) {
      this.stats.duels.groundDuelWinPercentage = (this.stats.duels.groundDuelsWon / groundTotal) * 100;
    }
    
    const totalDuels = aerialTotal + groundTotal;
    const totalWon = this.stats.duels.aerialDuelsWon + this.stats.duels.groundDuelsWon;
    
    if (totalDuels > 0) {
      this.stats.duels.overallDuelWinPercentage = (totalWon / totalDuels) * 100;
    }
  }

  calculateGoalkeepingStats() {
    if (this.position !== 'GK') return;
    
    const shotsFaced = this.stats.goalkeeping.shotsFaced;
    if (shotsFaced > 0) {
      this.stats.goalkeeping.savePercentage = (this.stats.goalkeeping.saves / shotsFaced) * 100;
    }
    
    // Goals prevented calculation
    this.stats.goalkeeping.goalsPrevented = 
      this.stats.goalkeeping.postShotXGFaced - this.stats.goalkeeping.goalsAgainst;
  }

  // ===============================================================================
  // UTILITY METHODS
  // ===============================================================================

  getStatsForCategory(category) {
    return this.stats[category] || {};
  }

  getAllStats() {
    return { ...this.stats };
  }

  getFormattedStats() {
    // Return formatted stats for display
    return {
      player: {
        id: this.playerId,
        name: this.playerName,
        position: this.position,
        season: this.season
      },
      performance: {
        appearances: `${this.stats.standard.starts}(${this.stats.standard.matchesPlayed})`,
        minutes: this.stats.standard.minutesPlayed,
        goals: this.stats.standard.goals,
        assists: this.stats.standard.assists,
        goalsPer90: this.stats.standard.goalsPer90.toFixed(2),
        assistsPer90: this.stats.standard.assistsPer90.toFixed(2)
      },
      shooting: {
        shots: this.stats.shooting.shots,
        onTarget: this.stats.shooting.shotsOnTarget,
        accuracy: `${this.stats.shooting.shotAccuracy.toFixed(1)}%`,
        xG: this.stats.shooting.expectedGoals.toFixed(2)
      },
      passing: {
        attempted: this.stats.passing.passesAttempted,
        completed: this.stats.passing.passesCompleted,
        completion: `${this.stats.passing.passCompletion.toFixed(1)}%`,
        keyPasses: this.stats.passing.keyPasses
      },
      defensive: {
        tackles: `${this.stats.defensive.tacklesWon}/${this.stats.defensive.tackles}`,
        interceptions: this.stats.defensive.interceptions,
        clearances: this.stats.defensive.clearances
      }
    };
  }

  resetSeasonStats() {
    // Reset all stats for new season while keeping player info
    const playerInfo = {
      playerId: this.playerId,
      playerName: this.playerName,
      position: this.position
    };
    
    this.stats = new PlayerStats(playerInfo.playerId, playerInfo.playerName, playerInfo.position).stats;
    this.season = new Date().getFullYear();
  }
}
