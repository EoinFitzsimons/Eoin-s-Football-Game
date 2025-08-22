import { LANGUAGE_GROUPS } from './team_names.js';
import { loadThreeJs } from './three_loader.js';

// --- Main Menu and Team Selection Logic ---

// Language group selection
let selectedLanguage = "English";
let selectedColor = "#f39c12";
let playerNames = getRandomizedNames(LANGUAGE_GROUPS[selectedLanguage]);
let cpuLanguage = "Spanish";
let cpuColor = "#e74c3c";
let cpuNames = getRandomizedNames(LANGUAGE_GROUPS[cpuLanguage]);


document.addEventListener('DOMContentLoaded', () => {
	// Declare all DOM elements once, before any usage
	const mainMenu = document.getElementById("mainMenu");
	const languageSelect = document.getElementById("languageSelect");
	const mainMenuColor = document.getElementById("mainMenuColor");
	const cpuLanguageSelect = document.getElementById("cpuLanguageSelect");
	const cpuMenuColor = document.getElementById("cpuMenuColor");
	if (!mainMenu || !languageSelect || !mainMenuColor || !cpuLanguageSelect || !cpuMenuColor) return;

	// Dynamically populate language selectors
	languageSelect.innerHTML = '';
	cpuLanguageSelect.innerHTML = '';
	Object.keys(LANGUAGE_GROUPS).forEach(lang => {
		const opt1 = document.createElement('option');
		opt1.value = lang;
		opt1.textContent = lang;
		languageSelect.appendChild(opt1);
		const opt2 = document.createElement('option');
		opt2.value = lang;
		opt2.textContent = lang;
		cpuLanguageSelect.appendChild(opt2);
	});
	languageSelect.value = selectedLanguage;
	cpuLanguageSelect.value = cpuLanguage;

	// --- Main Menu and Team Selection Logic ---
	function handleLanguageChange(e, isUser) {
		if (isUser) {
			selectedLanguage = e.target.value;
			playerNames = getRandomizedNames(LANGUAGE_GROUPS[selectedLanguage]);
			if (cpuLanguage === selectedLanguage) {
				for (let l in LANGUAGE_GROUPS) {
					if (l !== selectedLanguage) {
						cpuLanguage = l;
						cpuLanguageSelect.value = l;
						cpuNames = getRandomizedNames(LANGUAGE_GROUPS[l]);
						break;
					}
				}
			}
		} else {
			cpuLanguage = e.target.value;
			cpuNames = getRandomizedNames(LANGUAGE_GROUPS[cpuLanguage]);
			if (cpuLanguage === selectedLanguage) {
				for (let l in LANGUAGE_GROUPS) {
					if (l !== cpuLanguage) {
						selectedLanguage = l;
						languageSelect.value = l;
						playerNames = getRandomizedNames(LANGUAGE_GROUPS[l]);
						break;
					}
				}
			}
		}
	}
	languageSelect.onchange = (e) => handleLanguageChange(e, true);
	cpuLanguageSelect.onchange = (e) => handleLanguageChange(e, false);

	mainMenuColor.oninput = (e) => {
		selectedColor = e.target.value;
	};
	cpuMenuColor.oninput = (e) => {
		cpuColor = e.target.value;
	};
	document.getElementById("startGameBtn").onclick = () => {
		mainMenu.style.display = "none";
		startGameWithTeam(
			selectedLanguage,
			selectedColor,
			playerNames,
			cpuLanguage,
			cpuColor,
			cpuNames
		);
		function trySetupPauseMenu(retries = 10) {
			if (window.game && typeof window.game.setupPauseMenu === 'function') {
				window.game.setupPauseMenu();
				if (!window.game.pauseMenuSetupDone && retries > 0) {
					setTimeout(() => trySetupPauseMenu(retries - 1), 50);
				}
			}
		}
		trySetupPauseMenu();
	};

	// --- Gameplay Engine: Load Three.js and Start Game ---
	loadThreeJs((THREE) => {
		// --- Vector Math Helpers ---
		class VectorHelper {
			static toBall(player, ball) {
				return new THREE.Vector3(
					ball.position.x - player.position.x,
					0,
					ball.position.z - player.position.z
				);
			}
			static toPlayer(from, to) {
				return new THREE.Vector3(
					to.position.x - from.position.x,
					0,
					to.position.z - from.position.z
				);
			}
			static getNearestTeammate(playerIdx, players) {
				let minDist = Infinity, idx = -1;
				for (let i = 0; i < players.length; ++i) {
					if (i === playerIdx) continue;
					let d = players[playerIdx].position.distanceTo(players[i].position);
					if (d < minDist) {
						minDist = d;
						idx = i;
					}
				}
				return idx !== -1 ? players[idx] : null;
			}
			static getFarthestTeammate(playerIdx, players) {
				let maxDist = -1, idx = -1;
				for (let i = 0; i < players.length; ++i) {
					if (i === playerIdx) continue;
					let d = players[playerIdx].position.distanceTo(players[i].position);
					if (d > maxDist) {
						maxDist = d;
						idx = i;
					}
				}
				return idx !== -1 ? players[idx] : null;
			}
			static getPlayerMovementDir(player) {
				if (typeof player.lastPos === 'object') {
					let dx = player.position.x - player.lastPos.x;
					let dz = player.position.z - player.lastPos.z;
					let len = Math.sqrt(dx*dx + dz*dz);
					if (len > 0.01) return {dx: dx/len, dz: dz/len};
				}
				return {dx: 0, dz: 1};
			}
		}

		// --- Player Class ---
		class Player {
			constructor(color, x, z, name, isKeeper = false) {
				const geo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16);
				const mat = new THREE.MeshStandardMaterial({ color });
				this.mesh = new THREE.Mesh(geo, mat);
				this.mesh.position.set(x, 1.1, z);
				this.mesh.castShadow = true;
				this.mesh.receiveShadow = true;
				this.mesh.name = name;
				this.mesh.displayName = name;
				this.mesh.isKeeper = isKeeper;
				this.position = this.mesh.position;
				this.vel = {x:0, z:0};
				this.lastPos = {x: x, z: z};
				this.name = name;
				this.isKeeper = isKeeper;
			}
		}

		// --- Team Class ---
		class Team {
			constructor(names, color, formation, keeperColor) {
				this.players = [];
				for (let i = 0; i < 11; ++i) {
					const name = names[i] || `Player ${i+1}`;
					const isKeeper = i === 0;
					const player = new Player(isKeeper ? keeperColor : color, formation[i][0], formation[i][1], name, isKeeper);
					this.players.push(player);
				}
			}
			forEach(fn) { this.players.forEach(fn); }
		}

		// --- Ball Class ---
		class Ball {
			constructor() {
				const geo = new THREE.SphereGeometry(0.7, 32, 32);
				const mat = new THREE.MeshStandardMaterial({ color: 0xf7f7f7 });
				this.mesh = new THREE.Mesh(geo, mat);
				this.mesh.position.set(0, 0.7, 0);
				this.position = this.mesh.position;
				this.vel = new THREE.Vector3(0, 0, 0);
			}
			update(dt, pitchLength, pitchWidth) {
				// Ball physics: inertia, friction, rolling, height
				if (!this.vel.x) this.vel.x = 0;
				if (!this.vel.z) this.vel.z = 0;
				if (!this.vel.y) this.vel.y = 0;
				this.position.x += this.vel.x * dt;
				this.position.z += this.vel.z * dt;
				this.position.y += this.vel.y * dt;
				// Friction
				this.vel.x *= 0.98;
				this.vel.z *= 0.98;
				// Gravity for height
				if (this.position.y > 0.7 || this.vel.y > 0) {
					this.vel.y -= 25 * dt;
				}
				// Clamp to pitch
				this.position.x = Math.max(-pitchLength/2+1, Math.min(pitchLength/2-1, this.position.x));
				this.position.z = Math.max(-pitchWidth/2+1, Math.min(pitchWidth/2-1, this.position.z));
				// Ball hits ground
				if (this.position.y <= 0.7) {
					this.position.y = 0.7;
					if (this.vel.y < 0) this.vel.y *= -0.3; // Small bounce
					if (Math.abs(this.vel.y) < 2) this.vel.y = 0;
				}
				// Stop if slow
				if (Math.sqrt(this.vel.x*this.vel.x + this.vel.z*this.vel.z) < 0.1 && Math.abs(this.vel.y) < 0.1) {
					this.vel.x = 0;
					this.vel.z = 0;
					this.vel.y = 0;
				}
			}
		}

		// --- Camera Controller ---
		class CameraController {
			constructor(camera, userPlayers) {
				this.camera = camera;
				this.userPlayers = userPlayers;
				this.controlledIdx = 0;
				this.cameraTarget = { x: 0, y: 40, z: 40 };
			}
			update() {
				const p = this.userPlayers[this.controlledIdx].mesh;
				const camHeight = 38;
				const camDistance = 38;
				const {dx, dz} = VectorHelper.getPlayerMovementDir(p);
				const desired = {
					x: p.position.x - dx * camDistance,
					y: camHeight,
					z: p.position.z - dz * camDistance
				};
				this.cameraTarget.x += (desired.x - this.cameraTarget.x) * 0.18;
				this.cameraTarget.y += (desired.y - this.cameraTarget.y) * 0.18;
				this.cameraTarget.z += (desired.z - this.cameraTarget.z) * 0.18;
				this.camera.position.set(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
				this.camera.lookAt(p.position.x, 0, p.position.z);
				if (!p.lastPos) p.lastPos = {x: p.position.x, z: p.position.z};
				p.lastPos.x = p.position.x;
				p.lastPos.z = p.position.z;
			}
		}

		// --- Main Game Class ---
		class Game {
			constructor(THREE, playerNames, cpuNames, userColor, cpuColor, keeperColor, cpuKeeperColor, userFormation, cpuFormation) {
				this.THREE = THREE;
				this.width = window.innerWidth;
				this.height = window.innerHeight;
				this.scene = new THREE.Scene();
				this.scene.background = new THREE.Color(0x1e824c);
				this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
				this.camera.position.set(0, 60, 90);
				this.camera.lookAt(0, 0, 0);
				this.renderer = new THREE.WebGLRenderer({ antialias: true });
				this.renderer.setSize(this.width, this.height);
				this.renderer.setClearColor(0x1e824c);
				this.renderer.domElement.style.position = 'fixed';
				this.renderer.domElement.style.top = '0';
				this.renderer.domElement.style.left = '0';
				this.renderer.domElement.style.zIndex = '0';
				document.body.appendChild(this.renderer.domElement);

				// Pitch
				this.pitchLength = 105;
				this.pitchWidth = 68;
				const pitchGeo = new THREE.PlaneGeometry(this.pitchLength, this.pitchWidth);
				const pitchMat = new THREE.MeshLambertMaterial({ color: 0x229954 });
				const pitch = new THREE.Mesh(pitchGeo, pitchMat);
				pitch.rotation.x = -Math.PI / 2;
				this.scene.add(pitch);

				// Pitch lines
				const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
				const addLine = (points) => {
					const geo = new THREE.BufferGeometry().setFromPoints(points);
					const line = new THREE.Line(geo, lineMat);
					this.scene.add(line);
				};
				addLine([
					new THREE.Vector3(-this.pitchLength/2, 0.01, -this.pitchWidth/2),
					new THREE.Vector3(-this.pitchLength/2, 0.01, this.pitchWidth/2),
					new THREE.Vector3(this.pitchLength/2, 0.01, this.pitchWidth/2),
					new THREE.Vector3(this.pitchLength/2, 0.01, -this.pitchWidth/2),
					new THREE.Vector3(-this.pitchLength/2, 0.01, -this.pitchWidth/2)
				]);
				addLine([
					new THREE.Vector3(0, 0.01, -this.pitchWidth/2),
					new THREE.Vector3(0, 0.01, this.pitchWidth/2)
				]);
				const circleGeo = new THREE.RingGeometry(9.15-0.1, 9.15+0.1, 64);
				const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
				const circle = new THREE.Mesh(circleGeo, circleMat);
				circle.position.y = 0.011;
				circle.rotation.x = -Math.PI/2;
				this.scene.add(circle);

				// Lighting
				const amb = new THREE.AmbientLight(0xffffff, 0.7);
				this.scene.add(amb);
				const dir = new THREE.DirectionalLight(0xffffff, 0.7);
				dir.position.set(0, 100, 50);
				this.scene.add(dir);

				// Ball
				this.ball = new Ball();
				this.scene.add(this.ball.mesh);

				// Teams
				this.userTeam = new Team(playerNames, userColor, userFormation, keeperColor);
				this.cpuTeam = new Team(cpuNames, cpuColor, cpuFormation, cpuKeeperColor);
				this.userTeam.forEach(p => this.scene.add(p.mesh));
				this.cpuTeam.forEach(p => this.scene.add(p.mesh));

				// Camera controller
				this.cameraController = new CameraController(this.camera, this.userTeam.players);

				// Input
				this.keys = {};
				window.addEventListener('keydown', e => { this.keys[e.key.toLowerCase()] = true; });
				window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });

				// Game state
				this.last = performance.now();
				this.running = true;
				this.animate = this.animate.bind(this);
				this.animate();
			}

			animate() {
				if (!this.running) return;
				const now = performance.now();
				const dt = Math.min((now - this.last) / 1000, 0.05);
				this.last = now;
				this.update(dt);
				this.renderer.render(this.scene, this.camera);
				requestAnimationFrame(this.animate);
			}

			update(dt) {
				this.handlePlayerControl(dt);
				this.handleCpuAI(dt);
				this.ball.update(dt, this.pitchLength, this.pitchWidth);
				this.cameraController.update();
			}

				handlePlayerControl(dt) {
					// --- FIFA/PES-style movement and ball control ---
					let controlledIdx = this.cameraController.controlledIdx;
					let keys = this.keys;
					let userPlayers = this.userTeam.players;
					// let cpuPlayers = this.cpuTeam.players; // Removed unused variable
					let ball = this.ball;
					let p = userPlayers[controlledIdx];
					if (!p.vel) p.vel = {x:0, z:0};
					let dx = 0, dz = 0;
					if (keys['arrowup'] || keys['w']) dz -= 1;
					if (keys['arrowdown'] || keys['s']) dz += 1;
					if (keys['arrowleft'] || keys['a']) dx -= 1;
					if (keys['arrowright'] || keys['d']) dx += 1;
					let moving = dx !== 0 || dz !== 0;
					let sprinting = keys['shift'];
					let sprintMultiplier = sprinting ? 1.7 : 1.0;
					let maxSpeed = 18 * sprintMultiplier;
					const accel = 60;
					const friction = 30;
					if (moving) {
						const len = Math.sqrt(dx*dx+dz*dz);
						dx /= len; dz /= len;
						// Accelerate
						p.vel.x += dx * accel * dt;
						p.vel.z += dz * accel * dt;
						// Clamp speed
						const vlen = Math.sqrt(p.vel.x*p.vel.x + p.vel.z*p.vel.z);
						if (vlen > maxSpeed) {
							p.vel.x = (p.vel.x/vlen) * maxSpeed;
							p.vel.z = (p.vel.z/vlen) * maxSpeed;
						}
					} else {
						// Decelerate
						const vlen = Math.sqrt(p.vel.x*p.vel.x + p.vel.z*p.vel.z);
						if (vlen > 0) {
							let decel = Math.min(friction*dt, vlen);
							p.vel.x -= (p.vel.x/vlen) * decel;
							p.vel.z -= (p.vel.z/vlen) * decel;
						}
					}
					// Move player
					p.position.x += p.vel.x * dt;
					p.position.z += p.vel.z * dt;
					// Drain fitness if sprinting
					if (sprinting && window.gameStats && window.gameStats.fitness) {
						let id = `0_${controlledIdx}`;
						if (window.gameStats.fitness[id]) {
							window.gameStats.fitness[id] = Math.max(0, window.gameStats.fitness[id] - 0.25);
						}
					}
					// --- Ball control (dribbling) ---
					const dist = p.position.distanceTo(ball.position);
					if (dist < 2.2) {
						// If moving slowly, keep ball close (dribble)
						const vlen = Math.sqrt(p.vel.x*p.vel.x + p.vel.z*p.vel.z);
						if (vlen < 10) {
							// Ball sticks to player's front
							const desired = new this.THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(1.5);
							ball.position.x = p.position.x + desired.x;
							ball.position.z = p.position.z + desired.z;
							// Ball velocity matches player
							ball.vel.x = p.vel.x;
							ball.vel.z = p.vel.z;
						} else {
							// If sprinting, push ball ahead
							const push = new this.THREE.Vector3(p.vel.x, 0, p.vel.z).normalize().multiplyScalar(4.5);
							ball.vel.x = push.x;
							ball.vel.z = push.z;
						}
					}
					// --- Manual player switching: Tab or Q ---
					if ((keys['tab'] || keys['q']) && !window._switchCooldown) {
						this.cameraController.controlledIdx = (controlledIdx + 1) % userPlayers.length;
						window._switchCooldown = 0.3;
					}
					if (window._switchCooldown) {
						window._switchCooldown = Math.max(0, window._switchCooldown - dt);
					}
					// ...additional gameplay logic (tackling, passing, shooting, etc.) can be added here as needed...
				}

				handleCpuAI(dt) {
					// --- Simple CPU AI: move first CPU player toward ball ---
					let cpu = this.cpuTeam.players[0];
					let userPlayers = this.userTeam.players;
					let ball = this.ball;
					const dir = new this.THREE.Vector3(
						ball.position.x - cpu.position.x,
						0,
						ball.position.z - cpu.position.z
					);
					if (dir.length() > 2) {
						dir.normalize();
						cpu.position.x += dir.x * 12 * dt;
						cpu.position.z += dir.z * 12 * dt;
					} else {
						// Kick ball away
						const away = new this.THREE.Vector3(
							userPlayers[0].position.x - cpu.position.x,
							0,
							userPlayers[0].position.z - cpu.position.z
						).normalize();
						ball.vel.add(away.multiplyScalar(16));
					}
					// ...additional CPU AI logic can be added here as needed...
				}

			getPossession() {
				// 0 if user closer, 1 if cpu closer
				const userDist = this.userTeam.players[this.cameraController.controlledIdx].position.distanceTo(this.ball.position);
				const cpuDist = this.cpuTeam.players[0].position.distanceTo(this.ball.position);
				return { teamIdx: userDist < cpuDist ? 0 : 1 };
			}

			get teams() {
				return [
					{ players: this.userTeam.players, formationType: '442' },
					{ players: this.cpuTeam.players, formationType: '442' }
				];
			}

		// setupPauseMenu intentionally left blank for now (required by interface)
			get pauseMenuSetupDone() { return true; }
		}

		// --- Game Setup ---
		const userFormation = [
			[-45,0], [-30,12], [-30,-12], [-15,20], [-15,-20], [0,10], [0,-10], [15,10], [15,-10], [30,5], [30,-5]
		];
		const cpuFormation = userFormation.map(([x,z])=>[-x,-z]);
		const userColorInt = parseInt(selectedColor.replace('#','0x'));
		const cpuColorInt = parseInt(cpuColor.replace('#','0x'));
		const keeperColor = 0x1abc9c;
		const cpuKeeperColor = 0xf1c40f;
		const game = new Game(
			THREE,
			playerNames,
			cpuNames,
			userColorInt,
			cpuColorInt,
			keeperColor,
			cpuKeeperColor,
			userFormation,
			cpuFormation
		);
		window.game = game;
	});
});


