/**
 * MatchEngine - the playable top-down football match.
 *
 * Everything is simulated in metres on a 105 x 68 pitch and drawn to a canvas
 * each frame. One player on the user's side is keyboard controlled; the other
 * twenty-one are driven by simple role-based AI. Halves last a few real
 * minutes and the on-screen clock is scaled to 45 minutes each.
 *
 * All of the art (pitch, kits, ball, scoreboard) is drawn in code; there are no
 * image assets.
 */

import { startingEleven } from '../league/matchSimulator.js';

export const PITCH = Object.freeze({
  length: 105,
  width: 68,
  goalWidth: 7.32,
  boxDepth: 16.5,
  boxWidth: 40.32,
  sixYardDepth: 5.5,
  sixYardWidth: 18.32,
  centreRadius: 9.15,
  penaltySpot: 11
});

const FORMATION_433 = [
  { role: 'GK', x: 0.04, y: 0.5 },
  { role: 'DEF', x: 0.2, y: 0.18 },
  { role: 'DEF', x: 0.17, y: 0.4 },
  { role: 'DEF', x: 0.17, y: 0.6 },
  { role: 'DEF', x: 0.2, y: 0.82 },
  { role: 'MID', x: 0.38, y: 0.3 },
  { role: 'MID', x: 0.35, y: 0.5 },
  { role: 'MID', x: 0.38, y: 0.7 },
  { role: 'FWD', x: 0.56, y: 0.22 },
  { role: 'FWD', x: 0.6, y: 0.5 },
  { role: 'FWD', x: 0.56, y: 0.78 }
];

const DIFFICULTY = {
  easy: { aiSpeed: 0.82, aiAccuracy: 0.7, tackle: 0.35 },
  normal: { aiSpeed: 0.95, aiAccuracy: 0.85, tackle: 0.5 },
  hard: { aiSpeed: 1.08, aiAccuracy: 1, tackle: 0.65 }
};

const KEYS = {
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  shoot: [' ', 'Spacebar'],
  pass: ['Shift', 'x', 'X'],
  switch: ['q', 'Q', 'Tab'],
  sprint: ['Control', 'c', 'C']
};

export class MatchEngine {
  constructor({ homeTeam, awayTeam, userTeam, canvas, soundscape = null, halfLengthMinutes = 2, difficulty = 'normal', onEvent = () => {} }) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.userSide = userTeam === awayTeam ? 'away' : 'home';
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sound = soundscape;
    this.onEvent = onEvent;
    this.difficulty = DIFFICULTY[difficulty] || DIFFICULTY.normal;

    this.halfSeconds = Math.max(30, halfLengthMinutes * 60);
    this.half = 1;
    this.elapsed = 0;            // real seconds elapsed in the current half
    this.phase = 'kickoff';      // kickoff | playing | restart | goal | halfTime | fullTime
    this.phaseTimer = 0;
    this.paused = false;
    this.score = { home: 0, away: 0 };
    this.scorers = { home: [], away: [] };
    this.shots = { home: 0, away: 0 };
    this.possessionTicks = { home: 0, away: 0 };
    this.lastTouch = null;
    this.message = null;
    this.messageTimer = 0;

    this.homeAttacksRight = true;
    this.kits = { home: buildKit(homeTeam.color, '#ffffff'), away: buildKit(awayTeam.color, homeTeam.color) };

    this.keys = new Set();
    this.controlled = null;
    this.switchCooldown = 0;

    this.ball = { x: PITCH.length / 2, y: PITCH.width / 2, vx: 0, vy: 0, owner: null, spin: 0 };
    this.players = [...this.createPlayers(homeTeam, 'home'), ...this.createPlayers(awayTeam, 'away')];
    this.lastFrame = null;
    this.rafId = null;
    this.running = false;

