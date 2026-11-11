/**
 * Team tactics: the levers the manager pulls instead of moving players.
 *
 * A tactics object is plain data so it can be saved with the career. The match
 * engine turns it into numeric modifiers with tacticModifiers(), the quick
 * simulator uses tacticsEffect(), and the HUD shows describeTactics().
 */

export const FORMATIONS = {
  '4-4-2': [
    { role: 'GK', x: 0.06, y: 0.5 },
    { role: 'DEF', x: 0.22, y: 0.15 }, { role: 'DEF', x: 0.2, y: 0.38 }, { role: 'DEF', x: 0.2, y: 0.62 }, { role: 'DEF', x: 0.22, y: 0.85 },
    { role: 'MID', x: 0.45, y: 0.15 }, { role: 'MID', x: 0.42, y: 0.4 }, { role: 'MID', x: 0.42, y: 0.6 }, { role: 'MID', x: 0.45, y: 0.85 },
    { role: 'FWD', x: 0.66, y: 0.4 }, { role: 'FWD', x: 0.66, y: 0.6 }
  ],
  '4-3-3': [
    { role: 'GK', x: 0.06, y: 0.5 },
    { role: 'DEF', x: 0.22, y: 0.15 }, { role: 'DEF', x: 0.2, y: 0.38 }, { role: 'DEF', x: 0.2, y: 0.62 }, { role: 'DEF', x: 0.22, y: 0.85 },
    { role: 'MID', x: 0.4, y: 0.5 }, { role: 'MID', x: 0.46, y: 0.3 }, { role: 'MID', x: 0.46, y: 0.7 },
    { role: 'FWD', x: 0.64, y: 0.18 }, { role: 'FWD', x: 0.7, y: 0.5 }, { role: 'FWD', x: 0.64, y: 0.82 }
  ],
  '4-2-3-1': [
    { role: 'GK', x: 0.06, y: 0.5 },
    { role: 'DEF', x: 0.22, y: 0.15 }, { role: 'DEF', x: 0.2, y: 0.38 }, { role: 'DEF', x: 0.2, y: 0.62 }, { role: 'DEF', x: 0.22, y: 0.85 },
    { role: 'MID', x: 0.38, y: 0.38 }, { role: 'MID', x: 0.38, y: 0.62 },
    { role: 'MID', x: 0.54, y: 0.18 }, { role: 'MID', x: 0.54, y: 0.5 }, { role: 'MID', x: 0.54, y: 0.82 },
    { role: 'FWD', x: 0.7, y: 0.5 }
  ],
  '3-5-2': [
    { role: 'GK', x: 0.06, y: 0.5 },
    { role: 'DEF', x: 0.2, y: 0.28 }, { role: 'DEF', x: 0.18, y: 0.5 }, { role: 'DEF', x: 0.2, y: 0.72 },
    { role: 'MID', x: 0.44, y: 0.1 }, { role: 'MID', x: 0.4, y: 0.35 }, { role: 'MID', x: 0.38, y: 0.5 }, { role: 'MID', x: 0.4, y: 0.65 }, { role: 'MID', x: 0.44, y: 0.9 },
    { role: 'FWD', x: 0.66, y: 0.4 }, { role: 'FWD', x: 0.66, y: 0.6 }
  ],
  '5-3-2': [
    { role: 'GK', x: 0.06, y: 0.5 },
    { role: 'DEF', x: 0.26, y: 0.1 }, { role: 'DEF', x: 0.2, y: 0.3 }, { role: 'DEF', x: 0.18, y: 0.5 }, { role: 'DEF', x: 0.2, y: 0.7 }, { role: 'DEF', x: 0.26, y: 0.9 },
    { role: 'MID', x: 0.44, y: 0.3 }, { role: 'MID', x: 0.42, y: 0.5 }, { role: 'MID', x: 0.44, y: 0.7 },
    { role: 'FWD', x: 0.66, y: 0.4 }, { role: 'FWD', x: 0.66, y: 0.6 }
  ]
};