// --- Utility Class for Names ---
class NameUtils {
	static getRandomizedNames(namesArr) {
		let arr = namesArr.slice();
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr.slice(0, 11);
	}
}

// --- Live Game Stats Tracking ---
class StatsManager {
	constructor(game) {
		this.game = game;
		this.stats = {
			possession: [0, 0],
			shots: [0, 0],
			shotsOnTarget: [0, 0],
			passes: [0, 0],
			fouls: [0, 0],
			corners: [0, 0],
			saves: [0, 0],
			tackles: [0, 0],
			events: [],
			playerStats: {},
			playerPositions: {},
			fitness: {},
			passingNetwork: {},
			keeperStats: [
				{ saves: 0, passes: 0 },
				{ saves: 0, passes: 0 },
			],
			referee: { cards: [], fouls: [] },
		};
		this.setupIntervals();
		window.statsManager = this; // For debugging/UI
	}
	setupIntervals() {
		setInterval(() => this.updateStats(), 1000);
		setInterval(() => this.updateMatchStatsPanel(), 1000);
		setInterval(() => this.updateEventFeedPanel(), 1000);
		setInterval(() => this.updatePlayerComparePanel(), 1000);
		setInterval(() => this.updateHeatmapPanel(), 2000);
		setInterval(() => this.updateTacticsPanel(), 2000);
		setInterval(() => this.updateBenchPanel(), 2000);
		setInterval(() => this.updateFitnessPanel(), 1000);
		setInterval(() => this.updatePassingPanel(), 2000);
		setInterval(() => this.updateKeeperPanel(), 2000);
		setInterval(() => this.updateRefPanel(), 2000);
	}
	updateStats() {
		if (!this.game) return;
		let poss = this.game.getPossession?.();
		if (poss) this.stats.possession[poss.teamIdx]++;
		for (let t = 0; t < 2; ++t) {
			if (!this.game.teams) continue;
			this.game.teams[t].players.forEach((p, i) => {
				let id = `${t}_${i}`;
				if (!this.stats.fitness[id]) this.stats.fitness[id] = 100;
				this.stats.fitness[id] = Math.max(0, this.stats.fitness[id] - 0.01);
				if (!this.stats.playerPositions[id]) this.stats.playerPositions[id] = [];
				this.stats.playerPositions[id].push({
					x: p.mesh.position.x,
					z: p.mesh.position.z,
				});
				if (this.stats.playerPositions[id].length > 200)
					this.stats.playerPositions[id].shift();
			});
		}
	}
	updateMatchStatsPanel() {
		const el = document.getElementById("matchStatsContent");
		if (!el) return;
		const s = this.stats;
		const totalPoss = s.possession[0] + s.possession[1] || 1;
		el.innerHTML = `
			<b>Possession</b>: <span style='color:#f39c12;'>${Math.round(
				(100 * s.possession[0]) / totalPoss
			)}%</span> - <span style='color:#e74c3c;'>${Math.round(
			(100 * s.possession[1]) / totalPoss
		)}%</span><br>
			<b>Shots</b>: ${s.shots[0]} - ${s.shots[1]}<br>
			<b>Passes</b>: ${s.passes[0]} - ${s.passes[1]}<br>
			<b>Fouls</b>: ${s.fouls[0]} - ${s.fouls[1]}<br>
			<b>Corners</b>: ${s.corners[0]} - ${s.corners[1]}<br>
			<b>Saves</b>: ${s.saves[0]} - ${s.saves[1]}<br>
			<b>Tackles</b>: ${s.tackles[0]} - ${s.tackles[1]}<br>
		`;
	}
	updateEventFeedPanel() {
		const el = document.getElementById("eventFeedContent");
		if (!el) return;
		const events = this.stats.events;
		el.innerHTML =
			events
				.slice(-20)
				.map((e) => `<div>${e}</div>`)
				.join("") || "(No events yet)";
	}
	updatePlayerComparePanel() {
		const el = document.getElementById("playerCompareContent");
		if (!el || !this.game?.teams?.[0]?.players || this.game.teams[0].players.length < 2) {
			if (el) el.innerHTML = "(Compare two players)";
			return;
		}
		const p1 = this.game.teams[0].players[0];
		const p2 = this.game.teams[0].players[1];
		el.innerHTML = `
			<b>${p1.displayName}</b> vs <b>${p2.displayName}</b><br>
			<b>Fitness</b>: ${this.stats.fitness["0_0"]?.toFixed(1)} - ${this.stats.fitness["0_1"]?.toFixed(1)}<br>
			<b>Distance</b>: ${
				(this.stats.playerPositions["0_0"]?.length || 0) / 10
			}m - ${
				(this.stats.playerPositions["0_1"]?.length || 0) / 10
			}m<br>
		`;
	}
	updateHeatmapPanel() {
		const el = document.getElementById("heatmapContent");
		if (!el) return;
		el.innerHTML = "(Heatmap coming soon)";
	}
	updateTacticsPanel() {
		const el = document.getElementById("tacticsContent");
		if (!el || !this.game || !this.game.teams || !this.game.teams[0] || !this.game.teams[1]) return;
		el.innerHTML = `
			<b>Home Formation:</b> ${this.game.teams[0].formationType}<br>
			<b>Away Formation:</b> ${this.game.teams[1].formationType}<br>
			(Tactical instructions coming soon)
		`;
	}
	updateBenchPanel() {
		const el = document.getElementById("benchContent");
		if (!el) return;
		el.innerHTML = "(No substitutes implemented yet)";
	}
	updateFitnessPanel() {
		const el = document.getElementById("fitnessContent");
		if (!el || !this.game || !this.game.teams || !this.game.teams[0]) return;
		let html = '<table style="width:100%">';
		for (let i = 0; i < this.game.teams?.[0]?.players?.length; ++i) {
			let p = this.game.teams[0].players[i];
			let id = `0_${i}`;
			html += `<tr><td style='color:#fff;'>${
				p.displayName
			}</td><td style='color:#ffd700;text-align:center;'>${this.stats.fitness[
				id
			]?.toFixed(1)}</td></tr>`;
		}
		html += "</table>";
		el.innerHTML = html;
	}
	updatePassingPanel() {
		const el = document.getElementById("passingContent");
		if (!el) return;
		el.innerHTML = "(Passing network coming soon)";
	}
	updateKeeperPanel() {
		const el = document.getElementById("keeperContent");
		if (!el) return;
		el.innerHTML = `
			<b>Home Saves:</b> ${this.stats.keeperStats?.[0]?.saves}<br>
			<b>Away Saves:</b> ${this.stats.keeperStats?.[1]?.saves}<br>
			(Saves map coming soon)
		`;
	}
	updateRefPanel() {
		const el = document.getElementById("refContent");
		if (!el) return;
		el.innerHTML = `
			<b>Cards:</b> ${this.stats.referee.cards.length}<br>
			<b>Fouls:</b> ${this.stats.referee.fouls.length}<br>
		`;
	}
	// Modern Stats Panels Logic
	setupPanel(openBtnId, panelId, closeBtnId) {
		const openBtn = document.getElementById(openBtnId);
		const panel = document.getElementById(panelId);
		const closeBtn = document.getElementById(closeBtnId);
		if (openBtn && panel && closeBtn) {
			openBtn.onclick = () => {
				panel.style.display = "block";
			};
			closeBtn.onclick = () => {
				panel.style.display = "none";
			};
		}
	}
}

