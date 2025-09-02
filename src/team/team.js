// Team.js - Team class for Football Manager

export class Team {
  constructor({ 
    name, 
    color = '#fff', 
    players = [], 
    city = null,
    country = null,
    league = null,
    tier = 1,
    founded = null,
    stadium = null,
    stats = null
  }) {
    this.id = this.generateId();
    this.name = name;
    this.color = color;
    this.city = city;
    this.country = country;
    this.league = league;
    this.tier = tier;
    this.founded = founded || this.generateFoundedYear();
    this.stadium = stadium || `${name} Stadium`;
    this.players = players; // Array of Player objects
    this.budget = 1000000;
    this.tactics = 'Balanced';
    this.manager = 'AI';
    this.points = 0;
    this.goalsFor = 0;
    this.goalsAgainst = 0;
    this.stats = stats || {
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0
    };
  }

  generateId() {
    return Math.random().toString(36).substring(2, 11);
  }

  generateFoundedYear() {
    // Generate a realistic founded year (1850-2000)
    return Math.floor(Math.random() * 150) + 1850;
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
