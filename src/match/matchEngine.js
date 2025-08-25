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
        p.x += (dx/dist) * p.speed;
        p.y += (dy/dist) * p.speed;
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
    // Goal detection
    // Assume goals are 100px wide and centered vertically
    const goalWidth = 100;
    const goalTop = (this.height - goalWidth) / 2;
    const goalBottom = goalTop + goalWidth;

    // Left goal (away team scores)
    if (
      this.ball.x <= 0 &&
      this.ball.y >= goalTop &&
      this.ball.y <= goalBottom
    ) {
      this.score[1] += 1;
      this.resetAfterGoal(1);
    }
    // Right goal (home team scores)
    if (
      this.ball.x >= this.width &&
      this.ball.y >= goalTop &&
      this.ball.y <= goalBottom
    ) {
      this.score[0] += 1;
      this.resetAfterGoal(0);
    }

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
  }

  playStep() {
    this.update();
    this.draw();
  }

  resetAfterGoal(scoringTeam) {
    // Reset ball to center, stop movement
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.ball.vx = 0;
    this.ball.vy = 0;
    // Optionally, reset player positions
    this.initPlayers();
  }
}
