/**
 * TransferSection - Transfer market and negotiations
 */

import { BaseSection } from './baseSection.js';

export class TransferSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.currentView = 'market';
    this.searchFilters = {
      nameSearch: '',
      position: 'all',
      minAge: 16,
      maxAge: 40,
      maxPrice: 100000000,
      minRating: 1,
      maxRating: 100,
      country: 'all',
      team: 'all',
      maxResults: 100
    };
  }

  getTitle() {
    return 'Transfer Market';
  }

  render(container) {
    console.log('🏪 Rendering TransferSection...');
    
    try {
      const transferSection = document.createElement('div');
      transferSection.className = 'transfer-section';
      
      transferSection.innerHTML = `
        <div class="transfer-header">
          <h1>Transfer Market</h1>
          <div class="transfer-status">
            <div class="window-status ${this.isTransferWindowOpen() ? 'open' : 'closed'}">
              Transfer Window: ${this.isTransferWindowOpen() ? 'Open' : 'Closed'}
            </div>
            <div class="budget-display">
              Budget: ${this.formatMoney(this.getTransferBudget())}
            </div>
          </div>
        </div>
        
        <div class="transfer-nav">
          <button class="transfer-nav-btn ${this.currentView === 'market' ? 'active' : ''}" 
                  data-view="market">Market</button>
          <button class="transfer-nav-btn ${this.currentView === 'shortlist' ? 'active' : ''}" 
                  data-view="shortlist">Shortlist</button>
          <button class="transfer-nav-btn ${this.currentView === 'offers' ? 'active' : ''}" 
                  data-view="offers">Offers</button>
          <button class="transfer-nav-btn ${this.currentView === 'completed' ? 'active' : ''}" 
                  data-view="completed">Completed</button>
        </div>
        
        <div class="transfer-content">
          <div class="transfer-main">
            <div id="transfer-view-content">
              ${this.renderCurrentView()}
            </div>
          </div>
          
          <div class="transfer-sidebar">
            ${this.renderSidebar()}
          </div>
        </div>
      `;
      
      container.innerHTML = '';
      container.appendChild(transferSection);
      
      console.log('📊 Transfer section rendered, setting up event listeners...');
      this.setupEventListeners();
      console.log('✅ TransferSection render completed');
      
    } catch (error) {
      console.error('❌ Error rendering TransferSection:', error);
      container.innerHTML = `
        <div class="error-message">
          <h2>Transfer Market Error</h2>
          <p>Unable to load transfer market. Please try refreshing.</p>
          <pre>${error.message}</pre>
        </div>
      `;
    }
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'market':
        return this.renderMarketView();
      case 'shortlist':
        return this.renderShortlistView();
      case 'offers':
        return this.renderOffersView();
      case 'completed':
        return this.renderCompletedView();
      default:
        return this.renderMarketView();
    }
  }

  renderMarketView() {
    const availablePlayers = this.getAvailablePlayers();
    const isWindowOpen = this.isTransferWindowOpen();
    
    return `
      <div class="market-view">
        ${this.renderWindowWarning(isWindowOpen)}
        ${this.renderSearchBar()}
        ${this.renderFilters(availablePlayers.length)}
        ${this.renderPlayerResults(availablePlayers)}
      </div>
    `;
  }

  renderWindowWarning(isWindowOpen) {
    if (isWindowOpen) return '';
    
    return `
      <div class="market-warning">
        <div class="warning-message">
          <h3>⚠️ Transfer Window Closed</h3>
          <p>You can browse players but cannot make bids until the next window opens: ${this.getNextWindowDate()}</p>
        </div>
      </div>
    `;
  }

  renderSearchBar() {
    return `
      <div class="market-search">
        <div class="search-bar">
          <input type="text" id="player-search" placeholder="Search players by name..." 
                 value="${this.searchFilters.nameSearch || ''}"
                 class="search-input">
          <button id="search-btn" class="search-btn">🔍</button>
        </div>
      </div>
    `;
  }

  renderFilters(resultsCount) {
    return `
      <div class="market-filters">
        <div class="filter-row">
          ${this.renderPositionFilter()}
          ${this.renderCountryFilter()}
          ${this.renderAgeFilter()}
        </div>
        
        <div class="filter-row">
          ${this.renderRatingFilter()}
          ${this.renderPriceFilter()}
          ${this.renderResultsFilter()}
        </div>
        
        <div class="filter-actions">
          <button id="apply-filters" class="primary-btn">Apply Filters</button>
          <button id="clear-filters" class="secondary-btn">Clear All</button>
          <span class="results-count">${resultsCount} players found</span>
        </div>
      </div>
    `;
  }

  renderPositionFilter() {
    return `
      <div class="filter-group">
        <label for="position-filter">Position:</label>
        <select id="position-filter">
          <option value="all" ${this.searchFilters.position === 'all' ? 'selected' : ''}>All Positions</option>
          <option value="GK" ${this.searchFilters.position === 'GK' ? 'selected' : ''}>Goalkeeper</option>
          <option value="CB" ${this.searchFilters.position === 'CB' ? 'selected' : ''}>Centre Back</option>
          <option value="RB" ${this.searchFilters.position === 'RB' ? 'selected' : ''}>Right Back</option>
          <option value="LB" ${this.searchFilters.position === 'LB' ? 'selected' : ''}>Left Back</option>
          <option value="DM" ${this.searchFilters.position === 'DM' ? 'selected' : ''}>Defensive Mid</option>
          <option value="CM" ${this.searchFilters.position === 'CM' ? 'selected' : ''}>Centre Mid</option>
          <option value="AM" ${this.searchFilters.position === 'AM' ? 'selected' : ''}>Attacking Mid</option>
          <option value="RW" ${this.searchFilters.position === 'RW' ? 'selected' : ''}>Right Wing</option>
          <option value="LW" ${this.searchFilters.position === 'LW' ? 'selected' : ''}>Left Wing</option>
          <option value="ST" ${this.searchFilters.position === 'ST' ? 'selected' : ''}>Striker</option>
        </select>
      </div>
    `;
  }

  renderCountryFilter() {
    return `
      <div class="filter-group">
        <label for="country-filter">Country:</label>
        <select id="country-filter">
          <option value="all" ${this.searchFilters.country === 'all' ? 'selected' : ''}>All Countries</option>
          ${this.getAvailableCountries().map(country => 
            `<option value="${country}" ${this.searchFilters.country === country ? 'selected' : ''}>${country}</option>`
          ).join('')}
        </select>
      </div>
    `;
  }

  renderAgeFilter() {
    return `
      <div class="filter-group">
        <label for="age-range">Age Range:</label>
        <input type="number" id="min-age" min="16" max="40" value="${this.searchFilters.minAge}" class="age-input">
        <span>to</span>
        <input type="number" id="max-age" min="16" max="40" value="${this.searchFilters.maxAge}" class="age-input">
      </div>
    `;
  }

  renderRatingFilter() {
    return `
      <div class="filter-group">
        <label for="rating-range">Rating Range:</label>
        <input type="number" id="min-rating" min="1" max="100" value="${this.searchFilters.minRating}" class="rating-input">
        <span>to</span>
        <input type="number" id="max-rating" min="1" max="100" value="${this.searchFilters.maxRating}" class="rating-input">
      </div>
    `;
  }

  renderPriceFilter() {
    return `
      <div class="filter-group">
        <label for="max-price">Max Price:</label>
        <input type="range" id="max-price" min="1000000" max="100000000" 
               value="${this.searchFilters.maxPrice}" step="1000000">
        <span id="price-display">${this.formatMoney(this.searchFilters.maxPrice)}</span>
      </div>
    `;
  }

  renderResultsFilter() {
    return `
      <div class="filter-group">
        <label for="max-results">Show Results:</label>
        <select id="max-results">
          <option value="50" ${this.searchFilters.maxResults === 50 ? 'selected' : ''}>50 players</option>
          <option value="100" ${this.searchFilters.maxResults === 100 ? 'selected' : ''}>100 players</option>
          <option value="200" ${this.searchFilters.maxResults === 200 ? 'selected' : ''}>200 players</option>
          <option value="500" ${this.searchFilters.maxResults === 500 ? 'selected' : ''}>All results</option>
        </select>
      </div>
    `;
  }

  renderPlayerResults(availablePlayers) {
    return `
      <div class="players-list" id="players-list">
        ${availablePlayers.length > 0 ? 
          availablePlayers.map(player => this.renderPlayerCard(player, !this.isTransferWindowOpen())).join('') :
          '<div class="no-results">No players found matching your criteria</div>'
        }
      </div>
    `;
  }

  renderPlayerCard(player, disableBidding = false) {
    const askingPrice = this.getAskingPrice(player);
    const isAffordable = askingPrice <= this.getTransferBudget();
    const club = this.getPlayerClub(player);
    const contractExpiry = player.contractExpiry || 'Unknown';
    const marketValue = player.value || askingPrice;
    const wage = player.wage || 0;
    
    return `
      <div class="player-card detailed-card ${isAffordable ? '' : 'unaffordable'}" data-player-id="${player.id}">
        
        <!-- Player Header -->
        <div class="player-card-header">
          <div class="player-photo">
            <div class="player-avatar">${player.name.charAt(0)}</div>
            <div class="player-nationality">${player.nationality || 'Unknown'}</div>
          </div>
          <div class="player-identity">
            <div class="player-name">${player.name}</div>
            <div class="player-meta">
              <span class="player-age">${player.age} years old</span>
              <span class="player-position">${player.position}</span>
              <span class="player-foot">${player.preferredFoot || 'Right'} foot</span>
            </div>
            <div class="player-club-info">
              <span class="current-club">${club?.name || 'Free Agent'}</span>
              <span class="contract-expiry">Contract: ${contractExpiry}</span>
            </div>
          </div>
          <div class="player-overall-rating">
            <div class="rating-circle">
              <span class="rating-value">${player.getOverallRating?.() || player.overall || 'N/A'}</span>
              <span class="rating-label">OVR</span>
            </div>
            <div class="potential-rating">
              <span class="potential-value">${player.potential || 'N/A'}</span>
              <span class="potential-label">POT</span>
            </div>
          </div>
        </div>

        <!-- Detailed Attributes -->
        <div class="player-attributes-grid">
          <div class="attribute-section technical">
            <h4>Technical</h4>
            <div class="attributes">
              <div class="attr-item">
                <span class="attr-name">Pace:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.pace || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.pace || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Shooting:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.shooting || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.shooting || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Passing:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.passing || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.passing || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Dribbling:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.dribbling || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.dribbling || 50}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="attribute-section defensive">
            <h4>Defensive</h4>
            <div class="attributes">
              <div class="attr-item">
                <span class="attr-name">Defending:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.defending || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.defending || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Heading:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.heading || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.heading || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Tackling:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.tackling || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.tackling || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Marking:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.marking || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.marking || 50}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="attribute-section physical">
            <h4>Physical</h4>
            <div class="attributes">
              <div class="attr-item">
                <span class="attr-name">Strength:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.strength || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.strength || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Stamina:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.stamina || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.stamina || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Acceleration:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.acceleration || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.acceleration || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Jumping:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.jumping || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.jumping || 50}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="attribute-section mental">
            <h4>Mental</h4>
            <div class="attributes">
              <div class="attr-item">
                <span class="attr-name">Decisions:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.decisions || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.decisions || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Composure:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.composure || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.composure || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Vision:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.vision || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.vision || 50}</span>
                </div>
              </div>
              <div class="attr-item">
                <span class="attr-name">Work Rate:</span>
                <div class="attr-bar-container">
                  <div class="attr-bar">
                    <div class="attr-fill" style="width: ${player.workRate || 50}%"></div>
                  </div>
                  <span class="attr-value">${player.workRate || 50}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Season Statistics -->
        <div class="player-season-stats">
          <h4>Season Statistics</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">${player.stats?.appearances || 0}</span>
              <span class="stat-label">Apps</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${player.stats?.goals || 0}</span>
              <span class="stat-label">Goals</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${player.stats?.assists || 0}</span>
              <span class="stat-label">Assists</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${(player.stats?.minutesPlayed || 0).toLocaleString()}</span>
              <span class="stat-label">Minutes</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${(player.stats?.averageRating || 0).toFixed(1)}</span>
              <span class="stat-label">Rating</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${player.stats?.yellowCards || 0}/${player.stats?.redCards || 0}</span>
              <span class="stat-label">Cards</span>
            </div>
          </div>
        </div>

        <!-- Financial Information -->
        <div class="player-financial-info">
          <div class="financial-row">
            <div class="financial-item">
              <span class="label">Market Value:</span>
              <span class="value market-value">${this.formatMoney(marketValue)}</span>
            </div>
            <div class="financial-item">
              <span class="label">Asking Price:</span>
              <span class="value asking-price">${this.formatMoney(askingPrice)}</span>
            </div>
          </div>
          <div class="financial-row">
            <div class="financial-item">
              <span class="label">Current Wage:</span>
              <span class="value wage">${this.formatMoney(wage)}/week</span>
            </div>
            <div class="financial-item">
              <span class="label">Value Trend:</span>
              <span class="value trend ${this.getValueTrend(player)}">${this.getValueTrendText(player)}</span>
            </div>
          </div>
        </div>

        <!-- Player Actions -->
        <div class="player-card-footer">
          <div class="action-buttons">
            <button class="btn secondary shortlist-btn" data-player-id="${player.id}">
              📋 Shortlist
            </button>
            <button class="btn primary bid-btn ${(isAffordable && !disableBidding) ? '' : 'disabled'}" 
                    data-player-id="${player.id}" ${(!isAffordable || disableBidding) ? 'disabled' : ''}>
              ${disableBidding ? '🚫 Window Closed' : '💰 Make Bid'}
            </button>
            <button class="btn info scout-btn" data-player-id="${player.id}">
              🔍 View Report
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderPlayerKeyStats(player) {
    const keyStats = this.getKeyStatsForPosition(player);
    return keyStats.map(stat => `
      <div class="key-stat">
        <span class="stat-name">${stat.name}</span>
        <span class="stat-value">${stat.value}</span>
      </div>
    `).join('');
  }

  renderShortlistView() {
    const shortlistedPlayers = this.getShortlistedPlayers();
    
    if (shortlistedPlayers.length === 0) {
      return `
        <div class="empty-state">
          <h3>No Players Shortlisted</h3>
          <p>Add players to your shortlist from the transfer market to track them.</p>
        </div>
      `;
    }

    return `
      <div class="shortlist-view">
        <h2>Your Shortlist (${shortlistedPlayers.length})</h2>
        <div class="shortlist-grid">
          ${shortlistedPlayers.map(playerId => this.renderShortlistedPlayer(playerId)).join('')}
        </div>
      </div>
    `;
  }

  renderOffersView() {
    const outgoingOffers = this.getOutgoingOffers();
    const incomingOffers = this.getIncomingOffers();
    
    return `
      <div class="offers-view">
        <div class="outgoing-offers">
          <h3>Outgoing Offers (${outgoingOffers.length})</h3>
          <div class="offers-list">
            ${outgoingOffers.map(offer => this.renderOffer(offer, 'outgoing')).join('')}
          </div>
        </div>
        
        <div class="incoming-offers">
          <h3>Incoming Offers (${incomingOffers.length})</h3>
          <div class="offers-list">
            ${incomingOffers.map(offer => this.renderOffer(offer, 'incoming')).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderCompletedView() {
    const completedTransfers = this.getCompletedTransfers();
    
    return `
      <div class="completed-view">
        <h2>Transfer History</h2>
        <div class="transfers-list">
          ${completedTransfers.map(transfer => this.renderCompletedTransfer(transfer)).join('')}
        </div>
      </div>
    `;
  }

  renderSidebar() {
    return `
      <div class="transfer-sidebar-content">
        <div class="budget-breakdown">
          <h3>Budget Breakdown</h3>
          <div class="budget-item">
            <span>Total Budget:</span>
            <span>${this.formatMoney(this.getTransferBudget())}</span>
          </div>
          <div class="budget-item">
            <span>Committed:</span>
            <span>${this.formatMoney(this.getCommittedSpending())}</span>
          </div>
          <div class="budget-item available">
            <span>Available:</span>
            <span>${this.formatMoney(this.getAvailableBudget())}</span>
          </div>
        </div>
        
        <div class="transfer-tips">
          <h3>Transfer Tips</h3>
          <ul class="tips-list">
            <li>Young players have higher potential but may need development</li>
            <li>Consider wage demands as well as transfer fees</li>
            <li>Scout players thoroughly before making offers</li>
            <li>Emergency transfers are possible outside transfer windows</li>
          </ul>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // View navigation
    document.querySelectorAll('.transfer-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view);
      });
    });

    // Search functionality
    const searchInput = document.getElementById('player-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
      // Search on Enter key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
      
      // Live search as user types (with debounce)
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.performSearch();
        }, 300); // 300ms delay
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.performSearch();
      });
    }

    // Filter controls
    document.getElementById('apply-filters')?.addEventListener('click', () => {
      this.applyFilters();
    });

    document.getElementById('clear-filters')?.addEventListener('click', () => {
      this.clearFilters();
    });

    // Position filter immediate update
    document.getElementById('position-filter')?.addEventListener('change', () => {
      this.applyFilters();
    });

    // Country filter immediate update
    document.getElementById('country-filter')?.addEventListener('change', () => {
      this.applyFilters();
    });

    // Age filters
    document.getElementById('min-age')?.addEventListener('change', () => {
      this.applyFilters();
    });

    document.getElementById('max-age')?.addEventListener('change', () => {
      this.applyFilters();
    });

    // Rating filters
    document.getElementById('min-rating')?.addEventListener('change', () => {
      this.applyFilters();
    });

    document.getElementById('max-rating')?.addEventListener('change', () => {
      this.applyFilters();
    });

    // Price slider with live update
    const priceSlider = document.getElementById('max-price');
    const priceDisplay = document.getElementById('price-display');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        priceDisplay.textContent = this.formatMoney(parseInt(e.target.value));
      });
      
      priceSlider.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    // Results limit
    document.getElementById('max-results')?.addEventListener('change', () => {
      this.applyFilters();
    });

    // Player actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('bid-btn')) {
        const playerId = e.target.dataset.playerId;
        this.makeBid(playerId);
      }
      
      if (e.target.classList.contains('shortlist-btn')) {
        const playerId = e.target.dataset.playerId;
        this.addToShortlist(playerId);
      }
      
      if (e.target.classList.contains('remove-shortlist-btn')) {
        const playerId = e.target.dataset.playerId;
        this.removeFromShortlist(playerId);
      }
    });

    // Filter range updates
    const ranges = ['min-age', 'max-age', 'max-price'];
    ranges.forEach(rangeId => {
      document.getElementById(rangeId)?.addEventListener('input', (e) => {
        this.updateFilterDisplay(rangeId, e.target.value);
      });
    });
  }

  performSearch() {
    const searchInput = document.getElementById('player-search');
    if (searchInput) {
      this.searchFilters.nameSearch = searchInput.value;
      this.refreshPlayersList();
    }
  }

  clearFilters() {
    // Reset all filters
    this.searchFilters = {
      nameSearch: '',
      position: 'all',
      minAge: 16,
      maxAge: 40,
      maxPrice: 100000000,
      minRating: 1,
      maxRating: 100,
      country: 'all',
      team: 'all',
      maxResults: 100
    };
    
    // Update form inputs
    const searchInput = document.getElementById('player-search');
    const positionFilter = document.getElementById('position-filter');
    const countryFilter = document.getElementById('country-filter');
    const minAgeInput = document.getElementById('min-age');
    const maxAgeInput = document.getElementById('max-age');
    const minRatingInput = document.getElementById('min-rating');
    const maxRatingInput = document.getElementById('max-rating');
    const maxPriceInput = document.getElementById('max-price');
    const maxResultsInput = document.getElementById('max-results');
    const priceDisplay = document.getElementById('price-display');
    
    if (searchInput) searchInput.value = '';
    if (positionFilter) positionFilter.value = 'all';
    if (countryFilter) countryFilter.value = 'all';
    if (minAgeInput) minAgeInput.value = '16';
    if (maxAgeInput) maxAgeInput.value = '40';
    if (minRatingInput) minRatingInput.value = '1';
    if (maxRatingInput) maxRatingInput.value = '100';
    if (maxPriceInput) maxPriceInput.value = '100000000';
    if (maxResultsInput) maxResultsInput.value = '100';
    if (priceDisplay) priceDisplay.textContent = this.formatMoney(100000000);
    
    this.refreshPlayersList();
  }

  refreshPlayersList() {
    const playersList = document.getElementById('players-list');
    if (playersList) {
      const availablePlayers = this.getAvailablePlayers();
      playersList.innerHTML = availablePlayers.length > 0 ? 
        availablePlayers.map(player => this.renderPlayerCard(player)).join('') :
        '<div class="no-results">No players found matching your criteria</div>';
      
      // Update results count
      const resultsCount = document.querySelector('.results-count');
      if (resultsCount) {
        resultsCount.textContent = `${availablePlayers.length} players found`;
      }
    }
  }

  // Helper methods
  isTransferWindowOpen() {
    return this.gameState.transferWindow?.isTransferWindowOpen?.() || false;
  }

  getTransferBudget() {
    return this.gameState.transferMarket?.getTransferBudget?.(this.gameState.userTeam) || 50000000;
  }

  getAvailablePlayers() {
    // Get players available for transfer
    const allPlayers = this.gameState.worldSystem?.allPlayers || [];
    const filteredPlayers = allPlayers
      .filter(player => this.isPlayerAvailable(player))
      .filter(player => this.matchesFilters(player));
    
    // Apply results limit
    const maxResults = this.searchFilters.maxResults === 500 ? filteredPlayers.length : this.searchFilters.maxResults;
    return filteredPlayers.slice(0, maxResults);
  }

  getAvailableCountries() {
    const allPlayers = this.gameState.worldSystem?.allPlayers || [];
    const countries = [...new Set(allPlayers.map(player => player.nationality))];
    return countries.sort((a, b) => a.localeCompare(b));
  }

  isPlayerAvailable(player) {
    // Player is available if not on user's team and meets other criteria
    const userTeamPlayers = this.gameState.userTeam?.players || [];
    return !userTeamPlayers.find(p => p.id === player.id);
  }

  matchesFilters(player) {
    const { nameSearch, position, minAge, maxAge, maxPrice, minRating, maxRating, country } = this.searchFilters;
    
    // Name search filter
    if (nameSearch && nameSearch.trim() !== '') {
      const searchTerm = nameSearch.toLowerCase().trim();
      if (!player.name.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    
    // Position filter
    if (position !== 'all' && player.position !== position) {
      return false;
    }
    
    // Age filter
    if (player.age < minAge || player.age > maxAge) return false;
    
    // Rating filter
    const playerRating = player.overallRating || player.rating || 50;
    if (playerRating < minRating || playerRating > maxRating) return false;
    
    // Country filter
    if (country !== 'all' && player.nationality !== country) return false;
    
    // Price filter
    const askingPrice = this.getAskingPrice(player);
    if (askingPrice > maxPrice) return false;
    
    return true;
  }

  getPositionCategory(position) {
    const categories = {
      'GK': 'GK',
      'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF',
      'CM': 'MID', 'CDM': 'MID', 'CAM': 'MID', 'LM': 'MID', 'RM': 'MID',
      'ST': 'FWD', 'LW': 'FWD', 'RW': 'FWD'
    };
    return categories[position] || 'MID';
  }

  getAskingPrice(player) {
    // Simple price calculation - can use transfer market logic
    const basePrice = player.marketValue || 1000000;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80%-120% of base value
    return Math.round(basePrice * randomFactor);
  }

  getPlayerClub(player) {
    // Find which club the player belongs to
    return this.gameState.worldSystem?.allTeams?.find(team => 
      team.players?.some(p => p.id === player.id)
    );
  }

  getKeyStatsForPosition(player) {
    // Return key stats based on player position
    const positionStats = {
      'GK': ['gkReflexes', 'gkHandling', 'gkKicking'],
      'DEF': ['marking', 'tackling', 'strength'],
      'MID': ['passing', 'vision', 'stamina'],
      'FWD': ['finishing', 'pace', 'dribbling']
    };
    
    const category = this.getPositionCategory(player.position);
    const statNames = positionStats[category] || positionStats['MID'];
    
    return statNames.map(statName => ({
      name: this.formatStatName(statName),
      value: Math.round(player.attributes?.[statName] || 50)
    }));
  }

  formatStatName(statName) {
    return statName.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('gk', 'GK');
  }

  getShortlistedPlayers() {
    // Return actual shortlisted players from game state
    if (!this.gameState.userShortlist || !Array.isArray(this.gameState.userShortlist)) {
      return [];
    }
    
    return this.gameState.userShortlist.filter(playerId => {
      // Verify player still exists and is available
      const player = this.gameState.worldSystem?.allPlayers?.find(p => p.id === playerId);
      return player && this.isPlayerAvailable(player);
    });
  }

  getOutgoingOffers() {
    // Return actual outgoing transfer offers from game state
    if (!this.gameState.transferOffers) {
      this.gameState.transferOffers = { outgoing: [], incoming: [] };
    }
    
    return this.gameState.transferOffers.outgoing.map(offer => ({
      id: offer.id,
      player: offer.player,
      targetClub: offer.targetClub,
      amount: offer.amount,
      date: new Date(offer.date),
      status: offer.status || 'pending',
      expiryDate: new Date(offer.expiryDate)
    }));
  }

  getIncomingOffers() {
    // Return actual incoming offers for user's players from game state
    if (!this.gameState.transferOffers) {
      this.gameState.transferOffers = { outgoing: [], incoming: [] };
    }
    
    return this.gameState.transferOffers.incoming.map(offer => ({
      id: offer.id,
      player: offer.player,
      fromClub: offer.fromClub,
      fromLeague: offer.fromLeague,
      amount: offer.amount,
      date: new Date(offer.date),
      status: offer.status || 'pending',
      wages: offer.wages,
      contractLength: offer.contractLength
    }));
  }

  getCompletedTransfers() {
    // Return actual completed transfers for current season from game state
    if (!this.gameState.transferHistory) {
      this.gameState.transferHistory = [];
    }
    
    const currentSeasonStart = new Date(this.gameState.currentSeason, 5, 1); // June 1st
    const currentSeasonEnd = new Date(this.gameState.currentSeason + 1, 4, 31); // May 31st next year
    
    return this.gameState.transferHistory
      .filter(transfer => {
        const transferDate = new Date(transfer.date);
        return transferDate >= currentSeasonStart && transferDate <= currentSeasonEnd;
      })
      .map(transfer => ({
        id: transfer.id,
        player: transfer.player,
        from: transfer.from,
        to: transfer.to,
        fee: transfer.fee,
        wages: transfer.wages,
        contractLength: transfer.contractLength,
        date: new Date(transfer.date),
        type: transfer.type || 'permanent'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getCommittedSpending() {
    // Return actual money committed to pending transfers
    let committed = 0;
    
    // Add pending outgoing offers
    const outgoingOffers = this.getOutgoingOffers();
    outgoingOffers.forEach(offer => {
      if (offer.status === 'accepted') {
        committed += offer.amount;
      }
    });
    
    // Add any installment payments due this season
    const completedTransfers = this.getCompletedTransfers();
    completedTransfers.forEach(transfer => {
      if (transfer.installments) {
        const remainingInstallments = transfer.installments.filter(installment => 
          !installment.paid && new Date(installment.dueDate) <= new Date()
        );
        committed += remainingInstallments.reduce((sum, installment) => sum + installment.amount, 0);
      }
    });
    
    return committed;
  }

  getAvailableBudget() {
    return this.getTransferBudget() - this.getCommittedSpending();
  }

  getNextWindowDate() {
    // Return actual date when next transfer window opens
    const currentDate = this.gameState.currentDate || new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Summer window: June 10 - August 31
    // Winter window: January 1 - January 31
    
    let nextWindowDate;
    
    if (currentMonth >= 5 && currentMonth <= 7) {
      // Currently summer window or just after - next is winter
      nextWindowDate = new Date(currentYear + 1, 0, 1); // January 1st next year
    } else if (currentMonth === 0) {
      // Currently winter window - next is summer
      nextWindowDate = new Date(currentYear, 5, 10); // June 10th this year
    } else if (currentMonth < 5) {
      // Before summer window - next is summer this year
      nextWindowDate = new Date(currentYear, 5, 10); // June 10th this year
    } else {
      // After summer window - next is winter
      nextWindowDate = new Date(currentYear + 1, 0, 1); // January 1st next year
    }
    
    return nextWindowDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Action methods
  switchView(view) {
    this.currentView = view;
    
    // Update navigation
    document.querySelectorAll('.transfer-nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      }
    });
    
    // Update content
    const contentContainer = document.getElementById('transfer-view-content');
    if (contentContainer) {
      contentContainer.innerHTML = this.renderCurrentView();
    }
  }

  applyFilters() {
    // Update filters from form values
    this.searchFilters.nameSearch = document.getElementById('player-search')?.value || '';
    this.searchFilters.position = document.getElementById('position-filter')?.value || 'all';
    this.searchFilters.country = document.getElementById('country-filter')?.value || 'all';
    this.searchFilters.minAge = parseInt(document.getElementById('min-age')?.value || 16);
    this.searchFilters.maxAge = parseInt(document.getElementById('max-age')?.value || 40);
    this.searchFilters.minRating = parseInt(document.getElementById('min-rating')?.value || 1);
    this.searchFilters.maxRating = parseInt(document.getElementById('max-rating')?.value || 100);
    this.searchFilters.maxPrice = parseInt(document.getElementById('max-price')?.value || 100000000);
    this.searchFilters.maxResults = parseInt(document.getElementById('max-results')?.value || 100);
    
    // Refresh the players list
    this.refreshPlayersList();
  }

  updateFilterDisplay(filterId, value) {
    if (filterId.includes('age')) {
      const minAge = document.getElementById('min-age')?.value || 16;
      const maxAge = document.getElementById('max-age')?.value || 40;
      document.getElementById('age-display').textContent = `${minAge}-${maxAge}`;
    } else if (filterId === 'max-price') {
      document.getElementById('price-display').textContent = this.formatMoney(value);
    }
  }

  makeBid(playerId) {
    console.log('🏷️ Making bid for player:', playerId);
    
    try {
      // Find the player in the global database
      const player = this.gameState.worldSystem?.allPlayers?.find(p => p.id === playerId);
      if (!player) {
        console.error('❌ Player not found:', playerId);
        alert('Player not found');
        return;
      }
      
      const askingPrice = this.getAskingPrice(player);
      const budget = this.getTransferBudget();
      
      if (askingPrice > budget) {
        alert(`❌ Insufficient funds!\nPlayer Price: ${this.formatMoney(askingPrice)}\nYour Budget: ${this.formatMoney(budget)}`);
        return;
      }
      
      // Simple bid system - could be expanded with negotiation
      const confirmation = confirm(`💰 Submit bid for ${player.name}?\n\nPrice: ${this.formatMoney(askingPrice)}\nPosition: ${player.position}\nAge: ${player.age}\nRating: ${player.overallRating || player.rating || 'N/A'}\n\nConfirm purchase?`);
      
      if (confirmation) {
        // Simulate successful transfer
        this.completeTransfer(player, askingPrice);
        alert(`✅ Transfer completed!\n${player.name} has joined your squad for ${this.formatMoney(askingPrice)}`);
        
        // Refresh the view
        this.render(document.querySelector('.main-content'));
      }
    } catch (error) {
      console.error('Error making bid:', error);
      alert('❌ Transfer failed. Please try again.');
    }
  }

  getValueTrend(player) {
    // Simple logic for value trend - could be enhanced with historical data
    const age = player.age;
    const potential = player.potential || player.overall || 50;
    const current = player.overall || 50;
    
    if (age < 23 && potential > current) return 'rising';
    if (age > 30) return 'declining';
    return 'stable';
  }

  getValueTrendText(player) {
    const trend = this.getValueTrend(player);
    switch (trend) {
      case 'rising': return '📈 Rising';
      case 'declining': return '📉 Declining';
      default: return '➡️ Stable';
    }
  }

  completeTransfer(player, price) {
    try {
      // Add player to user team
      if (this.gameState.userTeam?.players) {
        // Remove from current team if any
        const currentClub = this.getPlayerClub(player);
        if (currentClub?.players) {
          const playerIndex = currentClub.players.findIndex(p => p.id === player.id);
          if (playerIndex !== -1) {
            currentClub.players.splice(playerIndex, 1);
          }
        }
        
        // Add to user team
        this.gameState.userTeam.players.push(player);
        
        // Update budget (if implemented)
        if (this.gameState.transferBudget !== undefined) {
          this.gameState.transferBudget -= price;
        }
        
        // Record the transfer
        if (!this.gameState.transferHistory) {
          this.gameState.transferHistory = [];
        }
        
        this.gameState.transferHistory.push({
          player: player,
          fromClub: currentClub?.name || 'Free Agent',
          toClub: this.gameState.userTeam.name,
          fee: price,
          date: new Date(),
          type: 'incoming'
        });
        
        console.log(`✅ Transfer completed: ${player.name} to ${this.gameState.userTeam.name} for ${this.formatMoney(price)}`);
      }
    } catch (error) {
      console.error('Error completing transfer:', error);
      throw error;
    }
  }

  addToShortlist(playerId) {
    console.log('⭐ Adding to shortlist:', playerId);
    
    // Initialize shortlist if it doesn't exist
    if (!this.gameState.userShortlist) {
      this.gameState.userShortlist = [];
    }
    
    // Check if player is already shortlisted
    if (this.gameState.userShortlist.includes(playerId)) {
      alert('Player is already on your shortlist');
      return;
    }
    
    // Add to shortlist
    this.gameState.userShortlist.push(playerId);
    alert('Player added to shortlist!');
    
    // Update UI if we're on the shortlist view
    if (this.currentView === 'shortlist') {
      this.refreshPlayersList();
    }
  }

  /**
   * Render a completed transfer for the history view
   */
  renderCompletedTransfer(transfer) {
    return `
      <div class="completed-transfer-card">
        <div class="transfer-header">
          <div class="player-info">
            <h4>${transfer.player.name}</h4>
            <span class="position">${transfer.player.position}</span>
            <span class="age">${transfer.player.age}y</span>
          </div>
          <div class="transfer-fee">
            <span class="fee">${this.formatMoney(transfer.fee)}</span>
          </div>
        </div>
        <div class="transfer-details">
          <div class="clubs">
            <span class="from">${transfer.from.name}</span>
            <span class="arrow">→</span>
            <span class="to">${transfer.to.name}</span>
          </div>
          <div class="transfer-date">
            ${transfer.date.toLocaleDateString()}
          </div>
        </div>
        <div class="contract-details">
          <span class="wages">Wages: ${this.formatMoney(transfer.wages)}/week</span>
          <span class="contract">Contract: ${transfer.contractLength} years</span>
        </div>
      </div>
    `;
  }

  /**
   * Render an outgoing offer card
   */
  renderOutgoingOffer(offer) {
    return `
      <div class="offer-card outgoing">
        <div class="offer-header">
          <div class="player-info">
            <h4>${offer.player.name}</h4>
            <span class="position">${offer.player.position}</span>
            <span class="club">${offer.targetClub}</span>
          </div>
          <div class="offer-status ${offer.status}">
            ${offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </div>
        </div>
        <div class="offer-details">
          <div class="offer-amount">
            <span class="label">Offer:</span>
            <span class="amount">${this.formatMoney(offer.amount)}</span>
          </div>
          <div class="offer-date">
            Submitted: ${offer.date.toLocaleDateString()}
          </div>
        </div>
        <div class="offer-actions">
          ${offer.status === 'pending' ? 
            `<button class="secondary-btn" onclick="this.withdrawOffer('${offer.id}')">Withdraw</button>` : 
            ''
          }
          ${offer.status === 'counter' ? 
            `<button class="primary-btn" onclick="this.respondToCounter('${offer.id}')">Respond</button>` : 
            ''
          }
        </div>
      </div>
    `;
  }

  /**
   * Render an incoming offer card
   */
  renderIncomingOffer(offer) {
    return `
      <div class="offer-card incoming">
        <div class="offer-header">
          <div class="club-info">
            <h4>${offer.fromClub}</h4>
            <span class="league">${offer.fromLeague}</span>
          </div>
          <div class="offer-amount">
            ${this.formatMoney(offer.amount)}
          </div>
        </div>
        <div class="player-details">
          <div class="player-info">
            <span class="player-name">${offer.player.name}</span>
            <span class="position">${offer.player.position}</span>
            <span class="age">${offer.player.age}y</span>
          </div>
          <div class="player-value">
            Value: ${this.formatMoney(offer.player.value)}
          </div>
        </div>
        <div class="offer-actions">
          <button class="primary-btn" onclick="this.acceptOffer('${offer.id}')">Accept</button>
          <button class="secondary-btn" onclick="this.rejectOffer('${offer.id}')">Reject</button>
          <button class="tertiary-btn" onclick="this.counterOffer('${offer.id}')">Counter</button>
        </div>
      </div>
    `;
  }

  /**
   * Render shortlisted player card
   */
  renderShortlistedPlayer(playerId) {
    const player = this.gameState.worldSystem?.allPlayers?.find(p => p.id === playerId);
    if (!player) return '';

    return `
      <div class="shortlisted-player-card">
        <div class="player-card-header">
          <div class="player-name">${player.name}</div>
          <div class="player-age">${player.age}y</div>
        </div>
        <div class="player-card-body">
          <div class="player-position">${player.position}</div>
          <div class="player-stats">
            <div class="stat">
              <span class="stat-label">Rating</span>
              <span class="stat-value">${player.overallRating || player.rating || 'N/A'}</span>
            </div>
          </div>
          <div class="player-club">
            <span class="club-name">${this.getPlayerClub(player) || 'Free Agent'}</span>
          </div>
          <div class="player-price">
            ${this.formatMoney(this.getAskingPrice(player))}
          </div>
        </div>
        <div class="player-card-actions">
          <button class="primary-btn bid-btn" data-player-id="${player.id}">
            Make Bid
          </button>
          <button class="secondary-btn remove-shortlist-btn" data-player-id="${player.id}">
            Remove
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Offer management methods
   */
  withdrawOffer(offerId) {
    console.log('🚫 Withdrawing offer:', offerId);
    // Implementation for withdrawing transfer offer
    alert('Offer withdrawn successfully');
    this.refreshPlayersList();
  }

  respondToCounter(offerId) {
    console.log('💬 Responding to counter offer:', offerId);
    // Implementation for responding to counter offers
    alert('Counter offer response submitted');
    this.refreshPlayersList();
  }

  acceptOffer(offerId) {
    console.log('✅ Accepting incoming offer:', offerId);
    // Implementation for accepting incoming transfer offers
    alert('Offer accepted');
    this.refreshPlayersList();
  }

  rejectOffer(offerId) {
    console.log('❌ Rejecting incoming offer:', offerId);
    // Implementation for rejecting incoming transfer offers
    alert('Offer rejected');
    this.refreshPlayersList();
  }

  counterOffer(offerId) {
    console.log('🔄 Making counter offer:', offerId);
    // Implementation for making counter offers
    const counterAmount = prompt('Enter counter offer amount:');
    if (counterAmount && !isNaN(counterAmount)) {
      alert(`Counter offer of ${this.formatMoney(parseInt(counterAmount))} submitted`);
      this.refreshPlayersList();
    }
  }

  removeFromShortlist(playerId) {
    console.log('🗑️ Removing from shortlist:', playerId);
    
    if (this.gameState.userShortlist) {
      const index = this.gameState.userShortlist.indexOf(playerId);
      if (index > -1) {
        this.gameState.userShortlist.splice(index, 1);
        alert('Player removed from shortlist');
        this.refreshPlayersList();
      }
    }
  }
}
