/**
 * Small deterministic random number generator (mulberry32).
 *
 * The world generator in randomData.js, the Team and Player constructors and
 * the League fixture generator all call Math.random directly. Running them
 * inside withSeededRandom() makes the whole generated world reproducible from
 * a single 32-bit seed, which is what lets a saved game be restored without
 * serialising hundreds of teams and thousands of players.
 */

export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function seededRandom() {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed() {
  return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0;
}

/**
 * Run fn() with Math.random temporarily replaced by a seeded generator.
 * Math.random is always restored, even if fn throws.
 */
export function withSeededRandom(seed, fn) {
  const original = Math.random;
  Math.random = createSeededRandom(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}