// --- App Class: Entry Point ---
class App {
	constructor() {
		this.selectedLanguage = "English";
		this.selectedColor = "#f39c12";
		this.playerNames = NameUtils.getRandomizedNames(LANGUAGE_GROUPS[this.selectedLanguage]);
		this.cpuLanguage = "Spanish";
		this.cpuColor = "#e74c3c";
		this.cpuNames = NameUtils.getRandomizedNames(LANGUAGE_GROUPS[this.cpuLanguage]);
		this.game = null;
		this.statsManager = null;
		document.addEventListener('DOMContentLoaded', () => this.initUI());
	}

	initUI() {
		const mainMenu = document.getElementById("mainMenu");
		const languageSelect = document.getElementById("languageSelect");
		const mainMenuColor = document.getElementById("mainMenuColor");
		const cpuLanguageSelect = document.getElementById("cpuLanguageSelect");
		const cpuMenuColor = document.getElementById("cpuMenuColor");
		if (!mainMenu || !languageSelect || !mainMenuColor || !cpuLanguageSelect || !cpuMenuColor) return;

		// Populate selectors
		languageSelect.innerHTML = '';
		cpuLanguageSelect.innerHTML = '';
		Object.keys(LANGUAGE_GROUPS).forEach(lang => {
			const opt1 = document.createElement('option');
			opt1.value = lang;
			opt1.textContent = lang;
			languageSelect.appendChild(opt1);
			const opt2 = document.createElement('option');
			opt2.value = lang;
			opt2.textContent = lang;
			cpuLanguageSelect.appendChild(opt2);
		});
		languageSelect.value = this.selectedLanguage;
		cpuLanguageSelect.value = this.cpuLanguage;

		languageSelect.onchange = (e) => this.handleLanguageChange(e, true);
		cpuLanguageSelect.onchange = (e) => this.handleLanguageChange(e, false);
		mainMenuColor.oninput = (e) => { this.selectedColor = e.target.value; };
		cpuMenuColor.oninput = (e) => { this.cpuColor = e.target.value; };
		document.getElementById("startGameBtn").onclick = () => {
			mainMenu.style.display = "none";
			this.startGameWithTeam();
			this.trySetupPauseMenu();
		};
	}

