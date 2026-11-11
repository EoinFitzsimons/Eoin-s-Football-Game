/**
 * SeasonSummarySection - end-of-season review with the final table, the
 * club's record, notable results and top scorers.
 */
import { BaseSection } from './baseSection.js';

export class SeasonSummarySection extends BaseSection {
  constructor(gameState) {
    super(gameState);
    this.sectionId = 'season-summary';
    this.title = 'Season Summary';
  }

  getTitle() {
    return this.title;
  }

  render(container) {
    const summary = this.gameState.lastSeasonSummary;
    const wrapper = document.createElement('div');
    wrapper.className = 'season-summary-section';

    if (!summary) {
      wrapper.innerHTML = `
        <div class="summary-card">
          <h1>Season Summary</h1>
          <p>The season is still in progress. Play or simulate the remaining fixtures to see the review.</p>
          <button id="summary-back" class="primary-btn">Back to dashboard</button>
        </div>`;
      wrapper.querySelector('#summary-back').addEventListener('click', () => window.gameUI.showSection('dashboard'));
      container.appendChild(wrapper);
      return;
    }

    const r = summary.record;
    const ordinal = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
    wrapper.innerHTML = `
      <div class="summary-hero verdict-${summary.verdict.toLowerCase().replace(/\s+/g, '-')}">
        <p class="summary-season">${summary.season}/${String(summary.season + 1).slice(-2)} · ${summary.leagueName}</p>
        <h1>${summary.teamName}</h1>
        <p class="summary-position">${ordinal(summary.position)} of ${summary.teams}</p>
        <p class="summary-verdict">${summary.verdict}</p>
        ${summary.position !== 1 ? `<p class="summary-champion">Champions: ${summary.champion}</p>` : ''}
      </div>

      <div class="summary-grid">
        <section class="summary-card">
          <h2>Record</h2>
          <div class="record-row">
            <div><span>${r.played}</span>Played</div>
            <div><span>${r.won}</span>Won</div>
            <div><span>${r.drawn}</span>Drawn</div>
            <div><span>${r.lost}</span>Lost</div>
            <div><span>${r.goalsFor}</span>For</div>
            <div><span>${r.goalsAgainst}</span>Against</div>
            <div><span>${r.points}</span>Points</div>
          </div>
          <dl class="summary-facts">
            <dt>Biggest win</dt><dd>${summary.biggestWin || '—'}</dd>
            <dt>Heaviest defeat</dt><dd>${summary.heaviestDefeat || '—'}</dd>
            <dt>Matches watched on the pitch</dt><dd>${summary.watched}</dd>
            <dt>Matches simulated</dt><dd>${summary.simulated}</dd>
          </dl>
        </section>

        <section class="summary-card">
          <h2>Top scorers</h2>
          ${summary.topScorers.length ? `
            <ol class="scorers">
              ${summary.topScorers.map(p => `<li><span class="scorer-name">${p.name}</span><span class="scorer-pos">${p.position}</span><span class="scorer-goals">${p.goals}</span></li>`).join('')}
            </ol>` : '<p>No goals were recorded this season.</p>'}
        </section>

        <section class="summary-card summary-table">
          <h2>Final table</h2>
          <table>
            <thead><tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
            <tbody>
              ${summary.standings.map(t => `
                <tr class="${t.isUser ? 'user-row' : ''}">
                  <td>${t.position}</td><td>${t.name}</td><td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td>
                  <td>${t.goalsFor - t.goalsAgainst > 0 ? '+' : ''}${t.goalsFor - t.goalsAgainst}</td><td><strong>${t.points}</strong></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </section>
      </div>

      <div class="summary-actions">
        <button id="summary-new-season" class="primary-btn">Start season ${summary.season + 1}/${String(summary.season + 2).slice(-2)}</button>
        <button id="summary-dashboard" class="secondary-btn">Back to dashboard</button>
      </div>
    `;

    wrapper.querySelector('#summary-new-season').addEventListener('click', () => {
      this.gameState.startNewSeason();
      window.gameUI.showSection('dashboard');
    });
    wrapper.querySelector('#summary-dashboard').addEventListener('click', () => window.gameUI.showSection('dashboard'));
    container.appendChild(wrapper);
  }
}
