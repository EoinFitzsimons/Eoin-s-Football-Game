import { BaseSection } from './baseSection.js';

export class MainMenuSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.sectionId = 'main-menu';
    this.title = "Eoin's Football Game";
  }

  getTitle() {
    return this.title;
  }

  render(container) {
    const mainMenu = document.createElement('div');
    mainMenu.className = 'main-menu-section';
    
    mainMenu.innerHTML = `
      <div class="main-menu-container">
        <div class="game-logo">
          <h1>⚽ Eoin's Football Game</h1>
          <p class="subtitle">Master the Beautiful Game</p>
        </div>
        
        <div class="menu-options">
          <button id="new-game-btn" class="menu-btn primary">
            <span class="btn-icon">🆕</span>
            <span class="btn-text">New Game</span>
            <span class="btn-description">Start your managerial career</span>
          </button>
          
          <button id="load-game-btn" class="menu-btn secondary" disabled>
            <span class="btn-icon">💾</span>
            <span class="btn-text">Load Game</span>
            <span class="btn-description">Continue your journey</span>
          </button>
          
          <button id="settings-btn" class="menu-btn secondary" disabled>
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">Settings</span>
            <span class="btn-description">Customize your experience</span>
          </button>
        </div>
        
        <div class="menu-footer">
          <p>Version 1.0.0 | Built with passion for football</p>
        </div>
      </div>
    `;

    this.setupEventListeners(mainMenu);
    container.appendChild(mainMenu);
  }

  setupEventListeners(container) {
    const newGameBtn = container.querySelector('#new-game-btn');
    const loadGameBtn = container.querySelector('#load-game-btn');
    const settingsBtn = container.querySelector('#settings-btn');

    newGameBtn.addEventListener('click', () => {
      console.log('🆕 New Game selected');
      // Trigger team selection
      if (this.gameState.eventCallbacks.startTeamSelection) {
        this.gameState.eventCallbacks.startTeamSelection();
      }
    });

    // Load game functionality
    loadGameBtn.addEventListener('click', () => {
      console.log('💾 Loading saved game...');
      this.showLoadGameDialog();
    });

    // Settings functionality
    settingsBtn.addEventListener('click', () => {
      console.log('⚙️ Opening settings...');
      this.showSettingsDialog();
    });
  }

  showLoadGameDialog() {
    // Create load game modal
    const modal = document.createElement('div');
    modal.className = 'load-game-modal';
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h2>💾 Load Game</h2>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            ${this.renderSaveSlots()}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupModalClosing(modal);
  }

  showSettingsDialog() {
    // Create settings modal
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h2>⚙️ Game Settings</h2>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            ${this.renderSettings()}
          </div>
          <div class="modal-footer">
            <button class="save-settings-btn primary-btn">Save Settings</button>
            <button class="cancel-btn secondary-btn">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupModalClosing(modal);
    this.setupSettingsHandlers(modal);
  }

  renderSaveSlots() {
    const saveSlots = this.getSaveSlots();
    
    if (saveSlots.length === 0) {
      return `
        <div class="no-saves">
          <p>No saved games found.</p>
          <p>Start a new game to create your first save.</p>
        </div>
      `;
    }
    
    return `
      <div class="save-slots">
        ${saveSlots.map((save, index) => `
          <div class="save-slot" data-slot="${index}">
            <div class="save-info">
              <div class="save-team">${save.teamName}</div>
              <div class="save-league">${save.leagueName}</div>
              <div class="save-season">Season ${save.season}</div>
              <div class="save-date">${new Date(save.saveDate).toLocaleDateString()}</div>
            </div>
            <div class="save-actions">
              <button class="load-btn primary-btn" data-slot="${index}">Load</button>
              <button class="delete-btn danger-btn" data-slot="${index}">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderSettings() {
    const currentSettings = this.getGameSettings();
    
    return `
      <div class="settings-groups">
        ${this.renderAudioSettings(currentSettings)}
        ${this.renderGameplaySettings(currentSettings)}
        ${this.renderDisplaySettings(currentSettings)}
      </div>
    `;
  }

  renderAudioSettings(currentSettings) {
    return `
      <div class="setting-group">
        <h3>Audio Settings</h3>
        <div class="setting-item">
          <label for="master-volume">Master Volume:</label>
          <input type="range" id="master-volume" min="0" max="100" value="${currentSettings.audio.masterVolume}">
          <span class="volume-display">${currentSettings.audio.masterVolume}%</span>
        </div>
        <div class="setting-item">
          <label for="sound-effects">Sound Effects:</label>
          <input type="checkbox" id="sound-effects" ${currentSettings.audio.soundEffects ? 'checked' : ''}>
        </div>
        <div class="setting-item">
          <label for="background-music">Background Music:</label>
          <input type="checkbox" id="background-music" ${currentSettings.audio.backgroundMusic ? 'checked' : ''}>
        </div>
      </div>
    `;
  }

  renderGameplaySettings(currentSettings) {
    return `
      <div class="setting-group">
        <h3>Gameplay Settings</h3>
        <div class="setting-item">
          <label for="match-speed">Default Match Speed:</label>
          <select id="match-speed">
            <option value="1" ${currentSettings.gameplay.matchSpeed === 1 ? 'selected' : ''}>1x (Normal)</option>
            <option value="2" ${currentSettings.gameplay.matchSpeed === 2 ? 'selected' : ''}>2x (Fast)</option>
            <option value="3" ${currentSettings.gameplay.matchSpeed === 3 ? 'selected' : ''}>3x (Very Fast)</option>
          </select>
        </div>
        <div class="setting-item">
          <label for="auto-save">Auto-save:</label>
          <input type="checkbox" id="auto-save" ${currentSettings.gameplay.autoSave ? 'checked' : ''}>
        </div>
        <div class="setting-item">
          <label for="skip-non-user-matches">Skip Non-User Matches:</label>
          <input type="checkbox" id="skip-non-user-matches" ${currentSettings.gameplay.skipNonUserMatches ? 'checked' : ''}>
        </div>
      </div>
    `;
  }

  renderDisplaySettings(currentSettings) {
    return `
      <div class="setting-group">
        <h3>Display Settings</h3>
        <div class="setting-item">
          <label for="language">Language:</label>
          <select id="language">
            <option value="en" ${currentSettings.display.language === 'en' ? 'selected' : ''}>English</option>
            <option value="es" ${currentSettings.display.language === 'es' ? 'selected' : ''}>Español</option>
            <option value="fr" ${currentSettings.display.language === 'fr' ? 'selected' : ''}>Français</option>
            <option value="de" ${currentSettings.display.language === 'de' ? 'selected' : ''}>Deutsch</option>
          </select>
        </div>
        <div class="setting-item">
          <label for="theme">Theme:</label>
          <select id="theme">
            <option value="dark" ${currentSettings.display.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="light" ${currentSettings.display.theme === 'light' ? 'selected' : ''}>Light</option>
            <option value="auto" ${currentSettings.display.theme === 'auto' ? 'selected' : ''}>Auto</option>
          </select>
        </div>
        <div class="setting-item">
          <label for="currency">Currency Display:</label>
          <select id="currency">
            <option value="GBP" ${currentSettings.display.currency === 'GBP' ? 'selected' : ''}>£ (Pounds)</option>
            <option value="EUR" ${currentSettings.display.currency === 'EUR' ? 'selected' : ''}>€ (Euros)</option>
            <option value="USD" ${currentSettings.display.currency === 'USD' ? 'selected' : ''}>$ (Dollars)</option>
          </select>
        </div>
      </div>
    `;
  }

  getSaveSlots() {
    // Get saved games from localStorage
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('football_manager_save_')) {
        try {
          const saveData = JSON.parse(localStorage.getItem(key));
          saves.push({
            slot: key,
            teamName: saveData.userTeam?.name || 'Unknown Team',
            leagueName: saveData.league?.name || 'Unknown League',
            season: saveData.currentSeason || 2024,
            saveDate: saveData.saveDate || Date.now()
          });
        } catch (error) {
          console.error('Error parsing save data:', error);
        }
      }
    }
    
    return saves.sort((a, b) => new Date(b.saveDate) - new Date(a.saveDate));
  }

  getGameSettings() {
    // Get settings from localStorage or use defaults
    const defaultSettings = {
      audio: {
        masterVolume: 50,
        soundEffects: true,
        backgroundMusic: true
      },
      gameplay: {
        matchSpeed: 2,
        autoSave: true,
        skipNonUserMatches: false
      },
      display: {
        language: 'en',
        theme: 'dark',
        currency: 'GBP'
      }
    };
    
    try {
      const savedSettings = localStorage.getItem('football_manager_settings');
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  setupModalClosing(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const backdrop = modal.querySelector('.modal-backdrop');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  setupSettingsHandlers(modal) {
    // Volume slider updates
    const volumeSlider = modal.querySelector('#master-volume');
    const volumeDisplay = modal.querySelector('.volume-display');
    if (volumeSlider && volumeDisplay) {
      volumeSlider.addEventListener('input', (e) => {
        volumeDisplay.textContent = `${e.target.value}%`;
      });
    }
    
    // Save settings button
    const saveBtn = modal.querySelector('.save-settings-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveSettings(modal);
      });
    }
    
    // Load game buttons
    modal.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slot = e.target.dataset.slot;
        this.loadGame(slot);
      });
    });
    
    // Delete save buttons
    modal.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slot = e.target.dataset.slot;
        this.deleteSave(slot);
      });
    });
  }

  saveSettings(modal) {
    try {
      const settings = {
        audio: {
          masterVolume: parseInt(modal.querySelector('#master-volume').value),
          soundEffects: modal.querySelector('#sound-effects').checked,
          backgroundMusic: modal.querySelector('#background-music').checked
        },
        gameplay: {
          matchSpeed: parseInt(modal.querySelector('#match-speed').value),
          autoSave: modal.querySelector('#auto-save').checked,
          skipNonUserMatches: modal.querySelector('#skip-non-user-matches').checked
        },
        display: {
          language: modal.querySelector('#language').value,
          theme: modal.querySelector('#theme').value,
          currency: modal.querySelector('#currency').value
        }
      };
      
      localStorage.setItem('football_manager_settings', JSON.stringify(settings));
      alert('Settings saved successfully!');
      document.body.removeChild(modal);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  }

  loadGame(slot) {
    try {
      const saveSlots = this.getSaveSlots();
      const saveData = saveSlots[slot];
      if (saveData) {
        const gameData = JSON.parse(localStorage.getItem(saveData.slot));
        // Trigger game load with the callback
        if (this.onLoadGame) {
          this.onLoadGame(gameData);
        }
        console.log('Game loaded successfully');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      alert('Error loading game. Save file may be corrupted.');
    }
  }

  deleteSave(slot) {
    try {
      const saveSlots = this.getSaveSlots();
      const saveData = saveSlots[slot];
      if (saveData && confirm(`Delete save: ${saveData.teamName}?`)) {
        localStorage.removeItem(saveData.slot);
        // Refresh the modal
        const modal = document.querySelector('.load-game-modal');
        if (modal) {
          const modalBody = modal.querySelector('.modal-body');
          modalBody.innerHTML = this.renderSaveSlots();
        }
      }
    } catch (error) {
      console.error('Error deleting save:', error);
      alert('Error deleting save file.');
    }
  }

  handleResize() {
    // Main menu is responsive by default
  }
}
