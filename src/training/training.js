/**
 * Training between fixtures.
 *
 * Each match week the manager's chosen focus and intensity are applied to the
 * squad, nudging the attributes the focus covers upwards and letting neglected
 * areas drift for older players. The running total of every change is kept on
 * player.trainingDeltas so the squad screen can show what training has done.
 */

import { createSeededRandom } from '../utils/seededRandom.js';

export const TRAINING_FOCUSES = [
  { id: 'balanced', label: 'Balanced', description: 'A little of everything; steady, unspectacular gains across the squad.',
    attributes: ['passing', 'technique', 'tackling', 'positioning', 'stamina', 'finishing', 'composure', 'pace'] },
  { id: 'attacking', label: 'Attacking', description: 'Finishing drills and movement in the final third.',
    attributes: ['finishing', 'shotaccuracy', 'shotpower', 'composure', 'offball', 'movement', 'longshots', 'poaching'] },
  { id: 'possession', label: 'Possession', description: 'Passing patterns, first touch and vision.',
    attributes: ['passing', 'passingshort', 'passinglong', 'vision', 'firsttouch', 'technique', 'ballcontrol', 'throughball'] },
  { id: 'defending', label: 'Defending', description: 'Shape work, tackling and interceptions.',
    attributes: ['tackling', 'marking', 'positioning', 'interceptions', 'anticipationdef', 'strength', 'press', 'concentration'] },
  { id: 'physical', label: 'Physical', description: 'Sprints and conditioning: pace, acceleration and stamina.',
    attributes: ['pace', 'acceleration', 'stamina', 'agility', 'naturalfitness', 'sprint', 'burst', 'jumping'] },
  { id: 'setPieces', label: 'Set pieces', description: 'Corners, free kicks and penalties, plus attacking the ball in the air.',
    attributes: ['setpiece', 'corner', 'freekick', 'penalty', 'crossing', 'heading', 'aerialduel', 'curve'] },
  { id: 'goalkeeping', label: 'Goalkeeping', description: 'Keeper-specific work; outfield players barely benefit.',
    attributes: ['gkhandling', 'gkreflexes', 'gkpositioning', 'gkdiving', 'gkonevone', 'gkcommand', 'gkdistribution', 'gkaerial'] },
  { id: 'rest', label: 'Rest', description: 'No sessions: fatigue drops quickly, attributes stay where they are.', attributes: [] }
];

export const TRAINING_INTENSITIES = [
  { id: 'light', label: 'Light', gain: 0.6, fatigue: -6, injuryRisk: 0.002, description: 'Gentle sessions; players recover but improve slowly.' },
  { id: 'normal', label: 'Normal', gain: 1, fatigue: -2, injuryRisk: 0.006, description: 'The standard week.' },
  { id: 'intense', label: 'Intense', gain: 1.45, fatigue: 5, injuryRisk: 0.015, description: 'Bigger gains, but tired legs on match day and more knocks.' }
];

const PHYSICAL_KEYS = ['pace', 'acceleration', 'stamina', 'agility', 'sprint', 'burst', 'jumping'];
const AI_FOCUS = 'balanced';

export function defaultTraining() {
  return { focus: 'balanced', intensity: 'normal', individual: {} };
}

export function focusById(id) {
  return TRAINING_FOCUSES.find(f => f.id === id) || TRAINING_FOCUSES[0];
}

export function intensityById(id) {
  return TRAINING_INTENSITIES.find(i => i.id === id) || TRAINING_INTENSITIES[1];
}

export function normaliseTraining(input = {}) {
  const t = input && typeof input === 'object' ? input : {};
  const individual = {};
  if (t.individual && typeof t.individual === 'object') {
    for (const [playerId, focus] of Object.entries(t.individual)) {
      if (TRAINING_FOCUSES.some(f => f.id === focus)) individual[playerId] = focus;
    }
  }
  return { focus: focusById(t.focus).id, intensity: intensityById(t.intensity).id, individual };
}

/** Young players develop fastest; over 30 they hold or slip. */
function ageFactor(age) {
  if (age <= 21) return 1.4;
  if (age <= 25) return 1.15;
  if (age <= 29) return 0.9;
  if (age <= 32) return 0.55;
  return 0.35;
}

function recordDelta(player, key, delta) {
  const before = player.attributes[key];
  const after = Math.max(1, Math.min(99, before + delta));
  const applied = after - before;
  if (applied === 0) return 0;
  player.attributes[key] = after;
  if (!player.trainingDeltas) player.trainingDeltas = {};
  player.trainingDeltas[key] = (player.trainingDeltas[key] || 0) + applied;
  return applied;
}

/**
 * Apply one week of training to a team. Returns a report describing what
 * changed, with the biggest movers first.
 */
