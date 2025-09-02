/**
 * TeamSection - Team management and squad overview
 */

import { BaseSection } from './baseSection.js';

export class TeamSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.selectedPlayer = null;
    this.currentFormation = '4-4-2';
  }

  getTitle() {
    return 'Team Management';
  }

  render(container) {
    const teamSection = document.createElement('div');
    teamSection.className = 'team-section';
    
    teamSection.innerHTML = `
      <div class="team-header">
        <h1>${this.gameState.userTeam?.name || 'Your Team'}</h1>
        <div class="team-actions">
          <select id="formation-selector" class="formation-select">
            <option value="4-4-2" ${this.currentFormation === '4-4-2' ? 'selected' : ''}>4-4-2</option>
            <option value="4-3-3" ${this.currentFormation === '4-3-3' ? 'selected' : ''}>4-3-3</option>
            <option value="3-5-2" ${this.currentFormation === '3-5-2' ? 'selected' : ''}>3-5-2</option>
            <option value="4-2-3-1" ${this.currentFormation === '4-2-3-1' ? 'selected' : ''}>4-2-3-1</option>
          </select>
        </div>
      </div>
      
      <div class="team-content">
        <div class="team-main">
          <div class="formation-display">
            <h3>Formation: ${this.currentFormation}</h3>
            <div id="pitch-formation" class="pitch-formation">
              ${this.renderFormationDisplay()}
            </div>
          </div>
          
          <div class="starting-eleven">
            <h3>Starting XI</h3>
            <div id="starting-lineup" class="lineup-grid">
              ${this.renderStartingLineup()}
            </div>
          </div>
        </div>
        
        <div class="team-sidebar">
          <div class="squad-list">
            <h3>Full Squad (${this.getSquadSize()})</h3>
            <div class="position-filters">
              <button class="filter-btn active" data-position="all">All</button>
              <button class="filter-btn" data-position="GK">GK</button>
              <button class="filter-btn" data-position="DEF">DEF</button>
              <button class="filter-btn" data-position="MID">MID</button>
              <button class="filter-btn" data-position="FWD">FWD</button>
            </div>
            <div id="squad-players" class="players-list">
              ${this.renderSquadList()}
            </div>
          </div>
          
          <div class="player-details" id="player-details">
            ${this.renderPlayerDetails()}
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(teamSection);
    this.setupEventListeners();
  }

  renderFormationDisplay() {
    const positions = this.getFormationPositions(this.currentFormation);
    return `
      <div class="pitch">
        <div class="pitch-lines"></div>
        ${positions.map((line, lineIndex) => `
          <div class="formation-line line-${lineIndex}">
            ${line.map((pos, posIndex) => `
              <div class="position-slot" data-position="${pos}" data-line="${lineIndex}" data-slot="${posIndex}">
                <div class="player-slot">
                  <div class="player-name">${this.getPlayerForPosition(pos)?.name || 'Empty'}</div>
                  <div class="player-rating">${this.getPlayerForPosition(pos)?.getOverallRating?.() || '--'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderStartingLineup() {
    const startingXI = this.getStartingXI();
    return startingXI.map(player => `
      <div class="lineup-player" data-player-id="${player.id}">
        <div class="player-info">
          <div class="player-name">${player.name}</div>
          <div class="player-position">${player.position}</div>
          <div class="player-rating">${player.getOverallRating?.() || 'N/A'}</div>
        </div>
        <div class="player-actions">
          <button class="substitute-btn" data-player-id="${player.id}">Sub</button>
        </div>
      </div>
    `).join('');
  }

  renderSquadList(positionFilter = 'all') {
    const players = this.getFilteredPlayers(positionFilter);
    
    return players.map(player => `
      <div class="squad-player ${this.selectedPlayer?.id === player.id ? 'selected' : ''}" 
           data-player-id="${player.id}">
        <div class="player-summary">
          <div class="player-main-info">
            <div class="player-name">${player.name}</div>
            <div class="player-position">${player.position}</div>
          </div>
          <div class="player-stats">
            <div class="player-rating">${player.getOverallRating?.() || 'N/A'}</div>
            <div class="player-age">${player.age}y</div>
          </div>
        </div>
        <div class="player-condition">
          <div class="fitness-bar">
            <div class="fitness-fill" style="width: ${100 - (player.fatigue || 0)}%"></div>
          </div>
          ${player.injured ? '<span class="injury-indicator">🏥</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  renderPlayerDetails() {
    if (!this.selectedPlayer) {
      return `
        <div class="no-selection">
          <p>Select a player to view details</p>
        </div>
      `;
    }

    const player = this.selectedPlayer;
    const attributes = this.getKeyAttributes(player);
    
    return `
      <div class="player-profile">
        <div class="profile-header">
          <h3>${player.name}</h3>
          <div class="player-meta">
            <span class="position">${player.position}</span>
            <span class="age">${player.age} years</span>
          </div>
        </div>
        
        <div class="player-ratings">
          <div class="overall-rating">
            <span class="rating-number">${player.getOverallRating?.() || 'N/A'}</span>
            <span class="rating-label">Overall</span>
          </div>
          
          <div class="key-attributes">
            ${attributes.map(attr => `
              <div class="attribute-item">
                <span class="attr-name">${this.formatAttributeName(attr.name)}</span>
                <span class="attr-value">${attr.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="player-status">
          <div class="status-item">
            <span class="status-label">Fitness:</span>
            <span class="status-value">${Math.max(0, 100 - (player.fatigue || 0))}%</span>
          </div>
          <div class="status-item">
            <span class="status-label">Morale:</span>
            <span class="status-value">${player.morale || 75}%</span>
          </div>
          ${player.injured ? `
            <div class="status-item injury">
              <span class="status-label">Injury:</span>
              <span class="status-value">${player.injuryDays || 0} days</span>
            </div>
          ` : ''}
        </div>
        
        <div class="player-actions">
          <button class="action-btn primary" data-action="view-full-profile">
            Full Profile
          </button>
          <button class="action-btn secondary" data-action="transfer-list">
            Transfer List
          </button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Store document click handler for cleanup
    this.documentClickHandler = (e) => {
      if (e.target.matches('[data-action]')) {
        const action = e.target.dataset.action;
        this.handlePlayerAction(action);
      }
    };

    // Formation selector
    const formationSelect = document.getElementById('formation-selector');
    formationSelect?.addEventListener('change', (e) => {
      this.currentFormation = e.target.value;
      this.refreshFormationDisplay();
    });

    // Position filters
    document.querySelectorAll('.position-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filterPlayersByPosition(e.target.dataset.position);
      });
    });

    // Player selection
    document.querySelectorAll('.squad-player').forEach(playerEl => {
      console.log('🔧 Adding click listener to player:', playerEl.dataset.playerId);
      playerEl.addEventListener('click', (e) => {
        const playerId = e.currentTarget.dataset.playerId;
        console.log('🎯 Squad player clicked:', playerId);
        this.selectPlayer(playerId);
      });
    });

    // Player actions - use document delegation
    document.addEventListener('click', this.documentClickHandler);
  }

  cleanup() {
    // Remove document event listener to prevent duplicates
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }
  }

  // Helper methods
  getFormationPositions(formation) {
    const formations = {
      '4-4-2': [
        ['ST', 'ST'],
        ['LM', 'CM', 'CM', 'RM'],
        ['LB', 'CB', 'CB', 'RB'],
        ['GK']
      ],
      '4-3-3': [
        ['LW', 'ST', 'RW'],
        ['CM', 'CM', 'CM'],
        ['LB', 'CB', 'CB', 'RB'],
        ['GK']
      ],
      '3-5-2': [
        ['ST', 'ST'],
        ['LM', 'CM', 'CM', 'CM', 'RM'],
        ['CB', 'CB', 'CB'],
        ['GK']
      ],
      '4-2-3-1': [
        ['ST'],
        ['LAM', 'CAM', 'RAM'],
        ['CDM', 'CDM'],
        ['LB', 'CB', 'CB', 'RB'],
        ['GK']
      ]
    };
    return formations[formation] || formations['4-4-2'];
  }

  getPlayerForPosition(position) {
    // Simple position matching - can be enhanced
    const players = this.gameState.userTeam?.players || [];
    return players.find(p => p.position === position) || players.find(p => 
      this.getPositionCategory(p.position) === this.getPositionCategory(position)
    );
  }

  getPositionCategory(position) {
    const categories = {
      'GK': 'GK',
      'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF',
      'CM': 'MID', 'CDM': 'MID', 'CAM': 'MID', 'LM': 'MID', 'RM': 'MID',
      'ST': 'FWD', 'LW': 'FWD', 'RW': 'FWD', 'LAM': 'MID', 'RAM': 'MID'
    };
    return categories[position] || 'MID';
  }

  getStartingXI() {
    const players = this.gameState.userTeam?.players || [];
    return players.slice(0, 11); // Simple selection - can be enhanced
  }

  getSquadSize() {
    return this.gameState.userTeam?.players?.length || 0;
  }

  getFilteredPlayers(positionFilter) {
    const players = this.gameState.userTeam?.players || [];
    
    if (positionFilter === 'all') return players;
    
    return players.filter(player => 
      this.getPositionCategory(player.position) === positionFilter
    );
  }

  getKeyAttributes(player) {
    if (!player.attributes) return [];
    
    // Get top 5 attributes for the player
    const attrs = Object.entries(player.attributes);
    attrs.sort((a, b) => b[1] - a[1]);
    
    return attrs.slice(0, 5).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  }

  formatAttributeName(attrName) {
    // Convert camelCase to readable format
    return attrName.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  selectPlayer(playerId) {
    console.log('🎯 Player selected:', playerId);
    const players = this.gameState.userTeam?.players || [];
    this.selectedPlayer = players.find(p => p.id === playerId);
    
    if (!this.selectedPlayer) {
      console.warn('⚠️ Player not found:', playerId);
      return;
    }
    
    console.log('✅ Player found:', this.selectedPlayer.name);
    
    // Update UI
    document.querySelectorAll('.squad-player').forEach(el => el.classList.remove('selected'));
    const playerElement = document.querySelector(`[data-player-id="${playerId}"]`);
    if (playerElement) {
      playerElement.classList.add('selected');
      console.log('✅ Player UI updated');
    } else {
      console.warn('⚠️ Player element not found in DOM');
    }
    
    // Update player details
    const detailsContainer = document.getElementById('player-details');
    if (detailsContainer) {
      detailsContainer.innerHTML = this.renderPlayerDetails();
      console.log('✅ Player details rendered');
    } else {
      console.warn('⚠️ Player details container not found');
    }
  }

  filterPlayersByPosition(position) {
    const playersContainer = document.getElementById('squad-players');
    if (playersContainer) {
      playersContainer.innerHTML = this.renderSquadList(position);
      this.setupPlayerSelectionListeners();
    }
  }

  setupPlayerSelectionListeners() {
    document.querySelectorAll('.squad-player').forEach(playerEl => {
      playerEl.addEventListener('click', (e) => {
        const playerId = e.currentTarget.dataset.playerId;
        this.selectPlayer(playerId);
      });
    });
  }

  updateFormationDisplay() {
    const formationContainer = document.getElementById('pitch-formation');
    if (formationContainer) {
      formationContainer.innerHTML = this.renderFormationDisplay();
    }
  }

  handlePlayerAction(action) {
    if (!this.selectedPlayer) return;
    
    switch (action) {
      case 'view-full-profile':
        this.showFullPlayerProfile();
        break;
      case 'transfer-list':
        this.addToTransferList();
        break;
    }
  }

  showFullPlayerProfile() {
    // Could open a modal or navigate to detailed player view
    console.log('Show full profile for:', this.selectedPlayer.name);
  }

  addToTransferList() {
    // Add player to transfer list
    console.log('Add to transfer list:', this.selectedPlayer.name);
  }

  refreshFormationDisplay() {
    // Update the formation display based on current formation
    console.log('🔄 Refreshing formation display for:', this.currentFormation);
    
    // You could implement formation-specific logic here
    // For now, just refresh the player positions
    this.refreshPlayerPositions();
  }

  refreshPlayerPositions() {
    // Update player positions in the formation
    const squadList = document.querySelector('.squad-list');
    if (squadList) {
      // Re-render the squad with updated formation
      const players = this.gameState.userTeam?.players || [];
      const startingXI = players.slice(0, 11);
      const substitutes = players.slice(11);
      
      squadList.innerHTML = `
        <div class="starting-eleven">
          <h3>Starting XI</h3>
          <div class="players-grid">
            ${startingXI.map(player => this.renderPlayerCard(player)).join('')}
          </div>
        </div>
        <div class="substitutes">
          <h3>Substitutes</h3>
          <div class="players-grid">
            ${substitutes.map(player => this.renderPlayerCard(player)).join('')}
          </div>
        </div>
      `;
      
      // Re-attach event listeners
      this.attachPlayerEventListeners();
    }
  }

  refreshFormationDisplay() {
    // Update formation title
    const formationTitle = document.querySelector('.formation-display h3');
    if (formationTitle) {
      formationTitle.textContent = `Formation: ${this.currentFormation}`;
    }

    // Update pitch formation display
    const pitchFormation = document.getElementById('pitch-formation');
    if (pitchFormation) {
      pitchFormation.innerHTML = this.renderFormationDisplay();
    }

    // Update starting lineup with new formation
    const startingLineup = document.getElementById('starting-lineup');
    if (startingLineup) {
      startingLineup.innerHTML = this.renderStartingLineup();
    }

    // Re-attach event listeners for any new elements
    this.attachPlayerEventListeners();
  }
}
