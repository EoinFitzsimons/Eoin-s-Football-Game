/**
 * Registration Rules - Handles player registration constraints and rules
 */

export class RegistrationRules {
  constructor(gameState) {
    this.gameState = gameState;
    
    // Squad size limits by competition level
    this.squadLimits = {
      domestic: {
        maxSquadSize: 30,
        maxSeniorPlayers: 25,
        minHomegrownPlayers: 8,
        maxForeignPlayers: 17,
        maxLoanPlayers: 4
      },
      european: {
        maxSquadSize: 25,
        maxSeniorPlayers: 25,
        minHomegrownPlayers: 8,
        minClubGrownPlayers: 4,
        maxForeignPlayers: 17,
        maxLoanPlayers: 3
      },
      youth: {
        maxSquadSize: 35,
        maxOveragePlayers: 3 // Players over 23 in youth competitions
      }
    };
    
    // Age categories
    this.ageCategories = {
      youth: { max: 21 },
      senior: { min: 18 },
      veteran: { min: 35 }
    };
    
    // Registration periods
    this.registrationPeriods = {
      season: {
        start: new Date(2024, 5, 1), // June 1st
        end: new Date(2024, 8, 31)   // August 31st
      },
      midseason: {
        start: new Date(2025, 0, 1), // January 1st  
        end: new Date(2025, 0, 31)   // January 31st
      }
    };
  }

  /**
   * Validate player registration for a team
   */
  validateRegistration(team, player, competition = 'domestic') {
    const violations = [];
    const limits = this.squadLimits[competition];
    
    if (!limits) {
      violations.push({ type: 'invalid_competition', message: 'Invalid competition type' });
      return { valid: false, violations };
    }

    // Check squad size limits
    const squadSizeCheck = this.checkSquadSize(team, limits);
    if (!squadSizeCheck.valid) {
      violations.push(...squadSizeCheck.violations);
    }

    // Check age requirements
    const ageCheck = this.checkAgeRequirements(team, player, competition);
    if (!ageCheck.valid) {
      violations.push(...ageCheck.violations);
    }

    // Check nationality requirements
    const nationalityCheck = this.checkNationalityRequirements(team, player, limits);
    if (!nationalityCheck.valid) {
      violations.push(...nationalityCheck.violations);
    }

    // Check homegrown requirements
    const homegrownCheck = this.checkHomegrownRequirements(team, player, limits);
    if (!homegrownCheck.valid) {
      violations.push(...homegrownCheck.violations);
    }

    // Check loan player limits
    const loanCheck = this.checkLoanPlayerLimits(team, player, limits);
    if (!loanCheck.valid) {
      violations.push(...loanCheck.violations);
    }

    // Check registration timing
    const timingCheck = this.checkRegistrationTiming(player);
    if (!timingCheck.valid) {
      violations.push(...timingCheck.violations);
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings: this.generateWarnings(team, player, limits)
    };
  }

