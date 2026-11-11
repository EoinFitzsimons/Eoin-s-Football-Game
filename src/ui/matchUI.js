/**
 * MatchUI - the full-screen watched match: canvas, dugout tactics and commentary.
 *
 * The user never moves a player. The toolbar offers pause, playback speed, a
 * skip to full time and mute; the dugout card lets the manager change tactics
 * while the match is running, and the engine reads them immediately.
 */
import { MatchEngine } from '../match/matchEngine.js';
import { Soundscape } from '../audio/soundscape.js';
import { updateSettings } from '../settings.js';
import { FORMATIONS, TACTIC_OPTIONS, describeTactics } from '../tactics/tactics.js';

const SPEEDS = [1, 2, 4];

export class MatchUI {
  constructor(gameState, fixture) {
    this.gameState = gameState;
    this.fixture = fixture;
    this.engine = null;
    this.sound = new Soundscape(gameState.settings.soundEnabled);
    this.events = [];
    this.finished = false;
    this.onResize = () => this.engine?.resize();
  }

  render(container) {
    const { homeTeam, awayTeam } = this.fixture;
    const userIsHome = homeTeam === this.gameState.userTeam;
    const userSide = userIsHome ? 'home' : 'away';
    const opponent = userIsHome ? awayTeam : homeTeam;
    const tactics = this.gameState.tactics;
    const opponentTactics = this.gameState.tacticsForTeam(opponent);

    container.innerHTML = `
      <div class="match-screen">
        <header class="match-header">
          <div class="match-title">
            <span class="match-competition">${this.gameState.league?.name || 'League'} · Round ${this.fixture.round}</span>
            <h2>${homeTeam.name} <span class="match-v">v</span> ${awayTeam.name}</h2>
            <span class="match-you">You manage ${this.gameState.userTeam.name} (${userIsHome ? 'home' : 'away'}) · both sides are AI-controlled</span>
          </div>
          <div class="match-toolbar">
            <button id="match-pause" class="match-tool-btn" title="Pause (P)">Pause</button>
            <div class="speed-group" role="group" aria-label="Playback speed">
              ${SPEEDS.map(s => `<button class="match-tool-btn speed-btn ${s === 1 ? 'active' : ''}" data-speed="${s}" title="Play at ${s}× speed">${s}×</button>`).join('')}
            </div>
            <button id="match-skip" class="match-tool-btn" title="Skip to full time">Skip to FT</button>
            <button id="match-mute" class="match-tool-btn" aria-pressed="${!this.sound.enabled}" title="Mute (M)">${this.sound.enabled ? 'Sound on' : 'Muted'}</button>
            <button id="match-quit" class="match-tool-btn danger" title="Abandon and simulate the result">Abandon</button>
          </div>
        </header>
        <div class="match-stage">
          <canvas id="match-canvas" aria-label="Match pitch"></canvas>
        </div>
        <div class="match-lower">
          <div class="match-controls-card dugout-card">
            <h3>Dugout</h3>
            <p class="controls-note">Change your instructions and the players adjust straight away. The opposition (${opponent.name}) are playing ${describeTactics(opponentTactics)}.</p>
            <div class="dugout-grid">
              ${this.renderSelect('formation', 'Formation', Object.keys(FORMATIONS).map(f => ({ value: f, label: f })), tactics.formation)}
              ${['mentality', 'tempo', 'pressing', 'width', 'passing'].map(key => this.renderSelect(key, key.charAt(0).toUpperCase() + key.slice(1), TACTIC_OPTIONS[key], tactics[key])).join('')}
            </div>
            <p class="controls-note">Two halves of ${this.gameState.settings.halfLengthMinutes} real minute${this.gameState.settings.halfLengthMinutes === 1 ? '' : 's'} each. <kbd>P</kbd> pause &nbsp; <kbd>M</kbd> mute.</p>
          </div>
          <div class="match-events-card">
            <h3>Commentary</h3>
            <ul id="match-events" class="match-events"></ul>
          </div>
        </div>
        <div id="match-result" class="match-result hidden"></div>
      </div>
    `;

    const canvas = container.querySelector('#match-canvas');
    this.engine = new MatchEngine({
      homeTeam,
      awayTeam,
      userTeam: this.gameState.userTeam,
      homeTactics: this.gameState.tacticsForTeam(homeTeam),
      awayTactics: this.gameState.tacticsForTeam(awayTeam),
      canvas,
      soundscape: this.sound,
      halfLengthMinutes: this.gameState.settings.halfLengthMinutes,
      difficulty: this.gameState.settings.difficulty,
      onEvent: (type, payload) => this.handleEvent(type, payload)
    });
    this.userSide = userSide;

    container.querySelector('#match-pause').addEventListener('click', () => this.togglePause());
    container.querySelector('#match-mute').addEventListener('click', () => this.toggleMute());
    container.querySelector('#match-skip').addEventListener('click', () => this.skipToEnd());
    container.querySelector('#match-quit').addEventListener('click', () => this.abandon());
    container.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setSpeed(Number(btn.dataset.speed)));
    });
    container.querySelectorAll('.dugout-select').forEach(select => {
      select.addEventListener('change', () => {
        const next = this.gameState.setTactics({ [select.dataset.key]: select.value });
        this.engine?.setTactics(this.userSide, next);
      });
    });
    window.addEventListener('resize', this.onResize);

    this.engine.start();
  }

  renderSelect(key, label, options, current) {
    return `
      <label class="dugout-field">
        <span>${label}</span>
        <select class="dugout-select" data-key="${key}">
          ${options.map(o => `<option value="${o.value}" ${o.value === current ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
      </label>`;
  }

  handleEvent(type, payload) {
    const names = { home: this.fixture.homeTeam.name, away: this.fixture.awayTeam.name };
    const line = {
      kickoff: () => 'Kick-off! The referee gets us under way.',
      shot: () => `${payload.minute}' Shot from ${payload.player} (${names[payload.side]}).`,
      save: () => `${payload.minute}' Fine save by ${payload.keeper}.`,
      corner: () => `${payload.minute}' ${payload.player} swings the corner in for ${names[payload.side]}.`,
      goal: () => `${payload.minute}' GOAL! ${payload.player} scores for ${names[payload.side]}. ${payload.score.home}-${payload.score.away}.`,
      halfTime: () => `Half time: ${names.home} ${payload.score.home}-${payload.score.away} ${names.away}.`,
      secondHalf: () => 'The second half is under way.',
      fullTime: () => `Full time: ${names.home} ${payload.score.home}-${payload.score.away} ${names.away}.`,
      pause: () => (payload.paused ? 'Match paused.' : 'Play resumes.'),
      tactics: () => `${names[payload.side]} switch to ${payload.summary}.`,
      speed: () => (payload.speed === 1 ? 'Back to normal speed.' : `Playing at ${payload.speed}× speed.`)
    }[type];
    if (line) this.addCommentary(line());
    if (type === 'fullTime') this.finish(payload.result);
    if (type === 'pause') {
      const button = document.getElementById('match-pause');
      if (button) button.textContent = payload.paused ? 'Resume' : 'Pause';
    }
    if (type === 'speed') {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.speed) === payload.speed));
    }
  }

  addCommentary(text) {
    this.events.unshift(text);
    this.events = this.events.slice(0, 12);
    const list = document.getElementById('match-events');
    if (list) list.innerHTML = this.events.map(e => `<li>${e}</li>`).join('');
  }

  togglePause() {
    this.engine?.togglePause();
  }

  setSpeed(speed) {
    this.engine?.setSpeed(speed);
  }

  skipToEnd() {
    if (this.finished || !this.engine) return;
    this.engine.skipToEnd();
  }

  toggleMute() {
    const enabled = !this.sound.enabled;
    this.sound.setEnabled(enabled);
    if (enabled) this.sound.startCrowd();
    this.gameState.settings = updateSettings({ soundEnabled: enabled });
    const button = document.getElementById('match-mute');
    if (button) {
      button.textContent = enabled ? 'Sound on' : 'Muted';
      button.setAttribute('aria-pressed', String(!enabled));
    }
  }

  abandon() {
    if (this.finished) return;
    if (!window.confirm('Abandon the match? The result will be simulated instead.')) return;
    this.engine?.stop();
    this.finished = true;
    this.gameState.startMatch(this.fixture.id, 'simulate');
  }

  finish(result) {
    if (this.finished) return;
    this.finished = true;
    const { homeTeam, awayTeam } = this.fixture;
    const panel = document.getElementById('match-result');
    const scorerList = (scorers, side) => scorers.length
      ? `<ul class="scorer-list ${side}">${scorers.map(s => `<li>${s.player} ${s.minute}'</li>`).join('')}</ul>`
      : '<p class="no-scorers">No goals</p>';
    panel.innerHTML = `
      <div class="match-result-card">
        <p class="result-label">Full time</p>
        <h2>${homeTeam.name} <span class="result-score">${result.homeScore} - ${result.awayScore}</span> ${awayTeam.name}</h2>
        <div class="result-columns">
          <div>${scorerList(result.homeScorers, 'home')}</div>
          <div class="result-stats">
            <p><span>${result.shots.home}</span> Shots <span>${result.shots.away}</span></p>
            <p><span>${result.possession.home}%</span> Possession <span>${result.possession.away}%</span></p>
          </div>
          <div>${scorerList(result.awayScorers, 'away')}</div>
        </div>
        <p class="result-tactics">You played ${describeTactics(this.gameState.tactics)}. Training runs this week before the next fixture.</p>
        <button id="match-continue" class="primary-btn">Continue</button>
      </div>
    `;
    panel.classList.remove('hidden');
    panel.querySelector('#match-continue').addEventListener('click', () => {
      this.sound.click();
      this.engine?.stop();
      this.gameState.completeMatch(this.fixture, result);
    });
  }

  handleKeyboard(e) {
    if (!this.engine) return;
    if (e.key === 'p' || e.key === 'P') { this.togglePause(); return; }
    if (e.key === 'm' || e.key === 'M') { this.toggleMute(); return; }
    if (e.key === 'Enter' && this.finished) document.getElementById('match-continue')?.click();
  }

  cleanup() {
    window.removeEventListener('resize', this.onResize);
    this.engine?.stop();
    this.engine = null;
  }
}
