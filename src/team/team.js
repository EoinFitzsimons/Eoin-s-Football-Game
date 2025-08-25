// Team.js - Team class for Football Manager

export class Team {
  constructor({ name, color = '#fff', players = [] }) {
    this.name = name;
    this.color = color;
    this.players = players; // Array of Player objects
    this.budget = 1000000;
    this.tactics = 'Balanced';
    this.manager = 'AI';
    this.points = 0;
    this.goalsFor = 0;
    this.goalsAgainst = 0;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(playerName) {
    this.players = this.players.filter(p => p.name !== playerName);
  }

  getLineup() {
    // Return starting 11 (simple: first 11)
    return this.players.slice(0, 11);
  }
}
