import { MatchEngine } from './match/matchEngine.js';

const canvas = document.getElementById('pitch');

// Example teams and players
const teams = [
  {
    name: 'Red FC',
    color: '#e74c3c',
    players: Array.from({length: 11}, (_, i) => ({
      name: `Red Player ${i+1}`,
      speed: Math.random() * 2 + 2,
      skill: Math.random() * 2 + 2,
      stamina: Math.random() * 2 + 2
    }))
  },
  {
    name: 'Blue United',
    color: '#3498db',
    players: Array.from({length: 11}, (_, i) => ({
      name: `Blue Player ${i+1}`,
      speed: Math.random() * 2 + 2,
      skill: Math.random() * 2 + 2,
      stamina: Math.random() * 2 + 2
    }))
  }
];

// Create and run the match engine
const engine = new MatchEngine(teams[0], teams[1], canvas);

function gameLoop() {
  engine.playStep();
  requestAnimationFrame(gameLoop);
}

gameLoop();