export const TACTIC_OPTIONS = {
  mentality: [
    { value: 'defensive', label: 'Defensive', hint: 'Sit deep, keep it tight and shoot only when the chance is clear.' },
    { value: 'balanced', label: 'Balanced', hint: 'Sensible risk: attack when the opening is there, keep shape when it is not.' },
    { value: 'attacking', label: 'Attacking', hint: 'Push the back line up, commit runners forward and shoot on sight.' }
  ],
  tempo: [
    { value: 'slow', label: 'Slow', hint: 'Patient build-up: players take longer on the ball before choosing a pass.' },
    { value: 'normal', label: 'Normal', hint: 'Standard rhythm.' },
    { value: 'fast', label: 'Fast', hint: 'Quick decisions and early passes; more turnovers both ways.' }
  ],
  pressing: [
    { value: 'low', label: 'Low block', hint: 'Only the nearest player closes the ball down; the rest hold position.' },
    { value: 'medium', label: 'Medium', hint: 'Two players press the ball; the shape shifts towards it.' },
    { value: 'high', label: 'High press', hint: 'Three players hunt the ball and the whole side squeezes up the pitch.' }
  ],
  width: [
    { value: 'narrow', label: 'Narrow', hint: 'Compact through the middle; harder to play through, easier to go around.' },
    { value: 'normal', label: 'Normal', hint: 'Standard spacing.' },
    { value: 'wide', label: 'Wide', hint: 'Stretch the pitch; more room on the flanks but bigger gaps between players.' }
  ],
  passing: [
    { value: 'short', label: 'Short', hint: 'Keep the ball with safe passes to nearby teammates.' },
    { value: 'mixed', label: 'Mixed', hint: 'Short or long depending on what is on.' },
    { value: 'direct', label: 'Direct', hint: 'Look for the forward option early, even over distance.' }
  ]
};

export const DEFAULT_TACTICS = Object.freeze({
  formation: '4-3-3',
  mentality: 'balanced',
  tempo: 'normal',
  pressing: 'medium',
  width: 'normal',
  passing: 'mixed',
  setPieceTaker: null
});

function pick(options, value, fallback) {
  return options.some(o => o.value === value) ? value : fallback;
}

/** Fill gaps and reject unknown values so old or partial saves always yield a usable object. */
export function normaliseTactics(input = {}) {
  const t = input && typeof input === 'object' ? input : {};
  return {
    formation: FORMATIONS[t.formation] ? t.formation : DEFAULT_TACTICS.formation,
    mentality: pick(TACTIC_OPTIONS.mentality, t.mentality, DEFAULT_TACTICS.mentality),
    tempo: pick(TACTIC_OPTIONS.tempo, t.tempo, DEFAULT_TACTICS.tempo),
    pressing: pick(TACTIC_OPTIONS.pressing, t.pressing, DEFAULT_TACTICS.pressing),
    width: pick(TACTIC_OPTIONS.width, t.width, DEFAULT_TACTICS.width),
    passing: pick(TACTIC_OPTIONS.passing, t.passing, DEFAULT_TACTICS.passing),
    setPieceTaker: typeof t.setPieceTaker === 'string' ? t.setPieceTaker : null
  };
}

export function formationSlots(formation) {
  return FORMATIONS[formation] || FORMATIONS[DEFAULT_TACTICS.formation];
}

export function formationRoleCounts(formation) {
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  formationSlots(formation).forEach(slot => { counts[slot.role]++; });
  return counts;
}

/**
 * Numeric knobs the match engine reads every frame. Everything is relative to a
 * "balanced" side so the values are easy to tune in one place.
 */
