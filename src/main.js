import { GameState } from './game.js';
import { GameUI } from './ui/gameUI.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Football Manager...');
    
    // Create main game instance
    const game = new GameState();
    
    // Create UI manager (but don't initialize yet)
    const gameUI = new GameUI(game);
    
    // Initialize the game first, then the UI
    game.initialize().then(() => {
        console.log('Game state initialized, setting up UI...');
        return gameUI.initialize();
    }).then(() => {
        console.log('Football Manager initialized successfully');
        
        // UI will show main menu by default - no need to force dashboard
        
        // Set up responsive design detection
        const checkResponsive = () => {
            const width = window.innerWidth;
            const container = document.querySelector('.game-container');
            
            if (width < 768) {
                container?.classList.add('mobile-layout');
                container?.classList.remove('tablet-layout');
            } else if (width < 1200) {
                container?.classList.add('tablet-layout');
                container?.classList.remove('mobile-layout');
            } else {
                container?.classList.remove('mobile-layout', 'tablet-layout');
            }
        };
        
        checkResponsive();
        window.addEventListener('resize', checkResponsive);
        
        // Set up keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to exit match mode
            if (e.key === 'Escape' && gameUI.isMatchMode()) {
                gameUI.endMatchMode();
            }
            
            // Number keys for navigation (1-5)
            if (e.key >= '1' && e.key <= '5' && !gameUI.isMatchMode()) {
                const sections = ['dashboard', 'team', 'fixtures', 'transfers', 'league'];
                const index = parseInt(e.key) - 1;
                if (sections[index]) {
                    gameUI.showSection(sections[index]);
                }
            }
        });
        
    }).catch(error => {
        console.error('Failed to initialize Football Manager:', error);
        
        // Show error message to user
        const container = document.querySelector('#center-content') || document.body;
        container.innerHTML = `
            <div style="
                text-align: center; 
                padding: 40px; 
                color: #dc3545;
                background: rgba(220, 53, 69, 0.1);
                border-radius: 12px;
                border: 2px solid #dc3545;
                margin: 20px;
            ">
                <h2>⚠️ Initialization Error</h2>
                <p>Failed to load the game. Please refresh the page and try again.</p>
                <pre style="color: #ccc; margin-top: 15px; font-size: 12px;">${error.message}</pre>
            </div>
        `;
    });
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
