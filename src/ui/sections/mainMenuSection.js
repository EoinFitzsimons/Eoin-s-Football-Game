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

    // Future functionality
    loadGameBtn.addEventListener('click', () => {
      console.log('💾 Load Game (coming soon)');
    });

    settingsBtn.addEventListener('click', () => {
      console.log('⚙️ Settings (coming soon)');
    });
  }

  handleResize() {
    // Main menu is responsive by default
  }
}
