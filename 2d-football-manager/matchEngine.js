// 2D Football Match Engine (core logic)
// This module simulates a match between two teams and animates it on a canvas

export class MatchEngine {
  constructor(homeTeam, awayTeam, canvas) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.players = [];
    this.ball = { x: this.width/2, y: this.height/2, vx: 0, vy: 0 };
    this.score = [0, 0];
    this.time = 0;
    this.maxTime = 90 * 60; // 90 minutes in seconds
    this.initPlayers();
  }

  initPlayers() {
    // Place players in basic formation (4-4-2 for both teams)
    this.players = [];
    const homeColor = this.homeTeam.color;
    const awayColor = this.awayTeam.color;
    if (!Array.isArray(this.homeTeam.players) || this.homeTeam.players.length < 11) {
      throw new Error('Home team must have at least 11 players');
    }
    if (!Array.isArray(this.awayTeam.players) || this.awayTeam.players.length < 11) {
      throw new Error('Away team must have at least 11 players');
    }
    for (let i = 0; i < 11; i++) {
      // Home team on left
      this.players.push({
        ...this.homeTeam.players[i],
        x: 100 + (i%4)*30,
        y: 80 + Math.floor(i/4)*100,
        team: 0,
        color: homeColor
      });
      // Away team on right
      this.players.push({
        ...this.awayTeam.players[i],
        x: this.width-100 - (i%4)*30,
        y: 80 + Math.floor(i/4)*100,
        team: 1,
        color: awayColor
      });
    }
  }

  update() {
    // Simple AI: move players toward ball
    for (let p of this.players) {
      const dx = this.ball.x - p.x;
      const dy = this.ball.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        const speed = typeof p.speed === 'number' ? p.speed : 2;
        p.x += (dx/dist) * speed;
        p.y += (dy/dist) * speed;
      }
    }
    // Ball movement (very basic)
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.vx *= 0.98;
    this.ball.vy *= 0.98;
    // Keep ball in bounds
    if (this.ball.x < 0) this.ball.x = 0;
    if (this.ball.x > this.width) this.ball.x = this.width;
    if (this.ball.y < 0) this.ball.y = 0;
    if (this.ball.y > this.height) this.ball.y = this.height;
    this.time++;
  }

  draw() {
    // Draw pitch
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.width/2, 0);
    this.ctx.lineTo(this.width/2, this.height);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(this.width/2, this.height/2, 60, 0, 2*Math.PI);
    this.ctx.stroke();
    // Draw players
    for (let p of this.players) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 10, 0, 2*Math.PI);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.strokeStyle = '#222';
      this.ctx.stroke();
    }
    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, 6, 0, 2*Math.PI);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.stroke();
  }

  playStep() {
    this.update();
    this.draw();
  }
}
