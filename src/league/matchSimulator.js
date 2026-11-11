/**
 * Quick match simulator used for every fixture the user does not watch on the
 * pitch: the "Simulate" button and all of the AI-versus-AI matches in a round.
 *
 * Expected goals are derived from the two squads' ratings (so training that
 * moves attributes moves results), adjusted by each side's tactics through
 * tacticsEffect(), with a home advantage, and converted to a score with a
 * Poisson draw. Scorers are picked with a bias towards forwards and players
 * with good finishing.
 */

import { tacticsEffect, formationRoleCounts } from '../tactics/tactics.js';

const KEY_ATTRIBUTES = ['pace', 'passing', 'finishing', 'tackling', 'positioning', 'stamina', 'technique', 'composure'];

export function playerRating(player) {
  const attrs = player.attributes || {};
  if (player.position === 'GK') {
    const keys = ['gkreflexes', 'gkhandling', 'gkpositioning', 'gkdiving'];
    return average(keys.map(k => attrs[k] ?? 50));
  }
  return average(KEY_ATTRIBUTES.map(k => attrs[k] ?? 50));
}

export function startingEleven(team) {
  const players = (team.players || []).filter(p => !p.injured);
  const byRating = [...players].sort((a, b) => playerRating(b) - playerRating(a));
  const keeper = byRating.find(p => p.position === 'GK') || byRating[0];
  const outfield = byRating.filter(p => p !== keeper && p.position !== 'GK').slice(0, 10);
  return keeper ? [keeper, ...outfield] : outfield.slice(0, 11);
}

/**
 * Order a set of players into formation slots: keeper, then defenders,
 * midfielders and forwards, filling any short role from the overflow.
 */
export function sortForFormation(players, formation) {
  const order = { GK: 0, CB: 1, LB: 1, RB: 1, DM: 2, CM: 2, AM: 2, LW: 3, RW: 3, ST: 3 };
  const buckets = [[], [], [], []];
  players.forEach(p => buckets[order[p.position] ?? 2].push(p));
  const counts = formationRoleCounts(formation);
  const slotsPerRole = [counts.GK, counts.DEF, counts.MID, counts.FWD];
  const result = [];
  const overflow = [];
  buckets.forEach((bucket, index) => {
    result.push(...bucket.slice(0, slotsPerRole[index]));
    overflow.push(...bucket.slice(slotsPerRole[index]));
    while (result.length < slotsPerRole.slice(0, index + 1).reduce((a, b) => a + b, 0) && overflow.length) {
      result.push(overflow.shift());
    }
  });
  return result;
}

/** The eleven who start in the given formation, in slot order. */
export function lineupForFormation(team, formation) {
  return sortForFormation(startingEleven(team), formation);
}

export function teamRating(team) {
  const eleven = startingEleven(team);
  if (eleven.length === 0) return 50;
  return average(eleven.map(playerRating));
}

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function poisson(lambda, rng) {
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > limit);
  return k - 1;
}

export function expectedGoals(homeTeam, awayTeam, homeTactics = null, awayTactics = null) {
  const home = teamRating(homeTeam);
  const away = teamRating(awayTeam);
  const diff = (home - away) / 12;
  const homeEffect = tacticsEffect(homeTactics, awayTactics);
  const awayEffect = tacticsEffect(awayTactics, homeTactics);
  return {
    home: Math.max(0.25, (1.45 + diff) * homeEffect.attack * awayEffect.defence),
    away: Math.max(0.2, (1.1 - diff) * awayEffect.attack * homeEffect.defence)
  };
}

export function pickScorers(team, goals, rng) {
  const eleven = startingEleven(team).filter(p => p.position !== 'GK');
  if (eleven.length === 0) return [];
  const weights = eleven.map(p => {
    const finishing = p.attributes?.finishing ?? 50;
    const positionWeight = { ST: 5, RW: 3, LW: 3, AM: 2.5, CM: 1.2, LB: 0.4, RB: 0.4, CB: 0.5, DM: 0.6 }[p.position] ?? 1;
    return positionWeight * (0.5 + finishing / 100);
  });
  const total = weights.reduce((s, w) => s + w, 0);
  const scorers = [];
  for (let g = 0; g < goals; g++) {
    let r = rng() * total;
    let chosen = eleven[eleven.length - 1];
    for (let i = 0; i < eleven.length; i++) {
      r -= weights[i];
      if (r <= 0) { chosen = eleven[i]; break; }
    }
    scorers.push({ player: chosen.name, playerId: chosen.id, minute: 1 + Math.floor(rng() * 90) });
  }
  return scorers.sort((a, b) => a.minute - b.minute);
}

export function simulateMatch(homeTeam, awayTeam, rng = Math.random, homeTactics = null, awayTactics = null) {
  const xg = expectedGoals(homeTeam, awayTeam, homeTactics, awayTactics);
  const homeScore = poisson(xg.home, rng);
  const awayScore = poisson(xg.away, rng);
  return {
    homeScore,
    awayScore,
    homeScorers: pickScorers(homeTeam, homeScore, rng),
    awayScorers: pickScorers(awayTeam, awayScore, rng)
  };
}
