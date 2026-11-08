/**
 * MainMenuSection - title screen with a canvas-drawn crest, new game, continue,
 * settings and a short how-to-play panel.
 */
import { BaseSection } from './baseSection.js';
import { GameState } from '../../game.js';
import { loadSettings, updateSettings } from '../../settings.js';

export class MainMenuSection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.sectionId = 'main-menu';
    this.title = "Eoin's Football Game";
    this.animationId = null;
  }

  getTitle() {
    return this.title;
  }

  render(container) {
    const save = GameState.readSaveSummary();
    const menu = document.createElement('div');
    menu.className = 'main-menu-section';
    menu.innerHTML = `
      <canvas id="menu-backdrop" class="menu-backdrop" aria-hidden="true"></canvas>
      <div class="main-menu-container">
        <div class="game-logo">
          <canvas id="menu-crest" class="menu-crest" width="140" height="140" aria-hidden="true"></canvas>
          <h1>Eoin's Football Game</h1>
          <p class="subtitle">Manage the club. Then step onto the pitch.</p>
        </div>

        <div class="menu-options">
          <button id="new-game-btn" class="menu-btn primary">
            <span class="btn-text">New career</span>
            <span class="btn-description">Pick a country, a league and a club</span>
          </button>
          <button id="load-game-btn" class="menu-btn secondary" ${save ? '' : 'disabled'}>
            <span class="btn-text">Continue</span>
            <span class="btn-description">${save ? `${save.teamName} · ${save.leagueName} · ${save.season}/${String(save.season + 1).slice(-2)} · ${save.played} played` : 'No saved career yet'}</span>
          </button>
          <button id="settings-btn" class="menu-btn secondary">
            <span class="btn-text">Settings</span>
            <span class="btn-description">Sound, half length and difficulty</span>
          </button>
        </div>

        <div class="menu-howto">
          <h3>How it works</h3>
          <p>Run a club through a full league season. Simulate routine fixtures in a click, or take control on the pitch for the big ones: a top-down match with <kbd>Arrows</kbd> to move, <kbd>Space</kbd> to shoot and <kbd>Shift</kbd> to pass.</p>
        </div>

        <div class="menu-footer">
          <p>Everything you see and hear is drawn and synthesised in code. No images, no audio files.</p>
        </div>
      </div>
      <div id="settings-panel" class="settings-panel hidden"></div>
    `;

    menu.querySelector('#new-game-btn').addEventListener('click', () => {
      if (save && !window.confirm('Starting a new career will replace your saved one. Continue?')) return;
      this.gameState.eventCallbacks.startTeamSelection?.();
    });
    menu.querySelector('#load-game-btn').addEventListener('click', () => this.continueCareer(menu));
    menu.querySelector('#settings-btn').addEventListener('click', () => this.toggleSettings(menu));

    container.appendChild(menu);
    this.drawCrest(menu.querySelector('#menu-crest'));
    this.startBackdrop(menu.querySelector('#menu-backdrop'));
  }

  async continueCareer(menu) {
    const button = menu.querySelector('#load-game-btn');
    button.disabled = true;
    button.querySelector('.btn-text').textContent = 'Loading…';
    try {
      const ok = await this.gameState.loadFromSave();
      if (ok) {
        this.gameState.eventCallbacks.teamSelected?.();
      } else {
        button.querySelector('.btn-text').textContent = 'Continue';
        button.querySelector('.btn-description').textContent = 'The save could not be loaded';
      }
    } catch (error) {
      console.error('Load failed', error);
      button.querySelector('.btn-description').textContent = 'The save could not be loaded';
    }
  }

  toggleSettings(menu) {
    const panel = menu.querySelector('#settings-panel');
    if (!panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      return;
    }
    const s = loadSettings();
    panel.innerHTML = `
      <div class="settings-card">
        <h2>Settings</h2>
        <label class="setting-row">
          <span>Sound</span>
          <input type="checkbox" id="setting-sound" ${s.soundEnabled ? 'checked' : ''}>
        </label>
        <label class="setting-row">
          <span>Half length</span>
          <select id="setting-half">
            <option value="1" ${s.halfLengthMinutes === 1 ? 'selected' : ''}>1 minute</option>
            <option value="2" ${s.halfLengthMinutes === 2 ? 'selected' : ''}>2 minutes</option>
            <option value="3" ${s.halfLengthMinutes === 3 ? 'selected' : ''}>3 minutes</option>
          </select>
        </label>
        <label class="setting-row">
          <span>Difficulty</span>
          <select id="setting-difficulty">
            ${['easy', 'normal', 'hard'].map(d => `<option value="${d}" ${s.difficulty === d ? 'selected' : ''}>${d[0].toUpperCase()}${d.slice(1)}</option>`).join('')}
          </select>
        </label>
        <label class="setting-row">
          <span>Auto-save after every match</span>
          <input type="checkbox" id="setting-autosave" ${s.autoSave ? 'checked' : ''}>
        </label>
        <div class="settings-actions">
          <button id="settings-done" class="primary-btn">Done</button>
          ${GameState.hasSave() ? '<button id="settings-delete" class="danger-btn">Delete saved career</button>' : ''}
        </div>
      </div>
    `;
    panel.classList.remove('hidden');

    const apply = () => {
      this.gameState.settings = updateSettings({
        soundEnabled: panel.querySelector('#setting-sound').checked,
        halfLengthMinutes: Number(panel.querySelector('#setting-half').value),
        difficulty: panel.querySelector('#setting-difficulty').value,
        autoSave: panel.querySelector('#setting-autosave').checked
      });
    };
    panel.querySelectorAll('input, select').forEach(el => el.addEventListener('change', apply));
    panel.querySelector('#settings-done').addEventListener('click', () => panel.classList.add('hidden'));
    panel.querySelector('#settings-delete')?.addEventListener('click', () => {
      if (window.confirm('Delete the saved career? This cannot be undone.')) {
        GameState.deleteSave();
        window.gameUI.showSection('main-menu');
      }
    });
  }

  /** A simple club crest: shield, stripes, ball and laurel ticks. */
  drawCrest(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const shield = () => {
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.12);
      ctx.lineTo(w * 0.85, h * 0.12);
      ctx.lineTo(w * 0.85, h * 0.55);
      ctx.quadraticCurveTo(w * 0.85, h * 0.85, w * 0.5, h * 0.95);
      ctx.quadraticCurveTo(w * 0.15, h * 0.85, w * 0.15, h * 0.55);
      ctx.closePath();
    };
    shield();
    ctx.fillStyle = '#1f6f3a';
    ctx.fill();
    ctx.save();
    shield();
    ctx.clip();
    ctx.fillStyle = '#ffe66d';
    for (let i = 0; i < 4; i++) ctx.fillRect(w * (0.15 + i * 0.35), 0, w * 0.09, h);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, h * 0.12, w, h * 0.16);
    ctx.restore();
    shield();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f6f6f6';
    ctx.stroke();

    ctx.fillStyle = '#f6f6f6';
    ctx.font = `700 ${Math.round(h * 0.11)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EFG', w / 2, h * 0.2);

    const bx = w / 2;
    const by = h * 0.58;
    const r = w * 0.17;
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const px = bx + Math.cos(a) * r * 0.45;
      const py = by + Math.sin(a) * r * 0.45;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(a) * r * 0.45, by + Math.sin(a) * r * 0.45);
      ctx.lineTo(bx + Math.cos(a) * r * 0.95, by + Math.sin(a) * r * 0.95);
      ctx.stroke();
    }
  }

  /** Slowly drifting pitch lines behind the menu. */
  startBackdrop(canvas) {
    const ctx = canvas.getContext('2d');
    let t = 0;
    const draw = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const { width, height } = canvas;
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#173b24');
      gradient.addColorStop(1, '#0a1a10');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(1.4, 1.4);
      ctx.rotate(-0.12 + Math.sin(t * 0.0003) * 0.03);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 3;
      const pw = Math.max(width, 900) * 0.7;
      const ph = pw * 0.64;
      ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
      ctx.beginPath(); ctx.moveTo(0, -ph / 2); ctx.lineTo(0, ph / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, ph * 0.14, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(-pw / 2, -ph * 0.3, pw * 0.16, ph * 0.6);
      ctx.strokeRect(pw / 2 - pw * 0.16, -ph * 0.3, pw * 0.16, ph * 0.6);
      ctx.restore();

      // A ball rolling across the bottom.
      const bx = ((t * 0.08) % (width + 80)) - 40;
      const by = height * 0.9 + Math.sin(t * 0.004) * 4;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      for (let i = 0; i < 3; i++) {
        const a = t * 0.006 + (i * Math.PI * 2) / 3;
        ctx.beginPath(); ctx.arc(bx + Math.cos(a) * 4.5, by + Math.sin(a) * 4.5, 2.2, 0, Math.PI * 2); ctx.fill();
      }

      t += 16;
      this.animationId = requestAnimationFrame(draw);
    };
    draw();
  }

  cleanup() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
}