export function applyTrainingWeek(team, training, rng = Math.random, { week = 0 } = {}) {
  const plan = normaliseTraining(training);
  const intensity = intensityById(plan.intensity);
  const report = { week, focus: plan.focus, intensity: plan.intensity, players: [], injuries: [] };

  for (const player of team.players || []) {
    const focus = focusById(plan.individual[player.id] || plan.focus);
    const changes = {};
    const isKeeper = player.position === 'GK';

    if (focus.id !== 'rest') {
      let base = 0.45 * intensity.gain * ageFactor(player.age);
      if (player.hasTrait?.('ModelProfessional')) base *= 1.15;
      if (focus.id === 'goalkeeping' && !isKeeper) base *= 0.15;
      if (focus.id !== 'goalkeeping' && isKeeper) base *= 0.5;
      const bonusKey = focus.attributes[Math.floor(rng() * focus.attributes.length)];
      for (const key of focus.attributes) {
        if (!(key in player.attributes)) continue;
        const headroom = Math.max(0.2, (95 - player.attributes[key]) / 45);
        let delta = base * headroom * (0.7 + rng() * 0.6);
        if (key === bonusKey) delta *= 1.6;
        const applied = recordDelta(player, key, delta);
        if (applied) changes[key] = (changes[key] || 0) + applied;
      }
    }

    // Older legs lose a little of whatever is not being worked on.
    if (player.age >= 30) {
      for (const key of PHYSICAL_KEYS) {
        if (focus.attributes.includes(key) || !(key in player.attributes)) continue;
        const applied = recordDelta(player, key, -(0.08 + (player.age - 29) * 0.03) * (0.6 + rng() * 0.8));
        if (applied) changes[key] = (changes[key] || 0) + applied;
      }
    }

    player.fatigue = Math.max(0, Math.min(100, (player.fatigue || 0) + (focus.id === 'rest' ? -10 : intensity.fatigue)));

    if (!player.injured && focus.id !== 'rest' && rng() < intensity.injuryRisk * (player.hasTrait?.('InjuryProne') ? 2 : 1)) {
      player.injured = true;
      player.injuryDays = 5 + Math.floor(rng() * 14);
      report.injuries.push({ id: player.id, name: player.name, days: player.injuryDays });
    }

    const total = Object.values(changes).reduce((sum, d) => sum + d, 0);
    report.players.push({
      id: player.id,
      name: player.name,
      position: player.position,
      focus: focus.id,
      total,
      changes: Object.entries(changes).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([attribute, delta]) => ({ attribute, delta }))
    });
  }

  report.players.sort((a, b) => b.total - a.total);
  return report;
}

/**
 * Every other club trains too, so the user's squad does not run away from the
 * league. Seeded by round so a loaded save can replay it exactly.
 */
export function trainAiClubs(teams, userTeam, round, seed) {
  const rng = createSeededRandom(((seed >>> 0) ^ Math.imul(round + 1, 0x9E3779B1)) >>> 0);
  const plan = { focus: AI_FOCUS, intensity: 'normal', individual: {} };
  for (const team of teams) {
    if (team === userTeam) continue;
    applyTrainingWeek(team, plan, rng, { week: round });
  }
}

/** Sum of training changes to a player, for the squad screen. */
export function trainingSummary(player) {
  const deltas = player.trainingDeltas || {};
  const entries = Object.entries(deltas).filter(([, d]) => Math.abs(d) >= 0.05);
  const total = entries.reduce((sum, [, d]) => sum + d, 0);
  return {
    total,
    top: entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 3).map(([attribute, delta]) => ({ attribute, delta }))
  };
}

export const ATTRIBUTE_LABELS = {
  passing: 'Passing', passingshort: 'Short passing', passinglong: 'Long passing', technique: 'Technique', tackling: 'Tackling',
  positioning: 'Positioning', stamina: 'Stamina', finishing: 'Finishing', composure: 'Composure', pace: 'Pace',
  shotaccuracy: 'Shot accuracy', shotpower: 'Shot power', offball: 'Off the ball', movement: 'Movement', longshots: 'Long shots',
  poaching: 'Poaching', vision: 'Vision', firsttouch: 'First touch', ballcontrol: 'Ball control', throughball: 'Through balls',
  marking: 'Marking', interceptions: 'Interceptions', anticipationdef: 'Anticipation', strength: 'Strength', press: 'Pressing',
  concentration: 'Concentration', acceleration: 'Acceleration', agility: 'Agility', naturalfitness: 'Natural fitness', sprint: 'Sprinting',
  burst: 'Burst', jumping: 'Jumping', setpiece: 'Set pieces', corner: 'Corners', freekick: 'Free kicks', penalty: 'Penalties',
  crossing: 'Crossing', heading: 'Heading', aerialduel: 'Aerial duels', curve: 'Curve', gkhandling: 'Handling', gkreflexes: 'Reflexes',
  gkpositioning: 'GK positioning', gkdiving: 'Diving', gkonevone: 'One on ones', gkcommand: 'Command of area', gkdistribution: 'Distribution',
  gkaerial: 'Aerial reach'
};

export function attributeLabel(key) {
  return ATTRIBUTE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
}