export function tacticModifiers(tactics) {
  const t = normaliseTactics(tactics);
  const mentality = { defensive: -1, balanced: 0, attacking: 1 }[t.mentality];
  const tempo = { slow: -1, normal: 0, fast: 1 }[t.tempo];
  const pressing = { low: -1, medium: 0, high: 1 }[t.pressing];
  const width = { narrow: -1, normal: 0, wide: 1 }[t.width];
  const passing = { short: -1, mixed: 0, direct: 1 }[t.passing];

  return {
    // fraction of pitch length the whole shape is pushed towards the opponent's goal
    lineShift: mentality * 0.05 + pressing * 0.02,
    // how far the shape follows the ball up and down the pitch (0.3 = balanced)
    ballFollow: 0.3 + pressing * 0.08 + mentality * 0.03,
    // multiplier on the lateral spread of the formation
    widthScale: 1 + width * 0.18,
    // outfield players who actively chase the ball when the other side has it
    pressers: 2 + pressing,
    // metres from the ball inside which a presser commits to a tackle run
    pressDistance: 22 + pressing * 8,
    // seconds a player holds the ball before re-deciding
    decisionTime: 0.3 - tempo * 0.1,
    // chance per decision to release the ball rather than carry it
    passUrge: 0.08 + tempo * 0.04 + passing * 0.02,
    // furthest pass a player will attempt
    passRange: 42 + passing * 12,
    // weighting of forward progress when choosing a pass target
    progressWeight: 1 + passing * 0.5,
    // how willing players are to shoot: added to the chance threshold
    shootBias: mentality * 0.1,
    // extra metres from goal that count as shooting range
    shootRange: 2 + mentality * 3 + (passing === 1 ? 1 : 0),
    // how far forward midfield/forwards run to support an attack
    supportRun: 1 + mentality * 0.35,
    // chance (per frame-ish decision) for a defender to join the attack
    defenderOverlap: mentality > 0 ? 0.25 : mentality < 0 ? 0 : 0.1
  };
}

const LABELS = {
  mentality: { defensive: 'Defensive', balanced: 'Balanced', attacking: 'Attacking' },
  tempo: { slow: 'Slow tempo', normal: 'Normal tempo', fast: 'Fast tempo' },
  pressing: { low: 'Low block', medium: 'Medium press', high: 'High press' },
  width: { narrow: 'Narrow', normal: 'Normal width', wide: 'Wide' },
  passing: { short: 'Short passing', mixed: 'Mixed passing', direct: 'Direct passing' }
};

export function describeTactics(tactics, { short = false } = {}) {
  const t = normaliseTactics(tactics);
  if (short) return `${t.formation} · ${LABELS.mentality[t.mentality]} · ${LABELS.pressing[t.pressing]}`;
  return [t.formation, LABELS.mentality[t.mentality], LABELS.tempo[t.tempo], LABELS.pressing[t.pressing], LABELS.width[t.width], LABELS.passing[t.passing]].join(' · ');
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Every AI club gets a stable style of its own, derived from its name, so the
 * opposition varies from week to week without needing to be saved.
 */
export function aiTacticsFor(team) {
  const h = hashString(team?.name || 'club');
  const formations = Object.keys(FORMATIONS);
  const choose = (options, shift) => options[(h >>> shift) % options.length].value;
  return normaliseTactics({
    formation: formations[h % formations.length],
    mentality: choose(TACTIC_OPTIONS.mentality, 3),
    tempo: choose(TACTIC_OPTIONS.tempo, 7),
    pressing: choose(TACTIC_OPTIONS.pressing, 11),
    width: choose(TACTIC_OPTIONS.width, 15),
    passing: choose(TACTIC_OPTIONS.passing, 19)
  });
}

/**
 * Multipliers for the quick simulator's expected goals, mirroring what the
 * same settings do in the canvas engine: attacking sides create and concede
 * more, defensive sides less, a high press trades energy for turnovers, and
 * width/passing interact with the opponent's shape.
 */
export function tacticsEffect(tactics, opponentTactics) {
  const t = normaliseTactics(tactics);
  const o = normaliseTactics(opponentTactics);
  let attack = 1;
  let defence = 1; // >1 means the side concedes more

  if (t.mentality === 'attacking') { attack *= 1.15; defence *= 1.12; }
  if (t.mentality === 'defensive') { attack *= 0.85; defence *= 0.88; }
  if (t.tempo === 'fast') { attack *= 1.05; defence *= 1.05; }
  if (t.tempo === 'slow') { attack *= 0.96; defence *= 0.95; }
  if (t.pressing === 'high') { attack *= 1.06; defence *= o.passing === 'direct' ? 1.1 : 1.02; }
  if (t.pressing === 'low') { attack *= 0.95; defence *= o.passing === 'short' ? 0.92 : 0.98; }
  if (t.width === 'wide' && o.width === 'narrow') attack *= 1.05;
  if (t.width === 'narrow' && o.width === 'wide') defence *= 1.04;
  if (t.passing === 'direct' && o.pressing === 'high') attack *= 1.05;
  if (t.passing === 'short' && o.pressing === 'high') attack *= 0.94;

  return { attack, defence };
}
