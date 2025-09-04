import { GameState } from './game.js';
import { GameUI } from './ui/gameUI.js';

// Enhanced error handling and user feedback system
class ErrorHandler {
    static showError(message, details = null, recoverable = true) {
        console.error('Game Error:', message, details);
        
        // Create error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'error-modal';
        errorModal.innerHTML = `
            <div class="error-backdrop">
                <div class="error-content">
                    <div class="error-header">
                        <h2>⚠️ ${recoverable ? 'Error' : 'Critical Error'}</h2>
                    </div>
                    <div class="error-body">
                        <p class="error-message">${message}</p>
                        ${details ? `<details class="error-details">
                            <summary>Technical Details</summary>
                            <pre>${details}</pre>
                        </details>` : ''}
                    </div>
                    <div class="error-actions">
                        ${recoverable ? `
                            <button class="retry-btn primary-btn">Try Again</button>
                            <button class="continue-btn secondary-btn">Continue Anyway</button>
                        ` : `
                            <button class="reload-btn primary-btn">Reload Game</button>
                        `}
                        <button class="dismiss-btn secondary-btn">Dismiss</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        
        // Setup event handlers
        const retryBtn = errorModal.querySelector('.retry-btn');
        const continueBtn = errorModal.querySelector('.continue-btn');
        const reloadBtn = errorModal.querySelector('.reload-btn');
        const dismissBtn = errorModal.querySelector('.dismiss-btn');
        
        const closeModal = () => {
            if (document.body.contains(errorModal)) {
                document.body.removeChild(errorModal);
            }
        };
        
        retryBtn?.addEventListener('click', () => {
            closeModal();
            // Retry the last action if available
            if (ErrorHandler.lastAction) {
                ErrorHandler.lastAction();
            }
        });
        
        continueBtn?.addEventListener('click', closeModal);
        dismissBtn?.addEventListener('click', closeModal);
        reloadBtn?.addEventListener('click', () => {
            window.location.reload();
        });
        
        return errorModal;
    }
    
    static showSuccess(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="success-icon">✅</span>
                <span class="success-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
        
        return notification;
    }
    
    static showLoading(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(loader);
        return loader;
    }
    
    static hideLoading(loader) {
        if (loader && document.body.contains(loader)) {
            document.body.removeChild(loader);
        }
    }
    
    static setLastAction(action) {
        ErrorHandler.lastAction = action;
    }
}

// Performance monitoring
class PerformanceMonitor {
    static startTiming(label) {
        console.time(label);
        performance.mark(`${label}-start`);
    }
    
    static endTiming(label) {
        console.timeEnd(label);
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
    }
    
    static logMemoryUsage() {
        if (performance.memory) {
            console.log('Memory Usage:', {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Football Manager...');
    PerformanceMonitor.startTiming('game-initialization');
    
    const loader = ErrorHandler.showLoading('Initializing game systems...');
    
    try {
        // Create main game instance
        console.log('📦 Creating game state...');
        const game = new GameState();
        
        // Create UI manager (but don't initialize yet)
        console.log('🎨 Creating UI manager...');
        const gameUI = new GameUI(game);
        
        // Make gameUI available globally for dashboard and other components
        window.gameUI = gameUI;
        
        // Initialize the game first, then the UI
        console.log('⚙️ Initializing game state...');
        ErrorHandler.setLastAction(() => game.initialize());
        await game.initialize();
        
        console.log('🖥️ Setting up user interface...');
        ErrorHandler.setLastAction(() => gameUI.initialize());
        gameUI.initialize();
        
        ErrorHandler.hideLoading(loader);
        PerformanceMonitor.endTiming('game-initialization');
        
        console.log('✅ Football Manager initialized successfully');
        ErrorHandler.showSuccess('Football Manager loaded successfully!');
        
        // Log initial memory usage
        PerformanceMonitor.logMemoryUsage();
        
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
        
        // Enhanced keyboard shortcuts with error handling
        document.addEventListener('keydown', (e) => {
            try {
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
            } catch (keyError) {
                console.error('Keyboard shortcut error:', keyError);
                ErrorHandler.showError('Error processing keyboard shortcut', keyError.message);
            }
        });
        
        // Set up periodic performance monitoring
        setInterval(() => {
            PerformanceMonitor.logMemoryUsage();
        }, 60000); // Every minute
        
        // Auto-save functionality
        setInterval(() => {
            try {
                if (game?.save) {
                    game.save();
                    console.log('💾 Auto-save completed');
                }
            } catch (saveError) {
                console.error('Auto-save failed:', saveError);
            }
        }, 300000); // Every 5 minutes
        
    } catch (error) {
        console.error('Failed to initialize Football Manager:', error);
        ErrorHandler.hideLoading(loader);
        
        ErrorHandler.showError(
            'Failed to initialize the game. Please refresh the page and try again.',
            error.message,
            false // Not recoverable
        );
        
        PerformanceMonitor.endTiming('game-initialization');
    }
});

// Enhanced global error handlers
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    ErrorHandler.showError(
        'An unexpected error occurred',
        event.error?.message || 'Unknown error',
        true
    );
});

// Export error handler for use in other modules
window.ErrorHandler = ErrorHandler;
window.PerformanceMonitor = PerformanceMonitor;

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    ErrorHandler.showError(
        'An asynchronous operation failed',
        event.reason?.message || 'Promise rejection',
        true
    );
});
