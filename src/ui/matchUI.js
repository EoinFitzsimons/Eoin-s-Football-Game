/**
 * MatchUI - the full-screen playable match: canvas, controls and commentary.
 */
import { MatchEngine } from '../match/matchEngine.js';
import { Soundscape } from '../audio/soundscape.js';
import { updateSettings } from '../settings.js';

export class MatchUI {
  constructor(gameState, fixture) {
    this.gameState = gameState;
    this.fixture = fixture;
    this.engine = null;
    this.sound = new Soundscape(gameState.settings.soundEnabled);
    this.events = [];
    this.finished = false;
    this.onResize = () => this.engine?.resize();
    this.onKeyUp = e => this.engine?.keyUp(e.key);
  }

  render(container) {
    const { homeTeam, awayTeam } = this.fixture;
    const userIsHome = homeTeam === this.gameState.userTeam;
    container.innerHTML = `
      <div class="match-screen">
        <header class="match-header">
          <div class="match-title">
            <span class="match-competition">${this.gameState.league?.name || 'League'} · Round ${this.fixture.round}</span>
            <h2>${homeTeam.name} <span class="match-v">v</span> ${awayTeam.name}</h2>
            <span class="match-you">You manage ${this.gameState.userTeam.name} (${userIsHome ? 'home' : 'away'})</span>
          </div>
          <div class="match-toolbar">
            <button id="match-pause" class="match-tool-btn" title="Pause (P)">Pause</button>
            <button id="match-mute" class="match-tool-btn" aria-pressed="${!this.sound.enabled}" title="Mute (M)">${this.sound.enabled ? 'Sound on' : 'Muted'}</button>
            <button id="match-quit" class="match-tool-btn danger" title="Abandon and simulate the result">Abandon</button>
          </div>
        </header>
        <div class="match-stage">
          <canvas id="match-canvas" aria-label="Match pitch"></canvas>
        </div>
        <div class="match-lower">
          <div class="match-controls-card">
            <h3>Controls</h3>
            <ul class="controls-list">
              <li><kbd>Arrows</kbd> / <kbd>WASD</kbd> move the highlighted player</li>
              <li><kbd>Space</kbd> shoot (aim with the arrows) or tackle a loose ball</li>
              <li><kbd>Shift</kbd> / <kbd>X</kbd> pass to the teammate you are facing</li>
              <li><kbd>Ctrl</kbd> / <kbd>C</kbd> sprint &nbsp; <kbd>Q</kbd> switch player &nbsp; <kbd>P</kbd> pause &nbsp; <kbd>M</kbd> mute</li>
            </ul>
            <p class="controls-note">Two halves of ${this.gameState.settings.halfLengthMinutes} real minutes each. Your nearest player is picked automatically when the other side has the ball.</p>
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
      canvas,
      soundscape: this.sound,
      halfLengthMinutes: this.gameState.settings.halfLengthMinutes,
      difficulty: this.gameState.settings.difficulty,
      onEvent: (type, payload) => this.handleEvent(type, payload)
    });

    container.querySelector('#match-pause').addEventListener('click', () => this.togglePause());
    container.querySelector('#match-mute').addEventListener('click', () => this.toggleMute());
    container.querySelector('#match-quit').addEventListener('click', () => this.abandon());
    window.addEventListener('resize', this.onResize);
    document.addEventListener('keyup', this.onKeyUp);

    this.engine.start();
  }

  handleEvent(type, payload) {
    const names = { home: this.fixture.homeTeam.name, away: this.fixture.awayTeam.name };
    const line = {
      kickoff: () => 'Kick-off! The referee gets us under way.',
      shot: () => `${payload.minute}' Shot from ${payload.player} (${names[payload.side]}).`,
      save: () => `${payload.minute}' Fine save by ${payload.keeper}.`,
      goal: () => `${payload.minute}' GOAL! ${payload.player} scores for ${names[payload.side]}. ${payload.score.home}-${payload.score.away}.`,
      halfTime: () => `Half time: ${names.home} ${payload.score.home}-${payload.score.away} ${names.away}.`,
      secondHalf: () => 'The second half is under way.',
      fullTime: () => `Full time: ${names.home} ${payload.score.home}-${payload.score.away} ${names.away}.`,
      pause: () => (payload.paused ? 'Match paused.' : 'Play resumes.')
    }[type];
    if (line) this.addCommentary(line());
    if (type === 'fullTime') this.finish(payload.result);
    if (type === 'pause') {
      const button = document.getElementById('match-pause');
      if (button) button.textContent = payload.paused ? 'Resume' : 'Pause';
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
    if (e.key === 'Enter' && this.finished) { document.getElementById('match-continue')?.click(); return; }
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Shift'].includes(e.key)) e.preventDefault();
    this.engine.keyDown(e.key);
  }

  cleanup() {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('keyup', this.onKeyUp);
    this.engine?.stop();
    this.engine = null;
  }
}
