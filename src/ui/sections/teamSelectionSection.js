import { BaseSection } from './baseSection.js';

export class TeamSelectionSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.sectionId = 'team-selection';
    this.title = 'Choose Your Team';
    
    this.selectedCountry = null;
    this.selectedLeague = null;
    this.selectedTeam = null;
  }

  getTitle() {
    return this.title;
  }

  getStep2Class() {
    if (this.selectedLeague) return 'completed';
    if (this.selectedCountry) return 'active';
    return '';
  }

  getStep3Class() {
    if (this.selectedTeam) return 'completed';
    if (this.selectedLeague) return 'active';
    return '';
  }

  render(container) {
    const teamSelection = document.createElement('div');
    teamSelection.className = 'team-selection-section';
    
    teamSelection.innerHTML = `
      <div class="team-selection-container">
        <div class="selection-header">
          <h1>🌍 Choose Your Team</h1>
          <p>Select a country, league, and team to begin your managerial career</p>
          <button id="back-to-menu" class="back-btn">← Back to Menu</button>
        </div>
        
          <div class="selection-steps">
            <div class="step-indicator">
              <div class="step ${this.selectedCountry ? 'completed' : 'active'}" data-step="1">
                <span class="step-number">1</span>
                <span class="step-label">Country</span>
              </div>
              <div class="step ${this.getStep2Class()}" data-step="2">
                <span class="step-number">2</span>
                <span class="step-label">League</span>
              </div>
              <div class="step ${this.getStep3Class()}" data-step="3">
                <span class="step-number">3</span>
                <span class="step-label">Team</span>
              </div>
            </div>
          </div>        <div class="selection-content">
          ${this.renderSelectionContent()}
        </div>
        
        <div class="selection-actions">
          ${this.renderActionButtons()}
        </div>
      </div>
    `;

    this.setupEventListeners(teamSelection);
    container.appendChild(teamSelection);
  }

  renderSelectionContent() {
    if (!this.selectedCountry) {
      return this.renderCountrySelection();
    } else if (!this.selectedLeague) {
      return this.renderLeagueSelection();
    } else if (!this.selectedTeam) {
      return this.renderTeamSelection();
    } else {
      return this.renderTeamConfirmation();
    }
  }

  renderCountrySelection() {
    const countries = this.gameState.worldSystem?.countries || [];
    
    return `
      <div class="country-selection">
        <h3>🌍 Select a Country</h3>
        <div class="countries-grid">
          ${countries.map(country => `
            <div class="country-card" data-country="${country.name}">
              <div class="country-flag">🏴</div>
              <div class="country-info">
                <h4>${country.name}</h4>
                <p>${country.leagues.length} leagues • ${country.leagues.reduce((total, league) => total + league.teams.length, 0)} teams</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderLeagueSelection() {
    const leagues = this.selectedCountry?.leagues || [];
    
    return `
      <div class="league-selection">
        <h3>🏆 Select a League in ${this.selectedCountry.name}</h3>
        <div class="leagues-list">
          ${leagues.map(league => `
            <div class="league-card" data-league="${league.name}">
              <div class="league-tier">Tier ${league.tier}</div>
              <div class="league-info">
                <h4>${league.name}</h4>
                <p>${league.teams.length} teams</p>
              </div>
              <div class="league-arrow">→</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderTeamSelection() {
    const teams = this.selectedLeague?.teams || [];
    
    return `
      <div class="team-selection">
        <h3>⚽ Select Your Team from ${this.selectedLeague.name}</h3>
        <div class="teams-grid">
          ${teams.map(team => `
            <div class="team-card" data-team-id="${team.id || team.name}" data-team-name="${team.name}">
              <div class="team-badge">🏟️</div>
              <div class="team-info">
                <h4>${team.name}</h4>
                <div class="team-stats">
                  <span>Players: ${team.players?.length || 0}</span>
                  <span>Founded: ${team.founded || 'Unknown'}</span>
                  <span>City: ${team.city || 'Unknown'}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderTeamConfirmation() {
    const team = this.selectedTeam;
    const league = this.selectedLeague;
    const country = this.selectedCountry;
    
    return `
      <div class="team-confirmation">
        <h3>🎯 Confirm Your Selection</h3>
        <div class="selected-team-card">
          <div class="team-badge-large">🏟️</div>
          <div class="team-details">
            <h2>${team.name}</h2>
            <p class="team-location">${team.city || 'Unknown City'}, ${country.name}</p>
            <div class="team-overview">
              <div class="stat">
                <span class="stat-label">Squad Size:</span>
                <span class="stat-value">${team.players?.length || 0} players</span>
              </div>
              <div class="stat">
                <span class="stat-label">League:</span>
                <span class="stat-value">${league.name} (Tier ${league.tier})</span>
              </div>
              <div class="stat">
                <span class="stat-label">Founded:</span>
                <span class="stat-value">${team.founded || 'Unknown'}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Stadium:</span>
                <span class="stat-value">${team.stadium || team.name + ' Stadium'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="confirmation-message">
          <p>Ready to take charge of <strong>${team.name}</strong> and lead them to glory?</p>
        </div>
      </div>
    `;
  }

  renderActionButtons() {
    if (!this.selectedCountry) {
      return '';
    } else if (!this.selectedLeague) {
      return `
        <button id="back-country" class="secondary-btn">← Back to Countries</button>
      `;
    } else if (!this.selectedTeam) {
      return `
        <button id="back-league" class="secondary-btn">← Back to Leagues</button>
      `;
    } else {
      return `
        <button id="back-team" class="secondary-btn">← Back to Teams</button>
        <button id="confirm-selection" class="primary-btn">Start Career →</button>
      `;
    }
  }

  setupEventListeners(container) {
    // Back to menu
    const backToMenu = container.querySelector('#back-to-menu');
    if (backToMenu) {
      backToMenu.addEventListener('click', () => {
        if (this.gameState.eventCallbacks.showMainMenu) {
          this.gameState.eventCallbacks.showMainMenu();
        }
      });
    }

    // Country selection
    const countryCards = container.querySelectorAll('.country-card');
    countryCards.forEach(card => {
      card.addEventListener('click', () => {
        const countryName = card.dataset.country;
        this.selectedCountry = this.gameState.worldSystem.countries.find(c => c.name === countryName);
        this.selectedLeague = null;
        this.selectedTeam = null;
        this.refresh();
      });
    });

    // League selection
    const leagueCards = container.querySelectorAll('.league-card');
    leagueCards.forEach(card => {
      card.addEventListener('click', () => {
        const leagueName = card.dataset.league;
        this.selectedLeague = this.selectedCountry.leagues.find(l => l.name === leagueName);
        this.selectedTeam = null;
        this.refresh();
      });
    });

    // Team selection
    const teamCards = container.querySelectorAll('.team-card');
    teamCards.forEach(card => {
      card.addEventListener('click', () => {
        const teamId = card.dataset.teamId;
        console.log('🏟️ Team card clicked, looking for team with ID:', teamId);
        
        // Try to find by ID first, then fallback to name
        let selectedTeam = this.selectedLeague.teams.find(t => t.id === teamId);
        if (!selectedTeam) {
          // Fallback: use the name from the card
          const teamName = card.querySelector('h4').textContent;
          selectedTeam = this.selectedLeague.teams.find(t => t.name === teamName);
          console.log('🔄 Fallback: searching by name:', teamName);
        }
        
        if (selectedTeam) {
          console.log('✅ Team selected:', selectedTeam.name);
          this.selectedTeam = selectedTeam;
          this.refresh();
        } else {
          console.error('❌ Team not found for ID:', teamId);
        }
      });
    });

    // Navigation buttons
    const backCountry = container.querySelector('#back-country');
    if (backCountry) {
      backCountry.addEventListener('click', () => {
        this.selectedCountry = null;
        this.selectedLeague = null;
        this.selectedTeam = null;
        this.refresh();
      });
    }

    const backLeague = container.querySelector('#back-league');
    if (backLeague) {
      backLeague.addEventListener('click', () => {
        this.selectedLeague = null;
        this.selectedTeam = null;
        this.refresh();
      });
    }

    const backTeam = container.querySelector('#back-team');
    if (backTeam) {
      backTeam.addEventListener('click', () => {
        this.selectedTeam = null;
        this.refresh();
      });
    }

    // Confirm selection
    const confirmBtn = container.querySelector('#confirm-selection');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmTeamSelection();
      });
    }
  }

  confirmTeamSelection() {
    if (this.selectedTeam && this.selectedLeague && this.selectedCountry) {
      console.log(`🎯 Confirming team selection:`, {
        team: this.selectedTeam.name,
        league: this.selectedLeague.name,
        country: this.selectedCountry.name,
        founded: this.selectedTeam.founded,
        city: this.selectedTeam.city,
        id: this.selectedTeam.id
      });
      
      // Set the team in game state
      this.gameState.setUserTeam(this.selectedTeam, this.selectedLeague, this.selectedCountry);
      
      // Trigger dashboard view
      if (this.gameState.eventCallbacks.teamSelected) {
        this.gameState.eventCallbacks.teamSelected();
      }
    } else {
      console.error('❌ Cannot confirm team selection - missing data:', {
        team: !!this.selectedTeam,
        league: !!this.selectedLeague,
        country: !!this.selectedCountry
      });
    }
  }

  refresh() {
    // Re-render the current view
    console.log('🔄 Refreshing team selection view...');
    console.log('📍 Current state:', {
      country: this.selectedCountry?.name,
      league: this.selectedLeague?.name, 
      team: this.selectedTeam?.name
    });
    
    const container = document.querySelector('.team-selection-section');
    if (container?.parentNode) {
      const parent = container.parentNode;
      parent.removeChild(container);
      this.render(parent);
    } else {
      console.error('❌ Could not find team selection container to refresh');
    }
  }

  handleResize() {
    // Team selection is responsive by default
  }
}