  checkSquadSize(team, limits) {
    const violations = [];
    const currentSquadSize = team.players.length;

    if (currentSquadSize >= limits.maxSquadSize) {
      violations.push({
        type: 'squad_size_exceeded',
        message: `Squad size limit exceeded (${currentSquadSize}/${limits.maxSquadSize})`
      });
    }

    const seniorPlayers = team.players.filter(p => p.age >= 18).length;
    if (seniorPlayers >= limits.maxSeniorPlayers) {
      violations.push({
        type: 'senior_players_exceeded', 
        message: `Senior players limit exceeded (${seniorPlayers}/${limits.maxSeniorPlayers})`
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  checkAgeRequirements(team, player, competition) {
    const violations = [];

    // Youth competition age limits
    if (competition === 'youth') {
      const overageLimit = this.squadLimits.youth.maxOveragePlayers;
      const overagePlayers = team.players.filter(p => p.age > 23).length;
      
      if (player.age > 23 && overagePlayers >= overageLimit) {
        violations.push({
          type: 'overage_limit_exceeded',
          message: `Too many overage players in youth competition (${overagePlayers}/${overageLimit})`
        });
      }
    }

    // Minimum age for professional contracts
    if (player.age < 16) {
      violations.push({
        type: 'underage_player',
        message: 'Player too young for professional registration'
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  checkNationalityRequirements(team, player, limits) {
    const violations = [];
    
    const teamCountry = team.country || 'Unknown';
    const foreignPlayers = team.players.filter(p => p.nationality !== teamCountry).length;
    
    if (player.nationality !== teamCountry && foreignPlayers >= limits.maxForeignPlayers) {
      violations.push({
        type: 'foreign_player_limit_exceeded',
        message: `Foreign player limit exceeded (${foreignPlayers}/${limits.maxForeignPlayers})`
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  checkHomegrownRequirements(team, player, limits) {
    const violations = [];
    
    if (!limits.minHomegrownPlayers) return { valid: true, violations };

    const teamCountry = team.country || 'Unknown';
    const homegrownPlayers = team.players.filter(p => 
      this.isHomegrownPlayer(p, teamCountry)
    ).length;

    const clubGrownPlayers = team.players.filter(p =>
      this.isClubGrownPlayer(p, team)
    ).length;

    // Check minimum homegrown requirement
    if (homegrownPlayers < limits.minHomegrownPlayers) {
      const needed = limits.minHomegrownPlayers - homegrownPlayers;
      violations.push({
        type: 'insufficient_homegrown_players',
        message: `Need ${needed} more homegrown players (${homegrownPlayers}/${limits.minHomegrownPlayers})`,
        severity: 'warning'
      });
    }

    // Check club-grown requirement (for European competition)
    if (limits.minClubGrownPlayers && clubGrownPlayers < limits.minClubGrownPlayers) {
      const needed = limits.minClubGrownPlayers - clubGrownPlayers;
      violations.push({
        type: 'insufficient_club_grown_players',
        message: `Need ${needed} more club-grown players (${clubGrownPlayers}/${limits.minClubGrownPlayers})`,
        severity: 'warning'
      });
    }

    return {
      valid: violations.filter(v => v.severity !== 'warning').length === 0,
      violations
    };
  }

  isHomegrownPlayer(player, country) {
    // Player is homegrown if they spent 3+ years training in the country before age 21
    if (player.nationality === country) return true;
    
    // Check development history (simplified)
    if (player.developmentCountry === country && player.yearsInCountry >= 3) {
      return true;
    }
    
    return false;
  }

  isClubGrownPlayer(player, team) {
    // Player is club-grown if they spent 3+ years at this club between ages 15-21
    if (player.formerClubs) {
      const clubHistory = player.formerClubs.find(c => c.clubId === team.id);
      if (clubHistory && clubHistory.yearsAtClub >= 3) {
        return true;
      }
    }
    
    // Check if currently long-serving youth product
    if (player.age <= 24 && player.yearsAtClub >= 3) {
      return true;
    }
    
    return false;
  }

  checkLoanPlayerLimits(team, player, limits) {
    const violations = [];
    
    if (!player.isLoanPlayer) return { valid: true, violations };

    const loanPlayers = team.players.filter(p => p.isLoanPlayer).length;
    
    if (loanPlayers >= limits.maxLoanPlayers) {
      violations.push({
        type: 'loan_player_limit_exceeded',
        message: `Loan player limit exceeded (${loanPlayers}/${limits.maxLoanPlayers})`
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  checkRegistrationTiming(player) {
    const violations = [];
    const now = new Date();
    
    // Check if within registration period
    const inSeasonPeriod = now >= this.registrationPeriods.season.start && 
                          now <= this.registrationPeriods.season.end;
    const inMidseasonPeriod = now >= this.registrationPeriods.midseason.start &&
                             now <= this.registrationPeriods.midseason.end;
    
    if (!inSeasonPeriod && !inMidseasonPeriod) {
      violations.push({
        type: 'registration_period_closed',
        message: 'Registration period is currently closed'
      });
    }

    // Check if player already registered elsewhere
    if (player.currentRegistration && player.currentRegistration !== 'free') {
      violations.push({
        type: 'already_registered',
        message: 'Player is already registered with another team'
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  generateWarnings(team, player, limits) {
    const warnings = [];

    // Warn about approaching limits
    const foreignPlayers = team.players.filter(p => 
      p.nationality !== (team.country || 'Unknown')
    ).length;
    
    if (foreignPlayers >= limits.maxForeignPlayers * 0.9) {
      warnings.push({
        type: 'approaching_foreign_limit',
        message: `Approaching foreign player limit (${foreignPlayers}/${limits.maxForeignPlayers})`
      });
    }

    // Warn about squad balance
    const goalkeepers = team.players.filter(p => p.position === 'GK').length;
    if (goalkeepers < 2) {
      warnings.push({
        type: 'insufficient_goalkeepers',
        message: 'Team has fewer than 2 goalkeepers registered'
      });
    }

    // Age distribution warnings
    const averageAge = team.players.reduce((sum, p) => sum + p.age, 0) / team.players.length;
    if (averageAge > 30) {
      warnings.push({
        type: 'aging_squad',
        message: `Squad average age is high (${averageAge.toFixed(1)} years)`
      });
    }

    return warnings;
  }

  /**
   * Get registration summary for a team
   */
  getRegistrationSummary(team, competition = 'domestic') {
    const limits = this.squadLimits[competition];
    const teamCountry = team.country || 'Unknown';

    const summary = {
      totalPlayers: team.players.length,
      maxSquadSize: limits.maxSquadSize,
      seniorPlayers: team.players.filter(p => p.age >= 18).length,
      youthPlayers: team.players.filter(p => p.age < 18).length,
      homegrownPlayers: team.players.filter(p => this.isHomegrownPlayer(p, teamCountry)).length,
      clubGrownPlayers: team.players.filter(p => this.isClubGrownPlayer(p, team)).length,
      foreignPlayers: team.players.filter(p => p.nationality !== teamCountry).length,
      loanPlayers: team.players.filter(p => p.isLoanPlayer).length,
      averageAge: team.players.reduce((sum, p) => sum + p.age, 0) / team.players.length,
      compliance: this.validateRegistration(team, null, competition)
    };

    // Position breakdown
    summary.positionBreakdown = {};
    team.players.forEach(player => {
      summary.positionBreakdown[player.position] = 
        (summary.positionBreakdown[player.position] || 0) + 1;
    });

    return summary;
  }

  /**
   * Register a player with a team
   */
  registerPlayer(team, player, competition = 'domestic') {
    const validation = this.validateRegistration(team, player, competition);
    
    if (!validation.valid) {
      return {
        success: false,
        reason: validation.violations[0].message,
        violations: validation.violations
      };
    }

    // Execute registration
    player.currentRegistration = team.id;
    player.registeredAt = Date.now();
    player.registeredFor = competition;
    
    // Add to team if not already there
    if (!team.players.find(p => p.id === player.id)) {
      team.players.push(player);
    }

    console.log(`📝 Player registered: ${player.name} → ${team.name} (${competition})`);

    return {
      success: true,
      registrationId: this.generateRegistrationId(),
      warnings: validation.warnings
    };
  }

  /**
   * Unregister a player from a team
   */
  unregisterPlayer(team, player) {
    const playerIndex = team.players.findIndex(p => p.id === player.id);
    
    if (playerIndex === -1) {
      return { success: false, reason: 'Player not found in team' };
    }

    // Remove from team
    team.players.splice(playerIndex, 1);
    
    // Clear registration
    player.currentRegistration = 'free';
    player.unregisteredAt = Date.now();

    console.log(`❌ Player unregistered: ${player.name} from ${team.name}`);

    return { success: true };
  }

  generateRegistrationId() {
    return 'R' + Date.now() + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Update registration periods
   */
  updateRegistrationPeriods(season) {
    this.registrationPeriods.season.start = new Date(season, 5, 1); // June 1st
    this.registrationPeriods.season.end = new Date(season, 8, 31);   // August 31st
    this.registrationPeriods.midseason.start = new Date(season + 1, 0, 1); // January 1st
    this.registrationPeriods.midseason.end = new Date(season + 1, 0, 31);   // January 31st
  }

  /**
   * Check if registration period is currently open
   */
  isRegistrationOpen() {
    const now = new Date();
    
    const inSeasonPeriod = now >= this.registrationPeriods.season.start && 
                          now <= this.registrationPeriods.season.end;
    const inMidseasonPeriod = now >= this.registrationPeriods.midseason.start &&
                             now <= this.registrationPeriods.midseason.end;
    
    return inSeasonPeriod || inMidseasonPeriod;
  }

  /**
   * Get registration status
   */
  getRegistrationStatus() {
    const now = new Date();
    const isOpen = this.isRegistrationOpen();
    
    let nextPeriod = null;
    if (!isOpen) {
      if (now < this.registrationPeriods.season.start) {
        nextPeriod = {
          type: 'season',
          start: this.registrationPeriods.season.start,
          end: this.registrationPeriods.season.end
        };
      } else if (now < this.registrationPeriods.midseason.start) {
        nextPeriod = {
          type: 'midseason',
          start: this.registrationPeriods.midseason.start,
          end: this.registrationPeriods.midseason.end
        };
      } else {
        // Next season
        const nextYear = now.getFullYear() + 1;
        nextPeriod = {
          type: 'season',
          start: new Date(nextYear, 5, 1),
          end: new Date(nextYear, 8, 31)
        };
      }
    }

    return {
      isOpen,
      currentPeriods: this.registrationPeriods,
      nextPeriod
    };
  }
}