	handleLanguageChange(e, isUser) {
		if (isUser) {
			this.selectedLanguage = e.target.value;
			this.playerNames = NameUtils.getRandomizedNames(LANGUAGE_GROUPS[this.selectedLanguage]);
			if (this.cpuLanguage === this.selectedLanguage) {
				for (let l in LANGUAGE_GROUPS) {
					if (l !== this.selectedLanguage) {
						this.cpuLanguage = l;
						document.getElementById("cpuLanguageSelect").value = l;
						this.cpuNames = NameUtils.getRandomizedNames(LANGUAGE_GROUPS[l]);
						break;
					}
				}
			}
		} else {
			this.cpuLanguage = e.target.value;
			this.cpuNames = NameUtils.getRandomizedNames(LANGUAGE_GROUPS[this.cpuLanguage]);
			if (this.cpuLanguage === this.selectedLanguage) {
				for (let l in LANGUAGE_GROUPS) {
					if (l !== this.cpuLanguage) {
						this.selectedLanguage = l;
						document.getElementById("languageSelect").value = l;
						this.playerNames = NameUtils.getRandomizedNames(LANGUAGE_GROUPS[l]);
						break;
					}
				}
			}
		}
	}

	startGameWithTeam() {
		loadThreeJs((THREE) => {
			const userFormation = [
				[-45,0], [-30,12], [-30,-12], [-15,20], [-15,-20], [0,10], [0,-10], [15,10], [15,-10], [30,5], [30,-5]
			];
			const cpuFormation = userFormation.map(([x,z])=>[-x,-z]);
			const userColorInt = parseInt(this.selectedColor.replace('#','0x'));
			const cpuColorInt = parseInt(this.cpuColor.replace('#','0x'));
			const keeperColor = 0x1abc9c;
			const cpuKeeperColor = 0xf1c40f;
			this.game = new Game(
				THREE,
				this.playerNames,
				this.cpuNames,
				userColorInt,
				cpuColorInt,
				keeperColor,
				cpuKeeperColor,
				userFormation,
				cpuFormation
			);
			window.game = this.game;
			this.statsManager = new StatsManager(this.game);
			window.gameStats = this.statsManager.stats;
			this.setupPanels();
			this.preventArrowScroll();
		});
	}

