/**
 * GameUI - Main UI Controller for Football Management Game
 * Handles full-screen match experience and tabbed navigation
 */

import { MatchUI } from './matchUI.js';
import { NavigationController } from './navigationController.js';
import { MainMenuSection } from './sections/mainMenuSection.js';
import { TeamSelectionSection } from './sections/teamSelectionSection.js';
import { DashboardSection } from './sections/dashboardSection.js';
import { TeamSection } from './sections/teamSection.js';
import { TransferSection } from './sections/transferSection.js';
import { FixturesSection } from './sections/fixturesSection.js';
import { LeagueSection } from './sections/leagueSection.js';

export class GameUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.currentSection = 'main-menu'; // Start with main menu
    this.isMatchMode = false;
    
    // UI Components
    this.matchUI = null;
    this.navigationController = null;
    this.sections = {};
    
    // Don't auto-initialize - wait for explicit call
  }

  initialize() {
    this.createMainLayout();
    this.setupNavigation();
    this.setupSections();
    this.setupEventListeners();
    this.showSection('main-menu'); // Show main menu first
    
    console.log('🎨 GameUI initialized successfully');
  }

  createMainLayout() {
    const body = document.body;
    
    // Clear existing content
    body.innerHTML = '';
    
    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.id = 'game-container';
    mainContainer.className = 'game-container';
    
    // Create navigation
    const nav = document.createElement('nav');
    nav.id = 'main-navigation';
    nav.className = 'main-navigation';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main Navigation');
    
    // Create main content area
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.className = 'main-content';
    mainContent.setAttribute('role', 'main');
    
    // Create match overlay (hidden by default)
    const matchOverlay = document.createElement('div');
    matchOverlay.id = 'match-overlay';
    matchOverlay.className = 'match-overlay hidden';
    matchOverlay.setAttribute('role', 'dialog');
    matchOverlay.setAttribute('aria-label', 'Match View');
    
    // Assemble layout
    mainContainer.appendChild(nav);
    mainContainer.appendChild(mainContent);
    mainContainer.appendChild(matchOverlay);
    
    body.appendChild(mainContainer);
  }

  setupNavigation() {
    const navConfig = [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { id: 'team', label: 'Team', icon: '👥' },
      { id: 'transfers', label: 'Transfers', icon: '💰' },
      { id: 'fixtures', label: 'Fixtures', icon: '📅' },
      { id: 'league', label: 'League', icon: '🏆' },
      { id: 'stats', label: 'Statistics', icon: '📊' }
    ];

    this.navigationController = new NavigationController(
      document.getElementById('main-navigation'),
      navConfig,
      (sectionId) => this.showSection(sectionId)
    );
  }

  setupSections() {
    console.log('🔧 Setting up UI sections...');
    this.sections = {};
    
    try {
      this.sections['main-menu'] = new MainMenuSection(this.gameState);
      console.log('✅ MainMenuSection created');
    } catch (error) {
      console.error('❌ Error creating MainMenuSection:', error);
    }
    
    try {
      this.sections['team-selection'] = new TeamSelectionSection(this.gameState);
      console.log('✅ TeamSelectionSection created');
    } catch (error) {
      console.error('❌ Error creating TeamSelectionSection:', error);
    }
    
    try {
      this.sections.dashboard = new DashboardSection(this.gameState);
      console.log('✅ DashboardSection created');
    } catch (error) {
      console.error('❌ Error creating DashboardSection:', error);
    }
    
    try {
      this.sections.team = new TeamSection(this.gameState);
      console.log('✅ TeamSection created');
    } catch (error) {
      console.error('❌ Error creating TeamSection:', error);
    }
    
    try {
      this.sections.transfers = new TransferSection(this.gameState);
      console.log('✅ TransferSection created');
    } catch (error) {
      console.error('❌ Error creating TransferSection:', error);
    }
    
    try {
      this.sections.fixtures = new FixturesSection(this.gameState);
      console.log('✅ FixturesSection created');
    } catch (error) {
      console.error('❌ Error creating FixturesSection:', error);
    }
    
    try {
      this.sections.league = new LeagueSection(this.gameState);
      console.log('✅ LeagueSection created');
    } catch (error) {
      console.error('❌ Error creating LeagueSection:', error);
    }
    
    try {
      this.sections.stats = new LeagueSection(this.gameState);
      console.log('✅ StatsSection (reusing LeagueSection) created');
    } catch (error) {
      console.error('❌ Error creating StatsSection:', error);
    }
    
    console.log('✅ Sections setup completed:', Object.keys(this.sections));
  }

  setupEventListeners() {
    // Listen for game initialization completion
    this.gameState.eventCallbacks.uiUpdate = () => {
      this.refreshCurrentSection();
    };

    // Listen for main menu navigation
    this.gameState.eventCallbacks.startTeamSelection = () => {
      this.showSection('team-selection');
    };

    this.gameState.eventCallbacks.showMainMenu = () => {
      this.showSection('main-menu');
    };

    this.gameState.eventCallbacks.teamSelected = () => {
      this.showSection('dashboard');
    };
    
    // Listen for match start events
    this.gameState.eventCallbacks.matchStarted = (fixture) => {
      this.startMatchMode(fixture);
    };

    // Listen for match end events
    this.gameState.eventCallbacks.matchCompleted = (result) => {
      this.endMatchMode(result);
    };

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  showSection(sectionId) {
    if (this.isMatchMode) return; // Don't allow navigation during matches

    console.log(`🎯 Showing section: ${sectionId}`);
    this.currentSection = sectionId;
    const mainContent = document.getElementById('main-content');
    
    // Update navigation state (but only for game sections, not menu sections)
    const isMenuSection = ['main-menu', 'team-selection'].includes(sectionId);
    if (!isMenuSection) {
      this.navigationController?.setActiveSection(sectionId);
    }
    
    // Hide/show navigation for menu sections
    const navElement = document.getElementById('main-navigation');
    if (navElement) {
      navElement.style.display = isMenuSection ? 'none' : 'flex';
    }
    
    // Clear current content and cleanup previous section
    const previousSection = this.sections[this.currentSection];
    if (previousSection && typeof previousSection.cleanup === 'function') {
      previousSection.cleanup();
    }
    mainContent.innerHTML = '';
    
    // Load section content
    const section = this.sections[sectionId];
    console.log(`📖 Section found for '${sectionId}':`, !!section);
    if (section) {
      console.log(`🏷️ Section title: ${section.getTitle()}`);
      section.render(mainContent);
      
      // Update page title
      document.title = `Eoin's Football Game - ${section.getTitle()}`;
      
      // Announce section change for screen readers
      this.announcePageChange(section.getTitle());
    } else {
      console.error(`Section '${sectionId}' not found in sections:`, Object.keys(this.sections));
      mainContent.innerHTML = `<div class="error-message">Section '${sectionId}' not found</div>`;
    }
  }

  startMatchMode(fixture) {
    this.isMatchMode = true;
    
    // Hide main UI
    const mainNav = document.getElementById('main-navigation');
    const mainContent = document.getElementById('main-content');
    const matchOverlay = document.getElementById('match-overlay');
    
    mainNav.classList.add('hidden');
    mainContent.classList.add('hidden');
    matchOverlay.classList.remove('hidden');
    
    // Initialize match UI
    this.matchUI = new MatchUI(this.gameState, fixture);
    this.matchUI.render(matchOverlay);
    
    // Update body class for styling
    document.body.classList.add('match-mode');
    
    // Set focus to match container
    matchOverlay.focus();
    
    console.log('🎮 Entered match mode for:', fixture.homeTeam.name, 'vs', fixture.awayTeam.name);
  }

  endMatchMode(result) {
    this.isMatchMode = false;
    
    // Show main UI
    const mainNav = document.getElementById('main-navigation');
    const mainContent = document.getElementById('main-content');
    const matchOverlay = document.getElementById('match-overlay');
    
    mainNav.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    matchOverlay.classList.add('hidden');
    
    // Clean up match UI
    if (this.matchUI) {
      this.matchUI.cleanup();
      this.matchUI = null;
    }
    
    matchOverlay.innerHTML = '';
    
    // Update body class
    document.body.classList.remove('match-mode');
    
    // Refresh current section to show updated data
    this.showSection(this.currentSection);
    
    // Show match summary notification
    this.showMatchSummary(result);
    
    console.log('🏁 Exited match mode');
  }

  showMatchSummary(result) {
    const notification = document.createElement('div');
    notification.className = 'match-summary-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h3>Match Completed</h3>
        <p>
          <strong>${result.homeTeam.name}</strong> ${result.homeScore} - ${result.awayScore} 
          <strong>${result.awayTeam.name}</strong>
        </p>
        <button id="close-notification" class="primary-btn">Continue</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
    
    // Manual close
    const closeBtn = notification.querySelector('#close-notification');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(notification);
    });
  }

  handleKeyboardNavigation(e) {
    if (this.isMatchMode) {
      // Pass keyboard events to match UI
      if (this.matchUI) {
        this.matchUI.handleKeyboard(e);
      }
      return;
    }

    // Main UI keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      const shortcuts = {
        '1': 'dashboard',
        '2': 'team', 
        '3': 'transfers',
        '4': 'fixtures',
        '5': 'league',
        '6': 'stats'
      };
      
      if (shortcuts[key]) {
        e.preventDefault();
        this.showSection(shortcuts[key]);
      }
    }
  }

  handleResize() {
    // Update responsive layout
    const container = document.getElementById('game-container');
    const width = window.innerWidth;
    
    if (width < 768) {
      container.classList.add('mobile-layout');
    } else if (width < 1024) {
      container.classList.add('tablet-layout');
      container.classList.remove('mobile-layout');
    } else {
      container.classList.remove('mobile-layout', 'tablet-layout');
    }
    
    // Notify current section of resize
    const section = this.sections[this.currentSection];
    section?.handleResize?.();
  }

  announcePageChange(title) {
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigated to ${title}`;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Public methods for external use
  triggerMatch(fixture) {
    this.gameState?.startMatch?.(fixture.id, true);
  }

  refreshCurrentSection() {
    this.showSection(this.currentSection);
  }

  getCurrentSection() {
    return this.currentSection;
  }

  isInMatchMode() {
    return this.isMatchMode;
  }
}
