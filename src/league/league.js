// league.js - League class for Football Manager
import { Team } from '../team/team.js';

export class League {
  constructor({ name = 'Premier League', teams = [] }) {
    this.name = name;
    this.teams = teams; // Array of Team objects
    this.fixtures = [];
    this.results = [];
    this.currentRound = 0;
    this.generateFixtures();
  }

  generateFixtures() {
    // Double round-robin (home/away) fixture generator with calendar dates
    const n = this.teams.length;
    this.fixtures = [];
    this.calendar = [];
    let teams = [...this.teams];
    for (let round = 0; round < n - 1; round++) {
      let roundMatches = [];
      for (let i = 0; i < n / 2; i++) {
        const home = teams[i];
        const away = teams[n - 1 - i];
        roundMatches.push({ home, away });
      }
      this.fixtures.push(roundMatches);
      teams.splice(1, 0, teams.pop());
    }
    // Second half: reverse home/away
    const firstHalf = this.fixtures.map(round => round.map(match => ({...match})));
    const secondHalf = firstHalf.map(round => round.map(({home, away}) => ({home: away, away: home})));
    this.fixtures = [...firstHalf, ...secondHalf];

    // Assign dates to each round (e.g., weekly, starting from today)
    const startDate = new Date();
    for (let i = 0; i < this.fixtures.length; i++) {
      let date = new Date(startDate);
      date.setDate(startDate.getDate() + i * 7); // 1 round per week
      this.calendar.push({ round: i + 1, date, matches: this.fixtures[i] });
    }
  }
  getCalendar() {
    // Returns the full match calendar with dates
    return this.calendar;
  }
  getTopScorers() {
    // Return top 10 scorers in the league
    let allPlayers = this.teams.flatMap(team => team.players);
    return allPlayers.sort((a, b) => b.goals - a.goals).slice(0, 10);
  }

  getTopAssists() {
    // Return top 10 assist providers
    let allPlayers = this.teams.flatMap(team => team.players);
    return allPlayers.sort((a, b) => b.assists - a.assists).slice(0, 10);
  }

  recordResult(home, away, homeGoals, awayGoals) {
    this.results.push({ home, away, homeGoals, awayGoals });
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;
    if (homeGoals > awayGoals) home.points += 3;
    else if (homeGoals < awayGoals) away.points += 3;
    else { home.points += 1; away.points += 1; }
  }

  getTable() {
    // Return teams sorted by points, then goal difference
    return [...this.teams].sort((a, b) =>
      b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
    );
  }
}
