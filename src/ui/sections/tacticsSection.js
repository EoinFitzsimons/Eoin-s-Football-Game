/**
 * TacticsSection - the manager's instructions for the next match.
 *
 * Everything chosen here is stored on GameState.tactics, saved with the career
 * and read by both the canvas match AI and the quick simulator.
 */

import { BaseSection } from './baseSection.js';
import { FORMATIONS, TACTIC_OPTIONS, describeTactics, formationSlots } from '../../tactics/tactics.js';
import { lineupForFormation, playerRating } from '../../league/matchSimulator.js';

export class TacticsSection extends BaseSection {
  getTitle() {
    return 'Tactics';
  }

  render(container) {
    const team = this.gameState.userTeam;
    const tactics = this.gameState.tactics;
    if (!team) {
      container.innerHTML = '<div class="error-message">Pick a club before setting tactics.</div>';
      return;
    }

    const section = document.createElement('div');
    section.className = 'management-section tactics-section';
    section.innerHTML = `
      <header class="management-header">
        <h1>Tactics</h1>
        <p>You do not move the players; your instructions do. Set the shape and style here and both the match on the pitch and the quick simulator will follow them. You can also change them from the dugout while a match is being played.</p>
      </header>
      <div class="management-grid">
        <section class="summary-card formation-card">
          <h2>Formation</h2>
          <div class="option-group" data-key="formation">
            ${Object.keys(FORMATIONS).map(f => `<button class="option-btn ${tactics.formation === f ? 'active' : ''}" data-key="formation" data-value="${f}">${f}</button>`).join('')}
          </div>
          <div class="pitch-diagram" id="tactics-pitch">${this.renderPitch(team, tactics.formation)}</div>
          <p class="card-note">The strongest available players fill the slots, keeper first; injured players sit out.</p>
        </section>

        <section class="summary-card">
          <h2>Style of play</h2>
          ${['mentality', 'tempo', 'pressing', 'width', 'passing'].map(key => this.renderOptionGroup(key, tactics[key])).join('')}
        </section>

        <section class="summary-card">
          <h2>Set pieces</h2>
          <label class="field-row">
            <span>Corner taker</span>
            <select id="set-piece-taker">
              <option value="">Best available</option>
              ${this.outfield(team).map(p => `<option value="${p.id}" ${tactics.setPieceTaker === p.id ? 'selected' : ''}>${p.name} (${p.position}) · corners ${Math.round(p.attributes?.corner ?? 50)}</option>`).join('')}
            </select>
          </label>
          <p class="card-note">The taker's set-piece attributes decide how accurately corners find a teammate in the box.</p>
          <h2 class="spaced">In a sentence</h2>
          <p class="tactics-summary" id="tactics-summary">${describeTactics(tactics)}</p>
          <p class="card-note">${this.explain(tactics)}</p>
        </section>
      </div>
    `;
    container.appendChild(section);
    this.setupEventListeners(section);
  }

  outfield(team) {
    return [...(team.players || [])].filter(p => p.position !== 'GK').sort((a, b) => (b.attributes?.corner ?? 0) - (a.attributes?.corner ?? 0));
  }

  renderOptionGroup(key, current) {
    const options = TACTIC_OPTIONS[key];
    const hint = options.find(o => o.value === current)?.hint || '';
    return `
      <div class="tactic-row">
        <div class="tactic-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
        <div class="option-group" data-key="${key}">
          ${options.map(o => `<button class="option-btn ${o.value === current ? 'active' : ''}" data-key="${key}" data-value="${o.value}" title="${o.hint}">${o.label}</button>`).join('')}
        </div>
        <div class="tactic-hint" data-hint="${key}">${hint}</div>
      </div>`;
  }

  renderPitch(team, formation) {
    const eleven = lineupForFormation(team, formation);
    return formationSlots(formation).map((slot, index) => {
      const player = eleven[index];
      const surname = player ? player.name.split(' ').slice(-1)[0] : '—';
      return `
        <div class="pitch-slot ${slot.role.toLowerCase()}" style="left:${slot.x * 100}%; top:${slot.y * 100}%">
          <span class="slot-dot">${player ? Math.round(playerRating(player)) : ''}</span>
          <span class="slot-name">${surname}</span>
        </div>`;
    }).join('');
  }

  explain(t) {
    const bits = [];
    bits.push(t.mentality === 'attacking' ? 'The back line pushes up and players shoot from further out, so expect more goals at both ends.'
      : t.mentality === 'defensive' ? 'The side sits deep and only shoots when the chance is clear; fewer goals at both ends.'
      : 'A balanced side attacks when the opening is there and holds its shape when it is not.');
    bits.push(t.pressing === 'high' ? 'Three players hunt the ball when it is lost.' : t.pressing === 'low' ? 'Only the nearest player closes the ball down.' : 'Two players press the ball.');
    bits.push(t.passing === 'direct' ? 'Passes go long and forward early.' : t.passing === 'short' ? 'Passes stay short and safe.' : 'Passing mixes short and long.');
    return bits.join(' ');
  }

  setupEventListeners(section) {
    section.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const { key, value } = btn.dataset;
        const tactics = this.gameState.setTactics({ [key]: value });
        section.querySelectorAll(`.option-btn[data-key="${key}"]`).forEach(b => b.classList.toggle('active', b.dataset.value === value));
        const hint = section.querySelector(`[data-hint="${key}"]`);
        if (hint) hint.textContent = TACTIC_OPTIONS[key]?.find(o => o.value === value)?.hint || '';
        if (key === 'formation') section.querySelector('#tactics-pitch').innerHTML = this.renderPitch(this.gameState.userTeam, value);
        section.querySelector('#tactics-summary').textContent = describeTactics(tactics);
        section.querySelector('#tactics-summary').nextElementSibling.textContent = this.explain(tactics);
      });
    });
    section.querySelector('#set-piece-taker')?.addEventListener('change', e => {
      this.gameState.setTactics({ setPieceTaker: e.target.value || null });
    });
  }
}
