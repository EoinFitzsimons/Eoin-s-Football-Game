/**
 * Quick match simulator used for every fixture the user does not play on the
 * pitch: the "Simulate" button and all of the AI-versus-AI matches in a round.
 *
 * Expected goals are derived from the two squads' ratings, with a home
 * advantage, and converted to a score with a Poisson draw. Scorers are picked
 * with a bias towards forwards and players with good finishing.
 */

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

export function expectedGoals(homeTeam, awayTeam) {
  const home = teamRating(homeTeam);
  const away = teamRating(awayTeam);
  const diff = (home - away) / 12;
  return {
    home: Math.max(0.25, 1.45 + diff),
    away: Math.max(0.2, 1.1 - diff)
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

export function simulateMatch(homeTeam, awayTeam, rng = Math.random) {
  const xg = expectedGoals(homeTeam, awayTeam);
  const homeScore = poisson(xg.home, rng);
  const awayScore = poisson(xg.away, rng);
  return {
    homeScore,
    awayScore,
    homeScorers: pickScorers(homeTeam, homeScore, rng),
    awayScorers: pickScorers(awayTeam, awayScore, rng)
  };
}
