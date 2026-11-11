/**
 * TeamSection - Team management and squad overview
 */

import { BaseSection } from './baseSection.js';
import { playerRating, lineupForFormation } from '../../league/matchSimulator.js';
import { trainingSummary, attributeLabel } from '../../training/training.js';

export class TeamSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.selectedPlayer = null;
  }

  get currentFormation() {
    return this.gameState.tactics?.formation || '4-3-3';
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
          <span class="formation-select" title="Change the formation on the Tactics screen">Formation ${this.currentFormation} · set in Tactics</span>
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
    this.slotPool = null;
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
                  <div class="player-rating">${this.ratingOf(this.getPlayerForPosition(pos))}</div>
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
          <div class="player-rating">${this.ratingOf(player)}</div>
          ${this.renderDelta(player)}
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
            <div class="player-rating">${this.ratingOf(player)}</div>
            ${this.renderDelta(player)}
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
            <span class="rating-number">${this.ratingOf(player)}</span>
            <span class="rating-label">Overall</span>
            ${this.renderDelta(player, true)}
          </div>
          
          <div class="key-attributes">
            ${attributes.map(attr => `
              <div class="attribute-item">
                <span class="attr-name">${this.formatAttributeName(attr.name)}</span>
                <span class="attr-value">${attr.value}${attr.delta ? `<span class="attr-delta ${attr.delta > 0 ? 'up' : 'down'}">${attr.delta > 0 ? '+' : ''}${attr.delta.toFixed(1)}</span>` : ''}</span>
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
      ],
      '5-3-2': [
        ['ST', 'ST'],
        ['CM', 'CM', 'CM'],
        ['LB', 'CB', 'CB', 'CB', 'RB'],
        ['GK']
      ]
    };
    return formations[formation] || formations['4-3-3'];
  }

  getPlayerForPosition(position) {
    // Hand out the starting eleven slot by slot so no player appears twice.
    if (!this.slotPool || this.slotPool.formation !== this.currentFormation) {
      const pool = { GK: [], DEF: [], MID: [], FWD: [] };
      this.getStartingXI().forEach(p => pool[this.getPositionCategory(p.position)]?.push(p));
      this.slotPool = { formation: this.currentFormation, pool, used: new Set() };
    }
    const { pool, used } = this.slotPool;
    const category = this.getPositionCategory(position);
    const next = pool[category].find(p => !used.has(p)) || Object.values(pool).flat().find(p => !used.has(p));
    if (next) used.add(next);
    return next;
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
    const team = this.gameState.userTeam;
    return team ? lineupForFormation(team, this.currentFormation) : [];
  }

  ratingOf(player) {
    return player ? Math.round(playerRating(player)) : '--';
  }

  /** Total movement from training since the user took charge, as a coloured badge. */
  renderDelta(player, withLabel = false) {
    const { total } = trainingSummary(player);
    if (Math.abs(total) < 0.05) return '';
    const text = `${total > 0 ? '+' : ''}${total.toFixed(1)}`;
    return `<div class="player-delta ${total > 0 ? 'up' : 'down'}" title="Attribute change from training">${text}${withLabel ? ' from training' : ''}</div>`;
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
    
    // The player's five best attributes, plus anything training has moved most.
    const deltas = player.trainingDeltas || {};
    const attrs = Object.entries(player.attributes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
    Object.entries(deltas)
      .filter(([, d]) => Math.abs(d) >= 0.5)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3)
      .forEach(([name]) => { if (!attrs.includes(name)) attrs.push(name); });

    return attrs.map(name => ({
      name,
      value: Math.round(player.attributes[name]),
      delta: Math.abs(deltas[name] || 0) >= 0.05 ? deltas[name] : 0
    }));
  }

  formatAttributeName(attrName) {
    return attributeLabel(attrName);
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
    if (!this.selectedPlayer) return;
    
    // Create and show player profile modal
    this.showPlayerProfileModal(this.selectedPlayer);
  }

  showPlayerProfileModal(player) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop player-profile-modal';
    modal.innerHTML = `
      <div class="modal-content player-profile-content">
        <div class="modal-header">
          <h2>${player.name}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="player-profile-grid">
            <div class="player-basic-info">
              <div class="player-photo">
                <div class="player-avatar">${player.name.charAt(0)}</div>
              </div>
              <div class="player-details">
                <h3>${player.name}</h3>
                <p><strong>Position:</strong> ${player.position}</p>
                <p><strong>Age:</strong> ${player.age}</p>
                <p><strong>Overall:</strong> ${player.overall}</p>
                <p><strong>Potential:</strong> ${player.potential}</p>
                <p><strong>Value:</strong> $${(player.value || 0).toLocaleString()}</p>
                <p><strong>Wage:</strong> $${(player.wage || 0).toLocaleString()}/week</p>
              </div>
            </div>
            
            <div class="player-attributes">
              <h4>Attributes</h4>
              <div class="attributes-grid">
                <div class="attribute-item">
                  <span class="attr-name">Pace:</span>
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.pace || 50}%"></div>
                    <span class="attr-value">${player.pace || 50}</span>
                  </div>
                </div>
                <div class="attribute-item">
                  <span class="attr-name">Shooting:</span>
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.shooting || 50}%"></div>
                    <span class="attr-value">${player.shooting || 50}</span>
                  </div>
                </div>
                <div class="attribute-item">
                  <span class="attr-name">Passing:</span>
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.passing || 50}%"></div>
                    <span class="attr-value">${player.passing || 50}</span>
                  </div>
                </div>
                <div class="attribute-item">
                  <span class="attr-name">Dribbling:</span>
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.dribbling || 50}%"></div>
                    <span class="attr-value">${player.dribbling || 50}</span>
                  </div>
                </div>
                <div class="attribute-item">
                  <span class="attr-name">Defending:</span>
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.defending || 50}%"></div>
                    <span class="attr-value">${player.defending || 50}</span>
                  </div>
                </div>
                <div class="attribute-item">
                  <span class="attr-name">Physical:</span>
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.physical || 50}%"></div>
                    <span class="attr-value">${player.physical || 50}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="player-stats">
              <h4>Season Statistics</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Appearances:</span>
                  <span class="stat-value">${player.stats?.appearances || 0}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Goals:</span>
                  <span class="stat-value">${player.stats?.goals || 0}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Assists:</span>
                  <span class="stat-value">${player.stats?.assists || 0}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Yellow Cards:</span>
                  <span class="stat-value">${player.stats?.yellowCards || 0}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Red Cards:</span>
                  <span class="stat-value">${player.stats?.redCards || 0}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Minutes:</span>
                  <span class="stat-value">${player.stats?.minutesPlayed || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn primary transfer-btn">Add to Transfer List</button>
          <button class="btn secondary close-btn">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.transfer-btn').addEventListener('click', () => {
      this.addToTransferList();
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  addToTransferList() {
    if (!this.selectedPlayer) return;
    
    // Add player to transfer list
    if (this.gameState.transferMarket?.addPlayerToTransferList) {
      this.gameState.transferMarket.addPlayerToTransferList(this.selectedPlayer);
      
      // Show success message
      if (window.ErrorHandler) {
        window.ErrorHandler.showSuccess(`${this.selectedPlayer.name} added to transfer list`);
      }
      
      console.log('✅ Added to transfer list:', this.selectedPlayer.name);
    } else {
      console.log('⚠️ Transfer market not available');
      if (window.ErrorHandler) {
        window.ErrorHandler.showError('Transfer market not available', 'Please try again later');
      }
    }
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