    this.resize();
    this.setUpKickoff('home');
  }

  // ---------------------------------------------------------------------------
  // Set-up
  // ---------------------------------------------------------------------------

  createPlayers(team, side) {
    const eleven = startingEleven(team);
    const sorted = sortForFormation(eleven);
    return FORMATION_433.map((slot, index) => {
      const source = sorted[index];
      const attrs = source?.attributes || {};
      return {
        side,
        role: slot.role,
        slot,
        name: source?.name || `${team.name} ${index + 1}`,
        number: slot.role === 'GK' ? 1 : index + 1,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        facing: side === 'home' ? 0 : Math.PI,
        speed: 5.2 + ((attrs.pace ?? 60) / 100) * 2.8,              // metres per second
        skill: ((attrs.technique ?? 60) + (attrs.passing ?? 60)) / 200,
        finishing: (attrs.finishing ?? 60) / 100,
        tackling: (attrs.tackling ?? 60) / 100,
        keeping: ((attrs.gkreflexes ?? 60) + (attrs.gkpositioning ?? 60)) / 200,
        kickCooldown: 0,
        decisionTimer: Math.random() * 0.3,
        isUser: side === this.userSide
      };
    });
  }

  attacksRight(side) {
    return side === 'home' ? this.homeAttacksRight : !this.homeAttacksRight;
  }

  goalFor(side) {
    // The goal this side is attacking.
    return { x: this.attacksRight(side) ? PITCH.length : 0, y: PITCH.width / 2 };
  }

  ownGoal(side) {
    return { x: this.attacksRight(side) ? 0 : PITCH.length, y: PITCH.width / 2 };
  }

  homePosition(player, ballX = this.ball.x) {
    const right = this.attacksRight(player.side);
    // Formation spot, nudged along the pitch towards the ball to keep the team compact.
    const baseX = player.slot.x * PITCH.length;
    const shift = (ballX - PITCH.length / 2) * (player.role === 'GK' ? 0 : 0.35);
    const x = right ? baseX + shift : PITCH.length - baseX + shift;
    const y = player.slot.y * PITCH.width + (this.ball.y - PITCH.width / 2) * (player.role === 'GK' ? 0 : 0.2);
    return { x: clamp(x, 1, PITCH.length - 1), y: clamp(y, 1, PITCH.width - 1) };
  }

  setUpKickoff(kickingSide) {
    this.ball.x = PITCH.length / 2;
    this.ball.y = PITCH.width / 2;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.owner = null;

    this.players.forEach(player => {
      const spot = this.homePosition(player, PITCH.length / 2);
      const right = this.attacksRight(player.side);
      // Everyone starts in their own half.
      player.x = right ? Math.min(spot.x, PITCH.length / 2 - 2) : Math.max(spot.x, PITCH.length / 2 + 2);
      player.y = spot.y;
      player.vx = 0;
      player.vy = 0;
      player.kickCooldown = 0;
    });

    const kicker = this.players.find(p => p.side === kickingSide && p.role === 'FWD' && Math.abs(p.slot.y - 0.5) < 0.01);
    if (kicker) {
      kicker.x = PITCH.length / 2 + (this.attacksRight(kickingSide) ? -1.2 : 1.2);
      kicker.y = PITCH.width / 2;
    }
    this.phase = 'kickoff';
    this.phaseTimer = 1.2;
    this.kickingSide = kickingSide;
    this.pickControlledPlayer(true);
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    const frame = now => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      if (!this.paused) this.update(dt);
      this.draw();
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
    this.sound?.startCrowd();
    this.sound?.whistle('kickoff');
    this.onEvent('kickoff', { minute: 0 });
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.sound?.stopCrowd();
  }

  togglePause() {
    if (this.phase === 'fullTime') return;
    this.paused = !this.paused;
    this.onEvent('pause', { paused: this.paused });
  }

  resize() {
    const parent = this.canvas.parentElement;
    const availableWidth = parent ? parent.clientWidth : this.canvas.width;
    const width = Math.max(480, Math.min(1100, availableWidth || 960));
    const height = Math.round(width * (PITCH.width + 10) / (PITCH.length + 8));
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.view = { width, height, scale: width / (PITCH.length + 8), offsetX: 4, offsetY: 6 };
  }

  toScreen(x, y) {
    return { x: (x + this.view.offsetX) * this.view.scale, y: (y + this.view.offsetY) * this.view.scale };
  }

  matchMinute() {
    const perHalf = 45 * Math.min(1, this.elapsed / this.halfSeconds);
    return Math.floor(perHalf + (this.half === 2 ? 45 : 0));
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------

  keyDown(key) {
    this.keys.add(key);
    if (KEYS.switch.includes(key)) this.pickControlledPlayer(true);
  }

  keyUp(key) {
    this.keys.delete(key);
  }

  isDown(action) {
    return KEYS[action].some(k => this.keys.has(k));
  }

  inputVector() {
    let dx = 0;
    let dy = 0;
    if (this.isDown('left')) dx -= 1;
    if (this.isDown('right')) dx += 1;
    if (this.isDown('up')) dy -= 1;
    if (this.isDown('down')) dy += 1;
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length, active: dx !== 0 || dy !== 0 };
  }

  pickControlledPlayer(force = false) {
    if (!force && this.switchCooldown > 0) return;
    const candidates = this.players.filter(p => p.isUser && p.role !== 'GK');
    if (this.ball.owner && this.ball.owner.isUser && this.ball.owner.role !== 'GK') {
      this.controlled = this.ball.owner;
    } else {
      candidates.sort((a, b) => distance(a, this.ball) - distance(b, this.ball));
      // Q cycles to the next nearest so the user can choose a different runner.
      const nearest = candidates[0];
      this.controlled = force && this.controlled === nearest && candidates[1] ? candidates[1] : nearest;
    }
    this.switchCooldown = 0.4;
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  update(dt) {
    this.switchCooldown = Math.max(0, this.switchCooldown - dt);
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.message = null;
    }

    if (this.phase === 'fullTime') return;

    if (this.phase === 'halfTime') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0 || this.isDown('shoot')) this.startSecondHalf();
      return;
    }

    if (this.phase === 'goal' || this.phase === 'kickoff' || this.phase === 'restart') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        if (this.phase === 'goal') {
          this.setUpKickoff(this.concededSide);
          this.phase = 'kickoff';
          this.phaseTimer = 0.8;
          return;
        }
        this.phase = 'playing';
        if (this.kickingSide && !this.ball.owner) {
          const kicker = nearestPlayer(this.players.filter(p => p.side === this.kickingSide), this.ball);
          if (kicker && distance(kicker, this.ball) < 3) this.takePossession(kicker);
          this.kickingSide = null;
        }
      } else if (this.phase !== 'goal') {
        // Let the players walk into position during the pause.
        this.players.forEach(p => this.steerTowards(p, this.phase === 'kickoff' ? { x: p.x, y: p.y } : this.homePosition(p), dt, 0.6));
        return;
      } else {
        return;
      }
    }

    this.elapsed += dt;
    if (this.elapsed >= this.halfSeconds) {
      this.endHalf();
      return;
    }

    if (this.ball.owner) this.possessionTicks[this.ball.owner.side] += dt;

    this.updateUserPlayer(dt);
    this.updateAI(dt);
    this.updateBall(dt);
    this.resolveCollisions();
    this.checkBoundaries();
  }

  endHalf() {
    if (this.half === 1) {
      this.phase = 'halfTime';
      this.phaseTimer = 4;
      this.ball.owner = null;
      this.sound?.whistle('halfTime');
      this.showMessage('Half time', 4);
      this.onEvent('halfTime', { minute: 45, score: { ...this.score } });
    } else {
      this.phase = 'fullTime';
      this.ball.owner = null;
      this.sound?.whistle('fullTime');
      this.showMessage('Full time', 999);
      this.onEvent('fullTime', { minute: 90, score: { ...this.score }, result: this.result() });
    }
  }

  startSecondHalf() {
    this.half = 2;
    this.elapsed = 0;
    this.homeAttacksRight = !this.homeAttacksRight;
    this.setUpKickoff('away');
    this.sound?.whistle('kickoff');
    this.showMessage('Second half', 1.5);
    this.onEvent('secondHalf', { minute: 45 });
  }

  result() {
    return {
      homeScore: this.score.home,
      awayScore: this.score.away,
      homeScorers: this.scorers.home,
      awayScorers: this.scorers.away,
      shots: { ...this.shots },
      possession: this.possessionShare(),
      playedByUser: true
    };
  }

  possessionShare() {
    const total = this.possessionTicks.home + this.possessionTicks.away || 1;
    const home = Math.round((this.possessionTicks.home / total) * 100);
    return { home, away: 100 - home };
  }

  showMessage(text, seconds) {
    this.message = text;
    this.messageTimer = seconds;
  }

  // --- User -----------------------------------------------------------------

  updateUserPlayer(dt) {
    if (!this.controlled || !this.controlled.isUser) this.pickControlledPlayer(true);
    const player = this.controlled;
    if (!player) return;
    if (!this.ball.owner || !this.ball.owner.isUser) this.pickControlledPlayer();

    const input = this.inputVector();
    const sprint = this.isDown('sprint') ? 1.18 : 1;
    const hasBall = this.ball.owner === player;
    const speed = player.speed * sprint * (hasBall ? 0.86 : 1);

    // If the user leaves the controls alone, the highlighted player keeps the
    // game moving on his own rather than standing on the ball.
    this.userIdle = input.active || this.isDown('shoot') || this.isDown('pass') ? 0 : (this.userIdle || 0) + dt;
    if (this.userIdle > 1.5) {
      player.kickCooldown = Math.max(0, player.kickCooldown - dt);
      player.decisionTimer -= dt;
      if (hasBall) this.aiWithBall(player, dt, 1);
      else this.steerTowards(player, distance(player, this.ball) < 12 ? this.ball : this.homePosition(player), dt, 0.9);
      return;
    }

    if (input.active) {
      player.vx = input.x * speed;
      player.vy = input.y * speed;
      player.facing = Math.atan2(input.y, input.x);
    } else {
      player.vx *= 0.75;
      player.vy *= 0.75;
    }
    player.x = clamp(player.x + player.vx * dt, -1, PITCH.length + 1);
    player.y = clamp(player.y + player.vy * dt, -1, PITCH.width + 1);

    if (hasBall) {
      if (this.isDown('shoot') && player.kickCooldown <= 0) {
        this.userShoot(player, input);
      } else if (this.isDown('pass') && player.kickCooldown <= 0) {
        this.userPass(player, input);
      }
    } else if (this.isDown('shoot') && player.kickCooldown <= 0 && distance(player, this.ball) < 1.6) {
      // A first-time kick or tackle on a loose ball.
      this.kickBall(player, player.facing, 18);
    }
  }

  userShoot(player, input) {
    const goal = this.goalFor(player.side);
    let angle = Math.atan2(goal.y - player.y, goal.x - player.x);
    if (input.active) {
      // Aim with the stick: blend towards the goal so shots stay on target-ish.
      const aim = Math.atan2(input.y, input.x);
      angle = lerpAngle(angle, aim, 0.45);
    }
    const dist = distance(player, goal);
    const power = clamp(16 + (dist / PITCH.length) * 26, 16, 30);
    this.shoot(player, angle, power);
  }

  userPass(player, input) {
    const teammates = this.players.filter(p => p.side === player.side && p !== player);
    let target = null;
    if (input.active) {
      const aim = Math.atan2(input.y, input.x);
      target = teammates
        .map(p => ({ p, score: angleDiff(aim, Math.atan2(p.y - player.y, p.x - player.x)) + distance(p, player) / 60 }))
        .sort((a, b) => a.score - b.score)[0]?.p;
    } else {
      target = this.bestPassOption(player);
    }
    if (target) this.passTo(player, target);
  }

  // --- AI -------------------------------------------------------------------

  updateAI(dt) {
    const owner = this.ball.owner;
    this.players.forEach(player => {
      if (player === this.controlled && player.isUser) return;
      player.kickCooldown = Math.max(0, player.kickCooldown - dt);
      player.decisionTimer -= dt;
      const aiFactor = player.isUser ? 1 : this.difficulty.aiSpeed;

      if (player.role === 'GK') {
        this.updateGoalkeeper(player, dt, aiFactor);
        return;
      }

      if (owner === player) {
        this.aiWithBall(player, dt, aiFactor);
        return;
      }

      const teamHasBall = owner && owner.side === player.side;
      const home = this.homePosition(player);

      if (teamHasBall) {
        // Support: push up towards the attacking goal and spread out.
        const goal = this.goalFor(player.side);
        const target = {
          x: lerp(home.x, goal.x, player.role === 'FWD' ? 0.5 : player.role === 'MID' ? 0.3 : 0.1),
          y: home.y
        };
        this.steerTowards(player, target, dt, 0.8 * aiFactor);
      } else {
        // Defend: the two nearest outfield players chase, the rest hold shape.
        const chasers = this.players
          .filter(p => p.side === player.side && p.role !== 'GK' && !(p === this.controlled && p.isUser))
          .sort((a, b) => distance(a, this.ball) - distance(b, this.ball))
          .slice(0, owner ? 2 : 1);
        if (chasers.includes(player)) {
          this.steerTowards(player, this.ball, dt, 0.95 * aiFactor);
          if (owner && owner.side !== player.side && distance(player, owner) < 1.4 && player.kickCooldown <= 0) {
            this.attemptTackle(player, owner);
          } else if (!owner && distance(player, this.ball) < 1.7 && player.kickCooldown <= 0) {
            this.takePossession(player);
          }
        } else {
          const goal = this.ownGoal(player.side);
          const target = { x: lerp(home.x, goal.x, 0.12), y: home.y };
          this.steerTowards(player, target, dt, 0.8 * aiFactor);
        }
      }
    });
  }

  aiWithBall(player, dt, aiFactor) {
    const goal = this.goalFor(player.side);
    const distToGoal = distance(player, goal);
    const nearestOpponent = nearestPlayer(this.players.filter(p => p.side !== player.side), player);
    const pressure = nearestOpponent ? distance(nearestOpponent, player) : 99;

    if (player.decisionTimer <= 0 && player.kickCooldown <= 0) {
      player.decisionTimer = 0.25 + Math.random() * 0.25;
      const shootChance = distToGoal < 15 ? 0.95
        : distToGoal < 25 ? 0.5 + player.finishing * 0.3
        : distToGoal < 32 && pressure < 3 ? 0.25
        : 0;
      if (Math.random() < shootChance) {
        const accuracy = (player.isUser ? 1 : this.difficulty.aiAccuracy) * (0.6 + player.finishing * 0.4);
        const spread = (1 - accuracy) * 0.4 + 0.03;
        const angle = Math.atan2(goal.y + (Math.random() - 0.5) * PITCH.goalWidth * 0.8 - player.y, goal.x - player.x) + (Math.random() - 0.5) * spread;
        this.shoot(player, angle, clamp(18 + distToGoal * 0.35, 18, 30));
        return;
      }
      // Pass when closed down, or occasionally to move the ball on; otherwise
      // keep running with it. Only clearly useful passes are played.
      if (pressure < 2.2 || Math.random() < 0.08) {
        const option = this.bestPassOption(player, pressure < 2.2 ? -6 : 2);
        if (option) {
          this.passTo(player, option);
          return;
        }
      }
    }

    // Dribble towards goal, veering away from the nearest opponent.
    let angle = Math.atan2(goal.y - player.y, goal.x - player.x);
    if (nearestOpponent && pressure < 5) {
      const away = Math.atan2(player.y - nearestOpponent.y, player.x - nearestOpponent.x);
      angle = lerpAngle(angle, away, 0.5 * (1 - pressure / 5));
    }
    const speed = player.speed * 0.93 * aiFactor;
    player.vx = Math.cos(angle) * speed;
    player.vy = Math.sin(angle) * speed;
    player.facing = angle;
    player.x = clamp(player.x + player.vx * dt, 0.5, PITCH.length - 0.5);
    player.y = clamp(player.y + player.vy * dt, 0.5, PITCH.width - 0.5);
  }

  updateGoalkeeper(keeper, dt, aiFactor) {
    const goal = this.ownGoal(keeper.side);
    const right = this.attacksRight(keeper.side);
    const lineX = right ? 1.5 : PITCH.length - 1.5;
    const ballInBox = Math.abs(this.ball.x - goal.x) < PITCH.boxDepth && Math.abs(this.ball.y - goal.y) < PITCH.boxWidth / 2;
    const ballClose = distance(keeper, this.ball) < 7 && ballInBox;

    if (this.ball.owner === keeper) {
      // Distribute quickly to the nearest defender or midfielder.
      if (keeper.kickCooldown <= 0) {
        const option = this.bestPassOption(keeper) || nearestPlayer(this.players.filter(p => p.side === keeper.side && p !== keeper), keeper);
        if (option) this.passTo(keeper, option, 1.1);
      }
      return;
    }

    let target;
    if (ballClose && (!this.ball.owner || this.ball.owner.side !== keeper.side)) {
      target = this.ball;
    } else {
      const trackY = clamp(goal.y + (this.ball.y - goal.y) * 0.45, goal.y - PITCH.goalWidth / 2 - 1, goal.y + PITCH.goalWidth / 2 + 1);
      const comeOut = ballInBox ? 2.5 : 0;
      target = { x: lineX + (right ? comeOut : -comeOut), y: trackY };
    }
    this.steerTowards(keeper, target, dt, (0.95 + keeper.keeping * 0.3) * aiFactor);

    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const reach = ballSpeed > 10 ? 2.4 : 1.3;
    if (!this.ball.owner && distance(keeper, this.ball) < reach && keeper.kickCooldown <= 0) {
      const saveChance = 0.45 + keeper.keeping * 0.35 - ballSpeed / 80;
      if (Math.random() < saveChance) {
        const wasShot = ballSpeed > 12;
        this.takePossession(keeper);
        if (wasShot) {
          this.showMessage('Great save!', 1.5);
          this.sound?.crowdSwell(0.15, 1.5);
          this.onEvent('save', { minute: this.matchMinute(), keeper: keeper.name, side: keeper.side });
        }
      } else {
        keeper.kickCooldown = 0.6;
      }
    }
  }

  steerTowards(player, target, dt, factor = 1) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.3) {
      player.vx *= 0.6;
      player.vy *= 0.6;
      return;
    }
    const speed = Math.min(player.speed * factor, dist / dt);
    player.vx = (dx / dist) * speed;
    player.vy = (dy / dist) * speed;
    player.facing = Math.atan2(dy, dx);
    player.x += player.vx * dt;
    player.y += player.vy * dt;
  }

  bestPassOption(player, minimumScore = -Infinity) {
    const goal = this.goalFor(player.side);
    const opponents = this.players.filter(p => p.side !== player.side);
    const options = this.players
      .filter(p => p.side === player.side && p !== player && p.role !== 'GK')
      .map(p => {
        const dist = distance(p, player);
        if (dist < 4 || dist > 42) return null;
        const marker = nearestPlayer(opponents, p);
        const space = marker ? Math.min(distance(marker, p), 10) : 10;
        const progress = distance(player, goal) - distance(p, goal);
        if (progress < -12) return null;
        const laneBlocked = opponents.some(o => pointToSegment(o, player, p) < 1.2);
        const score = space * 0.8 + progress * 0.9 - dist * 0.05 - (laneBlocked ? 8 : 0);
        return { p, score };
      })
      .filter(option => option && option.score >= minimumScore)
      .sort((a, b) => b.score - a.score);
    return options[0]?.p || null;
  }

  // --- Ball -----------------------------------------------------------------

  takePossession(player) {
    this.ball.owner = player;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.lastTouch = player;
    if (player.isUser && player.role !== 'GK') this.controlled = player;
  }

  kickBall(player, angle, power) {
    this.ball.owner = null;
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.x = player.x + Math.cos(angle) * 0.9;
    this.ball.y = player.y + Math.sin(angle) * 0.9;
    this.lastTouch = player;
    player.kickCooldown = 0.45;
    this.sound?.kick(power / 30);
  }

  shoot(player, angle, power) {
    this.kickBall(player, angle, power);
    this.shots[player.side]++;
    this.sound?.crowdSwell(0.08, 1.2);
    this.onEvent('shot', { minute: this.matchMinute(), player: player.name, side: player.side });
  }

  passTo(player, target, powerScale = 1) {
    const dx = target.x + target.vx * 0.35 - player.x;
    const dy = target.y + target.vy * 0.35 - player.y;
    const dist = Math.hypot(dx, dy);
    const error = (1 - player.skill) * 0.12 * (player.isUser ? 0.5 : 1);
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * error;
    const power = clamp(4 + dist * 0.7, 8, 26) * powerScale;
    this.kickBall(player, angle, power);
    // Receivers are allowed to collect straight away.
    target.kickCooldown = 0;
  }

  attemptTackle(tackler, owner) {
    tackler.kickCooldown = 0.7;
    const chance = (tackler.isUser ? 0.5 : this.difficulty.tackle) * (0.5 + tackler.tackling * 0.5) * (1.1 - owner.skill * 0.5);
    if (Math.random() < chance) {
      this.ball.owner = null;
      const angle = Math.atan2(tackler.y - owner.y, tackler.x - owner.x) + (Math.random() - 0.5);
      this.ball.vx = Math.cos(angle) * 5;
      this.ball.vy = Math.sin(angle) * 5;
      owner.kickCooldown = 0.6;
      this.lastTouch = tackler;
      this.sound?.kick(0.2);
    }
  }

  updateBall(dt) {
    const ball = this.ball;
    if (ball.owner) {
      const o = ball.owner;
      ball.x = o.x + Math.cos(o.facing) * 0.9;
      ball.y = o.y + Math.sin(o.facing) * 0.9;
      ball.spin += Math.hypot(o.vx, o.vy) * dt;
      // An opponent brushing past can nick it.
      const opponent = nearestPlayer(this.players.filter(p => p.side !== o.side), ball);
      if (opponent && distance(opponent, ball) < 0.7 && opponent.kickCooldown <= 0 && o.kickCooldown <= 0 && Math.random() < 0.5) {
        this.attemptTackle(opponent, o);
      }
      return;
    }

    const speed = Math.hypot(ball.vx, ball.vy);
    const friction = Math.max(0, 1 - (0.35 + speed * 0.012) * dt);
    ball.vx *= friction;
    ball.vy *= friction;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.spin += speed * dt;

    // Collect loose balls: the nearest player within reach takes it. The reach
    // is wider than the player spacing so two players cannot stand either side
    // of the ball without anyone claiming it.
    // Goalkeepers deal with fast balls through their own save logic below.
    const candidates = this.players
      .filter(p => p.kickCooldown <= 0 && distance(p, ball) < 1.7 && !(p.role === 'GK' && speed > 10))
      .sort((a, b) => distance(a, ball) - distance(b, ball));
    // A pass belongs to the intended receiver unless the interceptor is clearly first to it.
    if (candidates.length > 1 && this.lastTouch) {
      const teammate = candidates.find(p => p.side === this.lastTouch.side);
      if (teammate && candidates[0] !== teammate && distance(candidates[0], ball) > distance(teammate, ball) * 0.6) {
        candidates.unshift(teammate);
      }
    }
    for (const player of candidates) {
      if (speed > 22 && Math.random() < 0.5) {
        player.kickCooldown = 0.3;
        continue;
      }
      this.takePossession(player);
      break;
    }
  }

  resolveCollisions() {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const a = this.players[i];
        const b = this.players[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 1.4) {
          const push = (1.4 - dist) / 2;
          a.x -= (dx / dist) * push;
          a.y -= (dy / dist) * push;
          b.x += (dx / dist) * push;
          b.y += (dy / dist) * push;
        }
      }
    }
  }

  checkBoundaries() {
    const ball = this.ball;
    if (ball.owner) return;
    const inGoalMouth = Math.abs(ball.y - PITCH.width / 2) < PITCH.goalWidth / 2;

    if (ball.x < 0 || ball.x > PITCH.length) {
      if (inGoalMouth) {
        const scoringSide = (ball.x < 0) === this.homeAttacksRight ? 'away' : 'home';
        this.goalScored(scoringSide);
        return;
      }
      const defendingSide = (ball.x < 0) === this.homeAttacksRight ? 'home' : 'away';
      const attackingSide = defendingSide === 'home' ? 'away' : 'home';
      if (this.lastTouch && this.lastTouch.side === attackingSide) {
        // Goal kick.
        const keeper = this.players.find(p => p.side === defendingSide && p.role === 'GK');
        this.restart(keeper, { x: ball.x < 0 ? 5.5 : PITCH.length - 5.5, y: PITCH.width / 2 }, 'Goal kick');
      } else {
        // Corner.
        const taker = nearestPlayer(this.players.filter(p => p.side === attackingSide && p.role !== 'GK'), ball);
        this.restart(taker, { x: ball.x < 0 ? 0.5 : PITCH.length - 0.5, y: ball.y < PITCH.width / 2 ? 0.5 : PITCH.width - 0.5 }, 'Corner');
      }
      return;
    }

    if (ball.y < 0 || ball.y > PITCH.width) {
      const side = this.lastTouch ? (this.lastTouch.side === 'home' ? 'away' : 'home') : 'home';
      const taker = nearestPlayer(this.players.filter(p => p.side === side && p.role !== 'GK'), ball);
      this.restart(taker, { x: clamp(ball.x, 1, PITCH.length - 1), y: ball.y < 0 ? 0.3 : PITCH.width - 0.3 }, 'Throw-in');
    }
  }

  restart(taker, spot, label) {
    this.ball.x = spot.x;
    this.ball.y = spot.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.owner = null;
    if (taker) {
      taker.x = spot.x;
      taker.y = spot.y;
      taker.kickCooldown = 0;
      this.takePossession(taker);
      // Push everyone else a little away from the ball.
      this.players.forEach(p => {
        if (p !== taker && distance(p, spot) < 3) {
          const angle = Math.atan2(p.y - spot.y, p.x - spot.x);
          p.x = clamp(spot.x + Math.cos(angle) * 3, 0.5, PITCH.length - 0.5);
          p.y = clamp(spot.y + Math.sin(angle) * 3, 0.5, PITCH.width - 0.5);
        }
      });
    }
    this.phase = 'restart';
    this.phaseTimer = 0.5;
    this.showMessage(label, 1);
  }

  goalScored(side) {
    this.score[side]++;
    const scorer = this.lastTouch && this.lastTouch.side === side ? this.lastTouch.name : 'Own goal';
    const minute = Math.max(1, this.matchMinute());
    this.scorers[side].push({ player: scorer, minute });
    this.concededSide = side === 'home' ? 'away' : 'home';
    this.phase = 'goal';
    this.phaseTimer = 2.6;
    this.ball.owner = null;
    this.ball.vx *= 0.1;
    this.ball.vy *= 0.1;
    this.showMessage(`GOAL! ${scorer}`, 2.6);
    this.sound?.goal();
    this.onEvent('goal', { minute, side, player: scorer, score: { ...this.score } });
  }

  // ---------------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------------

  draw() {
    const ctx = this.ctx;
    const { width, height } = this.view;
    ctx.clearRect(0, 0, width, height);
    this.drawSurround(ctx);
    this.drawPitch(ctx);
    this.drawGoals(ctx);

    const drawables = [...this.players.map(p => ({ y: p.y, p })), { y: this.ball.y, ball: true }].sort((a, b) => a.y - b.y);
    drawables.forEach(item => item.ball ? this.drawBall(ctx) : this.drawPlayer(ctx, item.p));

    this.drawScoreboard(ctx);
    if (this.message) this.drawMessage(ctx);
    if (this.paused) this.drawCentreText(ctx, 'Paused', 'Press P to resume');
  }

  drawSurround(ctx) {
    const { width, height } = this.view;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#14321c');
    gradient.addColorStop(1, '#0b2113');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Crowd: rows of tiny dots in muted colours around the pitch.
    const seed = 7;
    ctx.globalAlpha = 0.55;
    const colours = ['#c9c9c9', '#8e9fc1', '#c58f8f', '#d9c27a', '#9fbf9f'];
    const step = Math.max(5, this.view.scale * 1.3);
    for (let y = 2; y < height; y += step) {
      for (let x = 2; x < width; x += step) {
        const p = this.toScreen(0, 0);
        const q = this.toScreen(PITCH.length, PITCH.width);
        const insidePitch = x > p.x - step * 1.6 && x < q.x + step * 1.6 && y > p.y - step * 1.6 && y < q.y + step * 1.6;
        if (insidePitch) continue;
        const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1;
        ctx.fillStyle = colours[Math.floor(hash * colours.length)];
        ctx.beginPath();
        ctx.arc(x + (hash - 0.5) * 2, y + (hash * 7 % 1 - 0.5) * 2, step * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawPitch(ctx) {
    const s = this.view.scale;
    const o = this.toScreen(0, 0);
    const w = PITCH.length * s;
    const h = PITCH.width * s;

    // Mown stripes.
    const stripes = 14;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#3f9a4f' : '#378c47';
      ctx.fillRect(o.x + (w / stripes) * i, o.y, w / stripes + 1, h);
    }
    // Grass margin beyond the lines.
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = s * 2;
    ctx.strokeRect(o.x - s, o.y - s, w + s * 2, h + s * 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(1.5, s * 0.12);
    ctx.lineJoin = 'round';

    ctx.strokeRect(o.x, o.y, w, h);
    // Halfway line and centre circle.
    ctx.beginPath();
    ctx.moveTo(o.x + w / 2, o.y);
    ctx.lineTo(o.x + w / 2, o.y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(o.x + w / 2, o.y + h / 2, PITCH.centreRadius * s, 0, Math.PI * 2);
    ctx.stroke();
    this.spot(ctx, o.x + w / 2, o.y + h / 2);

    [0, 1].forEach(end => {
      const dir = end === 0 ? 1 : -1;
      const edgeX = end === 0 ? o.x : o.x + w;
      const midY = o.y + h / 2;
      // Penalty area.
      const boxW = PITCH.boxDepth * s;
      const boxH = PITCH.boxWidth * s;
      ctx.strokeRect(end === 0 ? edgeX : edgeX - boxW, midY - boxH / 2, boxW, boxH);
      // Six-yard box.
      const sixW = PITCH.sixYardDepth * s;
      const sixH = PITCH.sixYardWidth * s;
      ctx.strokeRect(end === 0 ? edgeX : edgeX - sixW, midY - sixH / 2, sixW, sixH);
      // Penalty spot and D.
      const spotX = edgeX + dir * PITCH.penaltySpot * s;
      this.spot(ctx, spotX, midY);
      ctx.beginPath();
      const dAngle = Math.acos((PITCH.boxDepth - PITCH.penaltySpot) / PITCH.centreRadius);
      if (end === 0) ctx.arc(spotX, midY, PITCH.centreRadius * s, -dAngle, dAngle);
      else ctx.arc(spotX, midY, PITCH.centreRadius * s, Math.PI - dAngle, Math.PI + dAngle);
      ctx.stroke();
      // Corner arcs.
      [o.y, o.y + h].forEach((cy, idx) => {
        ctx.beginPath();
        const start = end === 0 ? (idx === 0 ? 0 : -Math.PI / 2) : (idx === 0 ? Math.PI / 2 : Math.PI);
        ctx.arc(edgeX, cy, s, start, start + Math.PI / 2);
        ctx.stroke();
      });
    });
  }

  spot(ctx, x, y) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1.5, this.view.scale * 0.18), 0, Math.PI * 2);
    ctx.fill();
  }

  drawGoals(ctx) {
    const s = this.view.scale;
    const depth = 2.2 * s;
    const half = (PITCH.goalWidth / 2) * s;
    [0, 1].forEach(end => {
      const edge = this.toScreen(end === 0 ? 0 : PITCH.length, PITCH.width / 2);
      const x0 = end === 0 ? edge.x - depth : edge.x;
      // Net.
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x0, edge.y - half, depth, half * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      const mesh = Math.max(3, s * 0.45);
      for (let x = x0; x <= x0 + depth; x += mesh) {
        ctx.beginPath(); ctx.moveTo(x, edge.y - half); ctx.lineTo(x, edge.y + half); ctx.stroke();
      }
      for (let y = edge.y - half; y <= edge.y + half; y += mesh) {
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + depth, y); ctx.stroke();
      }
      // Posts and crossbar.
      ctx.strokeStyle = '#f4f4f4';
      ctx.lineWidth = Math.max(2, s * 0.2);
      ctx.strokeRect(x0, edge.y - half, depth, half * 2);
    });
  }

  drawPlayer(ctx, player) {
    const s = this.view.scale;
    const pos = this.toScreen(player.x, player.y);
    const kit = this.kits[player.side];
    const radius = Math.max(4, s * 0.85);

    // Shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(pos.x + radius * 0.25, pos.y + radius * 0.45, radius * 1.05, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Controlled player marker.
    if (player === this.controlled) {
      ctx.strokeStyle = '#ffe66d';
      ctx.lineWidth = Math.max(2, s * 0.22);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius * 1.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffe66d';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y - radius * 2.9);
      ctx.lineTo(pos.x - radius * 0.6, pos.y - radius * 3.7);
      ctx.lineTo(pos.x + radius * 0.6, pos.y - radius * 3.7);
      ctx.closePath();
      ctx.fill();
    }

    // Body: shirt with a contrasting sleeve band and a facing stripe.
    ctx.fillStyle = player.role === 'GK' ? kit.keeper : kit.shirt;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = player.role === 'GK' ? '#222' : kit.trim;
    ctx.lineWidth = Math.max(1.2, s * 0.14);
    ctx.stroke();

    // Shoulders / facing indicator.
    ctx.strokeStyle = kit.trim;
    ctx.lineWidth = Math.max(1.5, s * 0.2);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius * 0.72, player.facing - 0.9, player.facing + 0.9);
    ctx.stroke();

    // Head.
    ctx.fillStyle = '#f1c9a5';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = kit.hair;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - radius * 0.08, radius * 0.42, Math.PI, Math.PI * 2);
    ctx.fill();

    // Number below the player.
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `${Math.max(8, s * 0.65)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(String(player.number), pos.x, pos.y + radius * 1.1);
  }

  drawBall(ctx) {
    const s = this.view.scale;
    const pos = this.toScreen(this.ball.x, this.ball.y);
    const radius = Math.max(2.5, s * 0.42);
    const speed = Math.hypot(this.ball.vx, this.ball.vy);
    const lift = this.ball.owner ? 0 : Math.min(radius * 1.2, speed * 0.05 * s);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(pos.x + lift * 0.4, pos.y + radius * 0.5, radius, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const by = pos.y - lift;
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.arc(pos.x, by, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rotating pentagon panels.
    ctx.fillStyle = '#2b2b2b';
    for (let i = 0; i < 3; i++) {
      const angle = this.ball.spin * 0.8 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(pos.x + Math.cos(angle) * radius * 0.5, by + Math.sin(angle) * radius * 0.5, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawScoreboard(ctx) {
    const s = this.view.scale;
    const { width } = this.view;
    const h = Math.max(22, s * 3.2);
    const boardW = Math.min(width * 0.7, Math.max(320, s * 56));
    const x = (width - boardW) / 2;
    const y = Math.max(4, s * 0.8);

    ctx.fillStyle = 'rgba(8, 20, 12, 0.85)';
    roundRect(ctx, x, y, boardW, h, h / 2);
    ctx.fill();

    const font = Math.max(11, s * 1.35);
    ctx.font = `600 ${font}px "Segoe UI", system-ui, sans-serif`;
    ctx.textBaseline = 'middle';

    const swatch = h * 0.5;
    ctx.fillStyle = this.kits.home.shirt;
    roundRect(ctx, x + h * 0.4, y + h * 0.25, swatch, swatch, 3);
    ctx.fill();
    ctx.fillStyle = this.kits.away.shirt;
    roundRect(ctx, x + boardW - h * 0.4 - swatch, y + h * 0.25, swatch, swatch, 3);
    ctx.fill();

    const nameWidth = boardW / 2 - swatch - h * 0.4 - font * 2.4;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(fitText(ctx, this.homeTeam.name, nameWidth), x + h * 0.4 + swatch + 8, y + h / 2);
    ctx.textAlign = 'right';
    ctx.fillText(fitText(ctx, this.awayTeam.name, nameWidth), x + boardW - h * 0.4 - swatch - 8, y + h / 2);

    ctx.textAlign = 'center';
    ctx.font = `700 ${font * 1.15}px "Segoe UI", system-ui, sans-serif`;
    ctx.fillText(`${this.score.home}  -  ${this.score.away}`, x + boardW / 2, y + h / 2);

    // Clock pill under the board.
    const minute = this.matchMinute();
    const clock = this.phase === 'fullTime' ? 'FT' : this.phase === 'halfTime' ? 'HT' : `${String(minute).padStart(2, '0')}'`;
    ctx.font = `600 ${font * 0.9}px "Segoe UI", system-ui, sans-serif`;
    const pillW = font * 3.2;
    ctx.fillStyle = '#ffe66d';
    roundRect(ctx, x + boardW / 2 - pillW / 2, y + h + 3, pillW, font * 1.3, 4);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(clock, x + boardW / 2, y + h + 3 + font * 0.65);
  }

  drawMessage(ctx) {
    const { width, height } = this.view;
    const s = this.view.scale;
    const font = Math.max(16, s * 2.6);
    ctx.font = `800 ${font}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textW = ctx.measureText(this.message).width + font * 1.2;
    ctx.fillStyle = 'rgba(8, 20, 12, 0.8)';
    roundRect(ctx, width / 2 - textW / 2, height / 2 - font * 0.9, textW, font * 1.8, font * 0.5);
    ctx.fill();
    ctx.fillStyle = this.message.startsWith('GOAL') ? '#ffe66d' : '#ffffff';
    ctx.fillText(this.message, width / 2, height / 2);
  }

  drawCentreText(ctx, title, subtitle) {
    const { width, height } = this.view;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.max(20, this.view.scale * 3.2)}px "Segoe UI", system-ui, sans-serif`;
    ctx.fillText(title, width / 2, height / 2 - 14);
    ctx.font = `500 ${Math.max(12, this.view.scale * 1.5)}px "Segoe UI", system-ui, sans-serif`;
    ctx.fillText(subtitle, width / 2, height / 2 + 18);
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sortForFormation(players) {
  const order = { GK: 0, CB: 1, LB: 1, RB: 1, DM: 2, CM: 2, AM: 2, LW: 3, RW: 3, ST: 3 };
  const buckets = [[], [], [], []];
  players.forEach(p => buckets[order[p.position] ?? 2].push(p));
  const slotsPerRole = [1, 4, 3, 3];
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

export function buildKit(primary, clashWith) {
  let shirt = normaliseColour(primary) || '#c0392b';
  if (clashWith && colourDistance(shirt, normaliseColour(clashWith)) < 90) {
    shirt = luminance(shirt) > 0.5 ? '#1f2a44' : '#f2f2f2';
  }
  const light = luminance(shirt) > 0.55;
  return {
    shirt,
    trim: light ? '#222222' : '#ffffff',
    keeper: light ? '#f39c12' : '#2ecc71',
    hair: '#3b2a1d'
  };
}

function normaliseColour(colour) {
  if (!colour) return null;
  let c = colour.trim();
  if (/^#[0-9a-f]{3}$/i.test(c)) c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase();
  return null;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colourDistance(a, b) {
  if (!a || !b) return 999;
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) trimmed = trimmed.slice(0, -1);
  return `${trimmed.trimEnd()}…`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function nearestPlayer(players, point) {
  let best = null;
  let bestDist = Infinity;
  for (const p of players) {
    const d = distance(p, point);
    if (d < bestDist) { best = p; bestDist = d; }
  }
  return best;
}

function pointToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq, 0, 1);
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function angleDiff(a, b) {
  let d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
