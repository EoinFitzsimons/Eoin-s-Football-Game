/**
 * NavigationController - Manages main navigation tabs/sections
 */

export class NavigationController {
  constructor(container, navigationConfig, onSectionChange) {
    this.container = container;
    this.config = navigationConfig;
    this.onSectionChange = onSectionChange;
    this.activeSection = null;
    
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    
    // Create navigation list
    const navList = document.createElement('ul');
    navList.className = 'nav-list';
    navList.setAttribute('role', 'tablist');
    
    this.config.forEach(section => {
      const navItem = this.createNavItem(section);
      navList.appendChild(navItem);
    });
    
    this.container.appendChild(navList);
  }

  createNavItem(section) {
    const listItem = document.createElement('li');
    listItem.className = 'nav-item';
    
    const button = document.createElement('button');
    button.id = `nav-${section.id}`;
    button.className = 'nav-button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'main-content');
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('data-section', section.id);
    
    // Add icon and label
    button.innerHTML = `
      <span class="nav-icon" aria-hidden="true">${section.icon}</span>
      <span class="nav-label">${section.label}</span>
    `;
    
    // Add click handler
    button.addEventListener('click', () => {
      this.handleSectionChange(section.id);
    });
    
    // Add keyboard handler
    button.addEventListener('keydown', (e) => {
      this.handleKeydown(e, section.id);
    });
    
    listItem.appendChild(button);
    return listItem;
  }

  handleSectionChange(sectionId) {
    this.setActiveSection(sectionId);
    if (this.onSectionChange) {
      this.onSectionChange(sectionId);
    }
  }

  handleKeydown(e, currentSectionId) {
    const keys = {
      'ArrowLeft': -1,
      'ArrowRight': 1,
      'Home': 'first',
      'End': 'last'
    };
    
    if (!keys.hasOwnProperty(e.key)) return;
    
    e.preventDefault();
    
    const currentIndex = this.config.findIndex(s => s.id === currentSectionId);
    let newIndex;
    
    if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = this.config.length - 1;
    } else {
      newIndex = currentIndex + keys[e.key];
      if (newIndex < 0) newIndex = this.config.length - 1;
      if (newIndex >= this.config.length) newIndex = 0;
    }
    
    const newSection = this.config[newIndex];
    const newButton = document.getElementById(`nav-${newSection.id}`);
    newButton.focus();
    this.handleSectionChange(newSection.id);
  }

  setActiveSection(sectionId) {
    // Remove active state from all buttons
    const allButtons = this.container.querySelectorAll('.nav-button');
    allButtons.forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-selected', 'false');
    });
    
    // Set active state on current button
    const activeButton = document.getElementById(`nav-${sectionId}`);
    if (activeButton) {
      activeButton.classList.add('active');
      activeButton.setAttribute('aria-selected', 'true');
    }
    
    this.activeSection = sectionId;
  }

  getActiveSection() {
    return this.activeSection;
  }
}
