/**
 * BaseSection - Base class for all UI sections
 */

export class BaseSection {
  constructor(gameState) {
    this.gameState = gameState;
  }

  render(container) {
    throw new Error('render() method must be implemented by subclass');
  }

  getTitle() {
    throw new Error('getTitle() method must be implemented by subclass');
  }

  handleResize() {
    // Optional - implement if section needs resize handling
  }

  cleanup() {
    // Optional - implement if section needs cleanup
  }

  // Utility methods
  formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  createButton(text, onClick, className = 'primary-btn') {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.addEventListener('click', onClick);
    return button;
  }

  createCard(title, content) {
    const card = document.createElement('div');
    card.className = 'info-card';
    card.innerHTML = `
      <h3 class="card-title">${title}</h3>
      <div class="card-content">${content}</div>
    `;
    return card;
  }
}
