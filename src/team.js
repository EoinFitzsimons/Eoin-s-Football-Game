// Team.js - Team class for Football Manager
import { Player } from './player.js';
  // Factory method to create a sample team with players
  static createSampleTeam(name = 'Sample FC', numPlayers = 18) {
    const colors = ['#e74c3c', '#3498db', '#27ae60', '#f1c40f', '#9b59b6', '#e67e22', '#fff', '#222'];
    const players = [];
    for (let i = 0; i < numPlayers; i++) {
      players.push(new Player({
        name: `${name} Player ${i+1}`,
        position: i < 1 ? 'GK' : i < 5 ? 'DEF' : i < 9 ? 'MID' : 'FWD',
        speed: Math.random() * 2 + 4,
        skill: Math.random() * 2 + 4,
        stamina: Math.random() * 2 + 4,
        color: colors[i % colors.length]
      }));
    }
    return new Team({ name, color: colors[Math.floor(Math.random()*colors.length)], players });
  }

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
