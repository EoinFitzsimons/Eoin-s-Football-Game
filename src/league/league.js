/**
 * League - a group of teams, a double round-robin schedule and a table.
 * All standings are kept in team.stats so the table and the UI agree.
 */
export class League {
  constructor({ name = 'Premier League', teams = [] }) {
    this.name = name;
    this.teams = teams;
    this.fixtures = [];
    this.results = [];
    this.generateFixtures();
  }

  /**
   * Double round-robin using the circle method. Each entry of this.fixtures is
   * one round: an array of { home, away } pairs in which every team appears once.
   */
  generateFixtures() {
    const n = this.teams.length;
    this.fixtures = [];
    if (n < 2) return;
    const rotation = [...this.teams];
    const firstHalf = [];
    for (let round = 0; round < n - 1; round++) {
      const roundMatches = [];
      for (let i = 0; i < n / 2; i++) {
        const a = rotation[i];
        const b = rotation[n - 1 - i];
        // Alternate home advantage so no team plays every round at home.
        const homeFirst = (round + i) % 2 === 0;
        roundMatches.push(homeFirst ? { home: a, away: b } : { home: b, away: a });
      }
      firstHalf.push(roundMatches);
      rotation.splice(1, 0, rotation.pop());
    }
    const secondHalf = firstHalf.map(round => round.map(({ home, away }) => ({ home: away, away: home })));
    this.fixtures = [...firstHalf, ...secondHalf];
  }

  resetTable() {
    this.results = [];
    this.teams.forEach(team => {
      team.stats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      team.points = 0;
      team.goalsFor = 0;
      team.goalsAgainst = 0;
    });
  }

  recordResult(home, away, homeGoals, awayGoals) {
    this.results.push({ home, away, homeGoals, awayGoals });
    const update = (team, scored, conceded) => {
      team.stats = team.stats || { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      team.stats.played++;
      team.stats.goalsFor += scored;
      team.stats.goalsAgainst += conceded;
      if (scored > conceded) { team.stats.won++; team.stats.points += 3; }
      else if (scored < conceded) { team.stats.lost++; }
      else { team.stats.drawn++; team.stats.points += 1; }
      // Mirror onto the flat fields some older code still reads.
      team.points = team.stats.points;
      team.goalsFor = team.stats.goalsFor;
      team.goalsAgainst = team.stats.goalsAgainst;
    };
    update(home, homeGoals, awayGoals);
    update(away, awayGoals, homeGoals);
  }

  getTopScorers() {
    const allPlayers = this.teams.flatMap(team => team.players);
    return allPlayers
      .filter(p => (p.stats?.goals || 0) > 0)
      .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
      .slice(0, 10);
  }

  getTopAssists() {
    const allPlayers = this.teams.flatMap(team => team.players);
    return allPlayers
      .filter(p => (p.stats?.assists || 0) > 0)
      .sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0))
      .slice(0, 10);
  }

  getStandings() {
    const s = team => team.stats || { points: 0, goalsFor: 0, goalsAgainst: 0 };
    return [...this.teams].sort((a, b) =>
      s(b).points - s(a).points ||
      (s(b).goalsFor - s(b).goalsAgainst) - (s(a).goalsFor - s(a).goalsAgainst) ||
      s(b).goalsFor - s(a).goalsFor ||
      a.name.localeCompare(b.name)
    );
  }

  getTable() {
    return this.getStandings();
  }

  getPosition(team) {
    return this.getStandings().findIndex(t => t.id === team.id) + 1;
  }
}
