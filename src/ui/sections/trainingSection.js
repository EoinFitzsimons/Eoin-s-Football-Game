/**
 * TrainingSection - the weekly training plan and what it has done so far.
 *
 * The plan is applied by GameState.runTrainingWeek() after every match week,
 * so attributes move between fixtures and the report here shows the result.
 */

import { BaseSection } from './baseSection.js';
import { TRAINING_FOCUSES, TRAINING_INTENSITIES, focusById, trainingSummary, attributeLabel } from '../../training/training.js';
import { playerRating } from '../../league/matchSimulator.js';

export class TrainingSection extends BaseSection {
  getTitle() {
    return 'Training';
  }

  render(container) {
    const team = this.gameState.userTeam;
    const training = this.gameState.training;
    if (!team) {
      container.innerHTML = '<div class="error-message">Pick a club before planning training.</div>';
      return;
    }

    const section = document.createElement('div');
    section.className = 'management-section training-section';
    section.innerHTML = `
      <header class="management-header">
        <h1>Training</h1>
        <p>Training runs after every match week. The focus decides which attributes improve, the intensity how quickly and at what cost; younger players gain most, and players over thirty slowly lose the physical attributes they are not working on. Changes feed straight into the match AI and the quick simulator.</p>
      </header>
      <div class="management-grid">
        <section class="summary-card">
          <h2>Team focus</h2>
          <div class="focus-grid">
            ${TRAINING_FOCUSES.map(f => `
              <button class="focus-btn ${training.focus === f.id ? 'active' : ''}" data-focus="${f.id}">
                <strong>${f.label}</strong>
                <span>${f.description}</span>
              </button>`).join('')}
          </div>
          <h2 class="spaced">Intensity</h2>
          <div class="option-group" data-key="intensity">
            ${TRAINING_INTENSITIES.map(i => `<button class="option-btn ${training.intensity === i.id ? 'active' : ''}" data-intensity="${i.id}" title="${i.description}">${i.label}</button>`).join('')}
          </div>
          <p class="card-note" id="intensity-hint">${TRAINING_INTENSITIES.find(i => i.id === training.intensity)?.description || ''}</p>
        </section>

        <section class="summary-card">
          <h2>Last week's report</h2>
          ${this.renderReport(this.gameState.lastTrainingReport)}
        </section>

        <section class="summary-card wide">
          <h2>Individual focus and progress</h2>
          <p class="card-note">Give a player his own programme, or leave him on the team plan. The change column is the total movement from training since you took charge.</p>
          <div class="table-scroll">
            <table class="training-table">
              <thead><tr><th>Player</th><th>Pos</th><th>Age</th><th>Rating</th><th>Change</th><th>Biggest gains</th><th>Focus</th></tr></thead>
              <tbody>
                ${[...team.players].sort((a, b) => playerRating(b) - playerRating(a)).map(p => this.renderPlayerRow(p, training)).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
    container.appendChild(section);
    this.setupEventListeners(section);
  }

  renderReport(report) {
    if (!report) return '<p class="card-note">No training week has been completed yet. Play or simulate a fixture and the first report appears here.</p>';
    const focus = focusById(report.focus);
    const movers = report.players.filter(p => Math.abs(p.total) >= 0.05).slice(0, 8);
    return `
      <p class="card-note">Week ${report.week}: ${focus.label} focus, ${report.intensity} intensity.</p>
      <ul class="report-list">
        ${movers.map(p => `
          <li>
            <span class="report-name">${p.name} <small>${p.position}</small></span>
            <span class="delta ${p.total >= 0 ? 'up' : 'down'}">${formatDelta(p.total)}</span>
            <span class="report-detail">${p.changes.slice(0, 3).map(c => `${attributeLabel(c.attribute)} ${formatDelta(c.delta)}`).join(', ')}</span>
          </li>`).join('')}
      </ul>
      ${report.injuries.length ? `<p class="card-note injury-note">Injured in training: ${report.injuries.map(i => `${i.name} (${i.days} days)`).join(', ')}.</p>` : ''}
    `;
  }

  renderPlayerRow(player, training) {
    const summary = trainingSummary(player);
    const own = training.individual[player.id] || 'team';
    return `
      <tr>
        <td>${player.name}${player.injured ? ' <span title="Injured">🏥</span>' : ''}</td>
        <td>${player.position}</td>
        <td>${player.age}</td>
        <td>${Math.round(playerRating(player))}</td>
        <td class="delta ${summary.total > 0.05 ? 'up' : summary.total < -0.05 ? 'down' : ''}">${Math.abs(summary.total) < 0.05 ? '—' : formatDelta(summary.total)}</td>
        <td class="gains">${summary.top.map(t => `${attributeLabel(t.attribute)} ${formatDelta(t.delta)}`).join(', ') || '—'}</td>
        <td>
          <select class="individual-focus" data-player-id="${player.id}">
            <option value="team" ${own === 'team' ? 'selected' : ''}>Team plan</option>
            ${TRAINING_FOCUSES.map(f => `<option value="${f.id}" ${own === f.id ? 'selected' : ''}>${f.label}</option>`).join('')}
          </select>
        </td>
      </tr>`;
  }

  setupEventListeners(section) {
    section.querySelectorAll('.focus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.gameState.setTraining({ focus: btn.dataset.focus });
        section.querySelectorAll('.focus-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    section.querySelectorAll('[data-intensity]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.gameState.setTraining({ intensity: btn.dataset.intensity });
        section.querySelectorAll('[data-intensity]').forEach(b => b.classList.toggle('active', b === btn));
        section.querySelector('#intensity-hint').textContent = TRAINING_INTENSITIES.find(i => i.id === btn.dataset.intensity)?.description || '';
      });
    });
    section.querySelectorAll('.individual-focus').forEach(select => {
      select.addEventListener('change', () => this.gameState.setIndividualTraining(select.dataset.playerId, select.value));
    });
  }
}

function formatDelta(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
}