	trySetupPauseMenu(retries = 10) {
		if (window.game && typeof window.game.setupPauseMenu === 'function') {
			window.game.setupPauseMenu();
			if (!window.game.pauseMenuSetupDone && retries > 0) {
				setTimeout(() => this.trySetupPauseMenu(retries - 1), 50);
			}
		}
	}

	setupPanels() {
		const sm = this.statsManager;
		sm.setupPanel("openMatchStatsBtn", "matchStatsPanel", "closeMatchStatsBtn");
		sm.setupPanel("openEventFeedBtn", "eventFeedPanel", "closeEventFeedBtn");
		sm.setupPanel("openPlayerCompareBtn", "playerComparePanel", "closePlayerCompareBtn");
		sm.setupPanel("openHeatmapBtn", "heatmapPanel", "closeHeatmapBtn");
		sm.setupPanel("openTacticsBtn", "tacticsPanel", "closeTacticsBtn");
		sm.setupPanel("openBenchBtn", "benchPanel", "closeBenchBtn");
		sm.setupPanel("openFitnessBtn", "fitnessPanel", "closeFitnessBtn");
		sm.setupPanel("openPassingBtn", "passingPanel", "closePassingBtn");
		sm.setupPanel("openKeeperBtn", "keeperPanel", "closeKeeperBtn");
		sm.setupPanel("openRefBtn", "refPanel", "closeRefBtn");
	}

	preventArrowScroll() {
		window.addEventListener(
			"keydown",
			function (e) {
				if (
					[
						"ArrowUp",
						"ArrowDown",
						"ArrowLeft",
						"ArrowRight",
						" ",
						"Spacebar",
					].includes(e.key)
				) {
					e.preventDefault();
				}
			},
			{ passive: false }
		);
	}
}

// --- App Entry Point ---
window.app = new App();
