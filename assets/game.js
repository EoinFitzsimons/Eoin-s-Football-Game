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
	// Declare all DOM elements once

		// (Declarations above, so remove any further redeclarations below)
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
	languageSelect.onchange = (e) => {
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
	};
	mainMenuColor.oninput = (e) => {
		selectedColor = e.target.value;
	};
	cpuLanguageSelect.onchange = (e) => {
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
	// --- Main Menu and Team Selection Logic ---

	const mainMenu = document.getElementById("mainMenu");
	const languageSelect = document.getElementById("languageSelect");
	const mainMenuColor = document.getElementById("mainMenuColor");
	const cpuLanguageSelect = document.getElementById("cpuLanguageSelect");
	const cpuMenuColor = document.getElementById("cpuMenuColor");
	if (!mainMenu || !languageSelect || !mainMenuColor || !cpuLanguageSelect || !cpuMenuColor) return;

	languageSelect.onchange = (e) => {
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
	};
	mainMenuColor.oninput = (e) => {
		selectedColor = e.target.value;
	};
	cpuLanguageSelect.onchange = (e) => {
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
		// --- Pitch, Camera, Renderer ---
		const width = window.innerWidth, height = window.innerHeight;
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x1e824c);
		const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
		camera.position.set(0, 60, 90);
		camera.lookAt(0, 0, 0);
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(width, height);
		renderer.setClearColor(0x1e824c);
		renderer.domElement.style.position = 'fixed';
		renderer.domElement.style.top = '0';
		renderer.domElement.style.left = '0';
		renderer.domElement.style.zIndex = '0';
		document.body.appendChild(renderer.domElement);

		// --- Pitch ---
		const pitchLength = 105, pitchWidth = 68;
		const pitchGeo = new THREE.PlaneGeometry(pitchLength, pitchWidth);
		const pitchMat = new THREE.MeshLambertMaterial({ color: 0x229954 });
		const pitch = new THREE.Mesh(pitchGeo, pitchMat);
		pitch.rotation.x = -Math.PI / 2;
		scene.add(pitch);

		// --- Pitch Lines ---
		const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
		function addLine(points) {
			const geo = new THREE.BufferGeometry().setFromPoints(points);
			const line = new THREE.Line(geo, lineMat);
			scene.add(line);
		}
		// Outline
		addLine([
			new THREE.Vector3(-pitchLength/2, 0.01, -pitchWidth/2),
			new THREE.Vector3(-pitchLength/2, 0.01, pitchWidth/2),
			new THREE.Vector3(pitchLength/2, 0.01, pitchWidth/2),
			new THREE.Vector3(pitchLength/2, 0.01, -pitchWidth/2),
			new THREE.Vector3(-pitchLength/2, 0.01, -pitchWidth/2)
		]);
		// Halfway line
		addLine([
			new THREE.Vector3(0, 0.01, -pitchWidth/2),
			new THREE.Vector3(0, 0.01, pitchWidth/2)
		]);
		// Center circle
		const circleGeo = new THREE.RingGeometry(9.15-0.1, 9.15+0.1, 64);
		const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
		const circle = new THREE.Mesh(circleGeo, circleMat);
		circle.position.y = 0.011;
		circle.rotation.x = -Math.PI/2;
		scene.add(circle);

		// --- Lighting ---
		const amb = new THREE.AmbientLight(0xffffff, 0.7);
		scene.add(amb);
		const dir = new THREE.DirectionalLight(0xffffff, 0.7);
		dir.position.set(0, 100, 50);
		scene.add(dir);

		// --- Ball ---
		const ballGeo = new THREE.SphereGeometry(0.7, 32, 32);
		const ballMat = new THREE.MeshStandardMaterial({ color: 0xf7f7f7 });
		const ball = new THREE.Mesh(ballGeo, ballMat);
		ball.position.set(0, 0.7, 0);
		scene.add(ball);
		let ballVel = new THREE.Vector3(0, 0, 0);

		// --- Players ---
		function createPlayer(color, x, z, name) {
			const geo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16);
			const mat = new THREE.MeshStandardMaterial({ color });
			const mesh = new THREE.Mesh(geo, mat);
			mesh.position.set(x, 1.1, z);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.name = name;
			return mesh;
		}
		// 4-4-2 formation for both teams (standard positions)
		const userPlayers = [];
		const cpuPlayers = [];
		// Assign unique keeper colors
		const userColor = parseInt(selectedColor.replace('#','0x'));
		const cpuColor = parseInt(cpuColor.replace('#','0x'));
		const keeperColor = 0x1abc9c; // Teal for user keeper
		const cpuKeeperColor = 0xf1c40f; // Yellow for cpu keeper
		// Standard 4-4-2: GK, RB, RCB, LCB, LB, RM, RCM, LCM, LM, RF, LF
		const userFormation = [
			[-45,0], [-30,12], [-30,-12], [-15,20], [-15,-20], [0,10], [0,-10], [15,10], [15,-10], [30,5], [30,-5]
		];
		const cpuFormation = userFormation.map(([x,z])=>[-x,-z]);
		for (let i=0; i<11; ++i) {
			const userName = playerNames[i] || `Player ${i+1}`;
			const cpuName = cpuNames[i] || `Player ${i+1}`;
			// Keeper gets unique color
			const p = createPlayer(i === 0 ? keeperColor : userColor, userFormation[i][0], userFormation[i][1], userName);
			p.displayName = userName;
			p.isKeeper = i === 0;
			scene.add(p);
			userPlayers.push(p);
			const c = createPlayer(i === 0 ? cpuKeeperColor : cpuColor, cpuFormation[i][0], cpuFormation[i][1], cpuName);
			c.displayName = cpuName;
			c.isKeeper = i === 0;
			scene.add(c);
			cpuPlayers.push(c);
		}

		// --- Camera Follow ---
		let controlledIdx = 0;
		function updateCamera() {
			// Camera follows behind the player, based on their movement direction
			const p = userPlayers[controlledIdx];
			const camHeight = 40;
			const camDistance = 40;
			// Estimate movement direction
			let dx = 0, dz = 1; // Default: facing opponent's goal (positive z)
			if (typeof p.lastPos === 'object') {
				dx = p.position.x - p.lastPos.x;
				dz = p.position.z - p.lastPos.z;
				if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
					const len = Math.sqrt(dx*dx + dz*dz);
					dx /= len;
					dz /= len;
				} else {
					dx = 0;
					dz = 1;
				}
			}
			// Camera is behind player in movement direction
			camera.position.x = p.position.x - dx * camDistance;
			camera.position.y = camHeight;
			camera.position.z = p.position.z - dz * camDistance;
			camera.lookAt(p.position.x, 0, p.position.z);
			// Store last position for next frame
			if (!p.lastPos) p.lastPos = {x: p.position.x, z: p.position.z};
			p.lastPos.x = p.position.x;
			p.lastPos.z = p.position.z;
		}

		// --- Player Control ---
		const keys = {};
		window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
		window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });


		// --- Sprinting and Manual Player Switching ---
		let sprinting = keys['shift'];
		let sprintMultiplier = sprinting ? 1.7 : 1.0;
		// Manual player switching: Tab or Q
		if ((keys['tab'] || keys['q']) && !window._switchCooldown) {
			controlledIdx = (controlledIdx + 1) % userPlayers.length;
			window._switchCooldown = 0.3;
		}
		if (window._switchCooldown) {
			window._switchCooldown = Math.max(0, window._switchCooldown - dt);
		}

		function controlPlayer(dt) {
			// --- FIFA/PES-style movement and ball control ---
			let maxSpeed = 18 * sprintMultiplier;
			const accel = 60;
			const friction = 30;
			const p = userPlayers[controlledIdx];
			if (!p.vel) p.vel = {x:0, z:0};
			let dx = 0, dz = 0;
			if (keys['arrowup'] || keys['w']) dz -= 1;
			if (keys['arrowdown'] || keys['s']) dz += 1;
			if (keys['arrowleft'] || keys['a']) dx -= 1;
			if (keys['arrowright'] || keys['d']) dx += 1;
			let moving = dx !== 0 || dz !== 0;
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
			if (sprinting) {
				let id = `0_${controlledIdx}`;
				if (window.gameStats && window.gameStats.fitness && window.gameStats.fitness[id]) {
					window.gameStats.fitness[id] = Math.max(0, window.gameStats.fitness[id] - 0.25);
				}
			}

			// --- Ball control (dribbling) ---
			// --- Stand Tackle (Z): try to win ball if close ---
			if (!window._tackleCooldown) window._tackleCooldown = 0;
			window._tackleCooldown = Math.max(0, window._tackleCooldown - dt);
			if (keys['z'] && window._tackleCooldown <= 0) {
				if (dist < 2.2) {
					// Win ball if close
					const toBall = new THREE.Vector3(
						ball.position.x - p.position.x,
						0,
						ball.position.z - p.position.z
					);
					if (toBall.length() < 1.5) {
						// Take possession
						ball.position.x = p.position.x + toBall.x * 0.2;
						ball.position.z = p.position.z + toBall.z * 0.2;
						ballVel.x = p.vel.x;
						ballVel.z = p.vel.z;
						window.gameStats.tackles[0]++;
						window.gameStats.events.push(`Stand tackle by ${p.name}`);
					}
				}
				window._tackleCooldown = 0.5;
				keys['z'] = false;
			}

			// --- Slide Tackle (X): slide forward, try to win ball, risk foul ---
			if (!window._slideCooldown) window._slideCooldown = 0;
			window._slideCooldown = Math.max(0, window._slideCooldown - dt);
			if (keys['x'] && window._slideCooldown <= 0) {
				if (!window._sliding) {
					window._sliding = true;
					window._slideTime = 0.25;
					// Slide direction: current movement or facing
					let sdx = dx, sdz = dz;
					if (sdx === 0 && sdz === 0) sdz = 1;
					window._slideDir = {x: sdx, z: sdz};
				}
				keys['x'] = false;
			}
			if (window._sliding) {
				p.position.x += window._slideDir.x * 32 * dt;
				p.position.z += window._slideDir.z * 32 * dt;
				window._slideTime -= dt;
				// Check for ball contact
				if (p.position.distanceTo(ball.position) < 2.2) {
					ballVel.x = window._slideDir.x * 20;
					ballVel.z = window._slideDir.z * 20;
					window.gameStats.tackles[0]++;
					window.gameStats.events.push(`Slide tackle by ${p.name}`);
					// Foul chance if near CPU player
					for (let cpu of cpuPlayers) {
						if (p.position.distanceTo(cpu.position) < 1.5) {
							window.gameStats.fouls[0]++;
							window.gameStats.events.push(`Foul by ${p.name} (slide tackle)`);
						}
					}
				}
				if (window._slideTime <= 0) {
					window._sliding = false;
					window._slideCooldown = 1.0;
				}
			}

			// --- Call Teammate for Double Pressure (C): nearest teammate moves to ball ---
			if (keys['c']) {
				// Find nearest teammate not controlled
				let minDist2 = 9999, idx2 = -1;
				for (let i = 0; i < userPlayers.length; ++i) {
					if (i === controlledIdx) continue;
					let d = userPlayers[i].position.distanceTo(ball.position);
					if (d < minDist2) {
						minDist2 = d;
						idx2 = i;
					}
				}
				if (idx2 !== -1) {
					// Move that player toward ball
					const mate = userPlayers[idx2];
					const toBall = new THREE.Vector3(
						ball.position.x - mate.position.x,
						0,
						ball.position.z - mate.position.z
					).normalize();
					mate.position.x += toBall.x * 18 * dt;
					mate.position.z += toBall.z * 18 * dt;
				}
				keys['c'] = false;
			}
			const dist = p.position.distanceTo(ball.position);
			if (dist < 2.2) {
				// If moving slowly, keep ball close (dribble)
				const vlen = Math.sqrt(p.vel.x*p.vel.x + p.vel.z*p.vel.z);
				if (vlen < 10) {
					// Ball sticks to player's front
					const toBall = new THREE.Vector3(
						ball.position.x - p.position.x,
						0,
						ball.position.z - p.position.z
					);
					const desired = new THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(1.5);
					ball.position.x = p.position.x + desired.x;
					ball.position.z = p.position.z + desired.z;
					// Ball velocity matches player
					ballVel.x = p.vel.x;
					ballVel.z = p.vel.z;
				} else {
					// If sprinting, push ball ahead
					const push = new THREE.Vector3(p.vel.x, 0, p.vel.z).normalize().multiplyScalar(4.5);
					ballVel.x = push.x;
					ballVel.z = push.z;
				}
			}

			// --- Passing (E): pass to nearest teammate ---
			if (!window._passCooldown) window._passCooldown = 0;
			window._passCooldown = Math.max(0, window._passCooldown - dt);
			if (keys['e'] && window._passCooldown <= 0 && dist < 2.2) {
				// Find nearest teammate (not self)
				let minDist = 9999, target = null;
				for (let i = 0; i < userPlayers.length; ++i) {
					if (i === controlledIdx) continue;
					let d = p.position.distanceTo(userPlayers[i].position);
					if (d < minDist) {
						minDist = d;
						target = userPlayers[i];
					}
				}
				if (target) {
					// Pass ball toward teammate with moderate power
					const dir = new THREE.Vector3(
						target.position.x - p.position.x,
						0,
						target.position.z - p.position.z
					).normalize();
					ballVel.x = dir.x * 16;
					ballVel.z = dir.z * 16;
					ballVel.y = 0; // Ground pass
					window.gameStats.passes[0]++;
					window.gameStats.events.push(`Pass by ${p.name} to ${target.displayName}`);
					window._passCooldown = 0.4;
				}
				keys['e'] = false;
			}

			// --- Long Pass (R): pass to farthest teammate, high and powerful ---
			if (!window._longPassCooldown) window._longPassCooldown = 0;
			window._longPassCooldown = Math.max(0, window._longPassCooldown - dt);
			if (keys['r'] && window._longPassCooldown <= 0 && dist < 2.2) {
				// Find farthest teammate (not self)
				let maxDist = -1, target = null;
				for (let i = 0; i < userPlayers.length; ++i) {
					if (i === controlledIdx) continue;
					let d = p.position.distanceTo(userPlayers[i].position);
					if (d > maxDist) {
						maxDist = d;
						target = userPlayers[i];
					}
				}
				if (target) {
					// Long pass: high and powerful
					const dir = new THREE.Vector3(
						target.position.x - p.position.x,
						0,
						target.position.z - p.position.z
					).normalize();
					ballVel.x = dir.x * 22;
					ballVel.z = dir.z * 22;
					ballVel.y = 14;
					window.gameStats.passes[0]++;
					window.gameStats.events.push(`Long pass by ${p.name} to ${target.displayName}`);
					window._longPassCooldown = 0.7;
				}
				keys['r'] = false;
			}

			// --- Crossing (Q): send ball to far post ---
			if (!window._crossCooldown) window._crossCooldown = 0;
			window._crossCooldown = Math.max(0, window._crossCooldown - dt);
			if (keys['q'] && window._crossCooldown <= 0 && dist < 2.2) {
				// Cross to far post (right or left based on player x)
				let farX = p.position.x > 0 ? -30 : 30;
				let farZ = 52; // Near opponent's goal
				const dir = new THREE.Vector3(farX - p.position.x, 0, farZ - p.position.z).normalize();
				ballVel.x = dir.x * 18;
				ballVel.z = dir.z * 18;
				// Add a little height for crossing (simulate arc)
				if (!ballVel.y) ballVel.y = 0;
				ballVel.y = 10;
				window.gameStats.events.push(`Cross by ${p.name}`);
				window._crossCooldown = 0.7;
				keys['q'] = false;
			}

			// --- Shooting (hold/release Space): charge shot power ---
			if (!window._shootPower) window._shootPower = 0;
			if (!window._shooting) window._shooting = false;
			if (keys[' ']) {
				window._shooting = true;
				window._shootPower = Math.min(window._shootPower + dt * 32, 32); // Max power
			} else if (window._shooting && dist < 2.2) {
				// Release to shoot
				// Shoot toward goal center
				const goalX = 0;
				const goalZ = 52;
				const dir = new THREE.Vector3(goalX - p.position.x, 0, goalZ - p.position.z).normalize();
				ballVel.x = dir.x * window._shootPower;
				ballVel.z = dir.z * window._shootPower;
				window.gameStats.shots[0]++;
				window.gameStats.events.push(`Shot by ${p.name} (power ${window._shootPower.toFixed(1)})`);
				window._shootPower = 0;
				window._shooting = false;
			} else if (!keys[' ']) {
				window._shootPower = 0;
				window._shooting = false;
			}

			// --- Heading (auto if ball is above and close) ---
			if (ballVel.y && ball.position.distanceTo(p.position) < 2.2 && ball.position.y > 2) {
				// Head ball toward goal
				const goalX = 0;
				const goalZ = 52;
				const dir = new THREE.Vector3(goalX - p.position.x, 0, goalZ - p.position.z).normalize();
				ballVel.x = dir.x * 20;
				ballVel.z = dir.z * 20;
				ballVel.y = 6;
				window.gameStats.events.push(`Header by ${p.name}`);
			}
			// Remove old auto-switch code (now handled above)
			if (keys['tab'] || keys['q']) {
				keys['tab'] = false; keys['q'] = false;
			}
			// Kick/shoot (realistic: only if moving toward ball, with power, and cooldown)
			if (!window._kickCooldown) window._kickCooldown = 0;
			window._kickCooldown = Math.max(0, window._kickCooldown - dt);
			if (keys[' ']) {
				if (window._kickCooldown <= 0 && p.position.distanceTo(ball.position) < 2) {
					// Only kick if moving toward the ball
					const toBall = new THREE.Vector3(
						ball.position.x - p.position.x,
						0,
						ball.position.z - p.position.z
					);
					// Player movement direction
					let moveDir = new THREE.Vector3(0,0,0);
					if (typeof p.lastPos === 'object') {
						moveDir.x = p.position.x - p.lastPos.x;
						moveDir.z = p.position.z - p.lastPos.z;
					}
					if (moveDir.length() > 0.05 && toBall.dot(moveDir) > 0) {
						// Power based on movement speed, min 12, max 28
						let power = Math.min(28, Math.max(12, moveDir.length() * 120));
						const kickDir = toBall.normalize();
						ballVel.copy(kickDir.multiplyScalar(power));
						// Register shot
						window.gameStats.shots[0]++;
						window.gameStats.events.push(`Shot by ${p.name}`);
						// If shot is on target (towards center of goal)
						if (Math.abs(ball.position.x) < 7.32/2 && ball.position.z > (pitchWidth/2 - 16)) {
							window.gameStats.shotsOnTarget[0]++;
							window.gameStats.events.push(`Shot on target by ${p.name}`);
						}
						window._kickCooldown = 0.5; // 0.5s cooldown
					}
				}
				keys[' '] = false;
			}
			// Foul (simulate: if player is too close to CPU player)
			for (let cpu of cpuPlayers) {
				if (p.position.distanceTo(cpu.position) < 1.2 && !window._foulRegistered) {
					window.gameStats.fouls[0]++;
					window.gameStats.events.push(`Foul by ${p.name} on ${cpu.name}`);
					window._foulRegistered = true;
				}
			}
			if (!cpuPlayers.some(cpu => p.position.distanceTo(cpu.position) < 1.2)) {
				window._foulRegistered = false;
			}
		}

		function updateCpu(dt) {
			// --- AI Goalkeeper logic ---
			const cpuKeeper = cpuPlayers[0];
			const boxX = 0, boxZ = -52 + 7;
			let ballDist = cpuKeeper.position.distanceTo(ball.position);
			if (ball.position.z < -30 && Math.abs(ball.position.x) < 20) {
				let targetX = Math.max(-20, Math.min(20, ball.position.x));
				let targetZ = Math.max(-52 + 2, Math.min(-35, ball.position.z));
				let dir = new THREE.Vector3(targetX - cpuKeeper.position.x, 0, targetZ - cpuKeeper.position.z);
				if (dir.length() > 1) {
					dir.normalize();
					cpuKeeper.position.x += dir.x * 18 * dt;
					cpuKeeper.position.z += dir.z * 18 * dt;
				}
				if (ballDist < 2.5) {
					ballVel.x *= -0.7;
					ballVel.z *= -0.7;
					window.gameStats.keeperStats[1].saves++;
					window.gameStats.events.push(`CPU Keeper save by ${cpuKeeper.displayName}`);
				}
			} else {
				let dir = new THREE.Vector3(boxX - cpuKeeper.position.x, 0, boxZ - cpuKeeper.position.z);
				if (dir.length() > 1) {
					dir.normalize();
					cpuKeeper.position.x += dir.x * 10 * dt;
					cpuKeeper.position.z += dir.z * 10 * dt;
				}
			}

			// --- Outfield CPU logic: FIFA/PES-style ---
			// 1. Find which CPU has the ball (closest to ball)
			let ballCarrierIdx = 1;
			let minBallDist = 9999;
			for (let i = 1; i < cpuPlayers.length; ++i) {
				let d = cpuPlayers[i].position.distanceTo(ball.position);
				if (d < minBallDist) {
					minBallDist = d;
					ballCarrierIdx = i;
				}
			}
			// 2. Ball carrier logic: dribble, pass, or shoot
			for (let i = 1; i < cpuPlayers.length; ++i) {
				const cpu = cpuPlayers[i];
				// Formation position (defend/attack)
				const basePos = cpuFormation[i];
				// If ball carrier
				if (i === ballCarrierIdx && minBallDist < 3) {
					// If near goal, shoot
					if (cpu.position.z > 35 && Math.abs(cpu.position.x) < 20) {
						// Shoot
						const goalX = 0, goalZ = 52;
						const dir = new THREE.Vector3(goalX - cpu.position.x, 0, goalZ - cpu.position.z).normalize();
						ballVel.x = dir.x * 18;
						ballVel.z = dir.z * 18;
						window.gameStats.shots[1]++;
						window.gameStats.events.push(`CPU shot by ${cpu.name}`);
					} else {
						// Look for open teammate ahead
						let bestIdx = -1, bestScore = -9999;
						for (let j = 1; j < cpuPlayers.length; ++j) {
							if (j === i) continue;
							let teammate = cpuPlayers[j];
							// Prefer teammates ahead and not marked
							let ahead = teammate.position.z > cpu.position.z;
							let dist = cpu.position.distanceTo(teammate.position);
							let userMarkDist = Math.min(...userPlayers.map(u=>u.position.distanceTo(teammate.position)));
							let score = (ahead ? 10 : 0) + (50 - dist) + userMarkDist;
							if (score > bestScore) { bestScore = score; bestIdx = j; }
						}
						if (bestIdx !== -1 && bestScore > 20) {
							// Pass to open teammate
							let teammate = cpuPlayers[bestIdx];
							const dir = new THREE.Vector3(
								teammate.position.x - cpu.position.x,
								0,
								teammate.position.z - cpu.position.z
							).normalize();
							ballVel.x = dir.x * 16;
							ballVel.z = dir.z * 16;
							window.gameStats.passes[1]++;
							window.gameStats.events.push(`CPU pass by ${cpu.name} to ${teammate.name}`);
						} else {
							// Dribble forward
							const dir = new THREE.Vector3(0,0,1);
							cpu.position.x += dir.x * 10 * dt;
							cpu.position.z += dir.z * 10 * dt;
						}
					}
				} else {
					// Off-ball: return to formation, defend, or make run
					// Defenders: mark nearest attacker
					if (i <= 4) { // 1-4 are defenders
						let nearestAtt = userPlayers.slice(5).reduce((a,b) => (cpu.position.distanceTo(a.position) < cpu.position.distanceTo(b.position) ? a : b));
						let toAtt = new THREE.Vector3(nearestAtt.position.x - cpu.position.x, 0, nearestAtt.position.z - cpu.position.z);
						if (toAtt.length() > 3) {
							toAtt.normalize();
							cpu.position.x += toAtt.x * 8 * dt;
							cpu.position.z += toAtt.z * 8 * dt;
						}
					} else if (i >= 9) { // Forwards: make runs
						if (cpu.position.z < 40) cpu.position.z += 10 * dt;
					} else {
						// Midfielders: return to base position
						let toBase = new THREE.Vector3(basePos[0] - cpu.position.x, 0, basePos[1] - cpu.position.z);
						if (toBase.length() > 2) {
							toBase.normalize();
							cpu.position.x += toBase.x * 6 * dt;
							cpu.position.z += toBase.z * 6 * dt;
						}
					}
				}
			}
			// Foul (simulate: if CPU is too close to user player)
			for (let i = 1; i < cpuPlayers.length; ++i) {
				const cpu = cpuPlayers[i];
				for (let p of userPlayers) {
					if (cpu.position.distanceTo(p.position) < 1.2 && !window._cpuFoulRegistered) {
						window.gameStats.fouls[1]++;
						window.gameStats.events.push(`Foul by ${cpu.name} on ${p.name}`);
						window._cpuFoulRegistered = true;
					}
				}
			}
			if (!userPlayers.some(p => cpuPlayers[1].position.distanceTo(p.position) < 1.2)) {
				window._cpuFoulRegistered = false;
			}
		}

		// --- Ball Physics ---
		function updateBall(dt) {
			// Ball physics: inertia, friction, rolling, height
			if (!ballVel.x) ballVel.x = 0;
			if (!ballVel.z) ballVel.z = 0;
			if (!ballVel.y) ballVel.y = 0;
			ball.position.x += ballVel.x * dt;
			ball.position.z += ballVel.z * dt;
			ball.position.y += ballVel.y * dt;
			// Friction
			ballVel.x *= 0.98;
			ballVel.z *= 0.98;
			// Gravity for height
			if (ball.position.y > 0.7 || ballVel.y > 0) {
				ballVel.y -= 25 * dt;
			}
			// Clamp to pitch
			ball.position.x = Math.max(-pitchLength/2+1, Math.min(pitchLength/2-1, ball.position.x));
			ball.position.z = Math.max(-pitchWidth/2+1, Math.min(pitchWidth/2-1, ball.position.z));
			// Ball hits ground
			if (ball.position.y <= 0.7) {
				ball.position.y = 0.7;
				if (ballVel.y < 0) ballVel.y *= -0.3; // Small bounce
				if (Math.abs(ballVel.y) < 2) ballVel.y = 0;
			}
			// Stop if slow
			if (Math.sqrt(ballVel.x*ballVel.x + ballVel.z*ballVel.z) < 0.1 && Math.abs(ballVel.y) < 0.1) {
				ballVel.x = 0;
				ballVel.z = 0;
				ballVel.y = 0;
			}
		}

		// --- Basic CPU AI ---
		function updateCpu(dt) {
			// Simple: move first CPU player toward ball
			const cpu = cpuPlayers[0];
			const dir = new THREE.Vector3(
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
				const away = new THREE.Vector3(
					userPlayers[0].position.x - cpu.position.x,
					0,
					userPlayers[0].position.z - cpu.position.z
				).normalize();
				ballVel.add(away.multiplyScalar(16));
			}
		}

		// --- Main Game Loop ---
		let last = performance.now();
		function animate() {
			const now = performance.now();
			const dt = Math.min((now - last) / 1000, 0.05);
			last = now;
			controlPlayer(dt);
			updateCpu(dt);
			updateBall(dt);
			updateCamera();
			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		}
		animate();

		// --- Expose for UI/Stats ---
		window.game = {
			getPossession: () => {
				// 0 if user closer, 1 if cpu closer
				const userDist = userPlayers[controlledIdx].position.distanceTo(ball.position);
				const cpuDist = cpuPlayers[0].position.distanceTo(ball.position);
				return { teamIdx: userDist < cpuDist ? 0 : 1 };
			},
			teams: [
				{ players: userPlayers, formationType: '442' },
				{ players: cpuPlayers, formationType: '442' }
			],
			setupPauseMenu: () => {},
			pauseMenuSetupDone: true
		};
	});
});


// --- Patch Team/Player classes to support names ---
export function getRandomizedNames(namesArr) {
	// Shuffle and return 11 names
	let arr = namesArr.slice();
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr.slice(0, 11);
}

// --- Live Game Stats Tracking ---
if (typeof window.game === "undefined") window.game = null;
if (!window.gameStats) {
	window.gameStats = {
		possession: [0, 0],
		shots: [0, 0],
		shotsOnTarget: [0, 0],
		passes: [0, 0],
		fouls: [0, 0],
		corners: [0, 0],
		saves: [0, 0],
		tackles: [0, 0],
		events: [],
		playerStats: {}, // {playerId: {distance, passes, shots, ...}}
		playerPositions: {},
		fitness: {},
		passingNetwork: {},
		keeperStats: [
			{ saves: 0, passes: 0 },
			{ saves: 0, passes: 0 },
		],
		referee: { cards: [], fouls: [] },
	};

	// --- Hook into game events for stats ---
	setInterval(() => {
		if (!window.game) return;
		// Possession: who is closer to ball
		let poss = window.game.getPossession?.();
		if (poss) window.gameStats.possession[poss.teamIdx]++;
	// Real stat tracking: update stats only on real gameplay events
	// (Shots, passes, fouls, etc. are incremented in the actual gameplay logic below)
		// Fitness: decay for all players
		for (let t = 0; t < 2; ++t) {
			if (!window.game.teams) continue;
			window.game.teams[t].players.forEach((p, i) => {
				let id = `${t}_${i}`;
				if (!window.gameStats.fitness[id])
					window.gameStats.fitness[id] = 100;
				window.gameStats.fitness[id] = Math.max(
					0,
					window.gameStats.fitness[id] - 0.01
				);
				// Track positions for heatmap
				if (!window.gameStats.playerPositions[id])
					window.gameStats.playerPositions[id] = [];
				window.gameStats.playerPositions[id].push({
					x: p.mesh.position.x,
					z: p.mesh.position.z,
				});
				if (window.gameStats.playerPositions[id].length > 200)
					window.gameStats.playerPositions[id].shift();
			});
		}
	}, 1000);

	// --- Update Match Stats Panel ---
	function updateMatchStatsPanel() {
		const el = document.getElementById("matchStatsContent");
		if (!el || !window.gameStats) return;
		const s = window.gameStats;
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
	setInterval(updateMatchStatsPanel, 1000);

	// --- Update Event Feed Panel ---
	function updateEventFeedPanel() {
		const el = document.getElementById("eventFeedContent");
		if (!el || !window.gameStats) return;
		const events = window.gameStats.events;
		el.innerHTML =
			events
				.slice(-20)
				.map((e) => `<div>${e}</div>`)
				.join("") || "(No events yet)";
	}
	setInterval(updateEventFeedPanel, 1000);

	// --- Update Player Comparison Panel ---
	function updatePlayerComparePanel() {
		const el = document.getElementById("playerCompareContent");
		if (!el || !window.game || !window.game.teams || !window.game.teams[0] || !window.game.teams[0].players || window.game.teams[0].players.length < 2) {
			if (el) el.innerHTML = "(Compare two players)";
			return;
		}
		const p1 = window.game.teams[0].players[0];
		const p2 = window.game.teams[0].players[1];
		el.innerHTML = `
			<b>${p1.displayName}</b> vs <b>${p2.displayName}</b><br>
			<b>Fitness</b>: ${window.gameStats.fitness["0_0"]?.toFixed(1)} - ${window.gameStats.fitness["0_1"]?.toFixed(1)}<br>
			<b>Distance</b>: ${
				(window.gameStats.playerPositions["0_0"]?.length || 0) / 10
			}m - ${
				(window.gameStats.playerPositions["0_1"]?.length || 0) / 10
			}m<br>
		`;
	}
	setInterval(updatePlayerComparePanel, 1000);

	// --- Update Heatmap Panel ---
	function updateHeatmapPanel() {
		const el = document.getElementById("heatmapContent");
		if (!el) return;
		el.innerHTML = "(Heatmap coming soon)";
	}
	setInterval(updateHeatmapPanel, 2000);

	// --- Update Tactics Panel ---
	function updateTacticsPanel() {
		const el = document.getElementById("tacticsContent");
		if (!el || !window.game || !window.game.teams || !window.game.teams[0] || !window.game.teams[1]) return;
		el.innerHTML = `
			<b>Home Formation:</b> ${window.game.teams[0].formationType}<br>
			<b>Away Formation:</b> ${window.game.teams[1].formationType}<br>
			(Tactical instructions coming soon)
		`;
	}
	setInterval(updateTacticsPanel, 2000);

	// --- Update Bench Panel ---
	function updateBenchPanel() {
		const el = document.getElementById("benchContent");
		if (!el) return;
		el.innerHTML = "(No substitutes implemented yet)";
	}
	setInterval(updateBenchPanel, 2000);

	// --- Update Fitness Panel ---
	function updateFitnessPanel() {
		const el = document.getElementById("fitnessContent");
		if (!el || !window.game || !window.game.teams || !window.game.teams[0]) return;
		let html = '<table style="width:100%">';
		for (let i = 0; i < window.game.teams[0].players.length; ++i) {
			let p = window.game.teams[0].players[i];
			let id = `0_${i}`;
			html += `<tr><td style='color:#fff;'>${
				p.displayName
			}</td><td style='color:#ffd700;text-align:center;'>${window.gameStats.fitness[
				id
			]?.toFixed(1)}</td></tr>`;
		}
		html += "</table>";
		el.innerHTML = html;
	}
	setInterval(updateFitnessPanel, 1000);

	// --- Update Passing Network Panel ---
	function updatePassingPanel() {
		const el = document.getElementById("passingContent");
		if (!el) return;
		el.innerHTML = "(Passing network coming soon)";
	}
	setInterval(updatePassingPanel, 2000);

	// --- Update Keeper Panel ---
	function updateKeeperPanel() {
		const el = document.getElementById("keeperContent");
		if (!el || !window.gameStats) return;
		el.innerHTML = `
			<b>Home Saves:</b> ${window.gameStats.keeperStats[0].saves}<br>
			<b>Away Saves:</b> ${window.gameStats.keeperStats[1].saves}<br>
			(Saves map coming soon)
		`;
	}
	setInterval(updateKeeperPanel, 2000);

	// --- Update Referee Panel ---
	function updateRefPanel() {
		const el = document.getElementById("refContent");
		if (!el || !window.gameStats) return;
		el.innerHTML = `
			<b>Cards:</b> ${window.gameStats.referee.cards.length}<br>
			<b>Fouls:</b> ${window.gameStats.referee.fouls.length}<br>
		`;
	}
	setInterval(updateRefPanel, 2000);

	// --- Modern Stats Panels Logic ---
	function setupPanel(openBtnId, panelId, closeBtnId) {
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
	setupPanel("openMatchStatsBtn", "matchStatsPanel", "closeMatchStatsBtn");
	setupPanel("openEventFeedBtn", "eventFeedPanel", "closeEventFeedBtn");
	setupPanel(
		"openPlayerCompareBtn",
		"playerComparePanel",
		"closePlayerCompareBtn"
	);
	setupPanel("openHeatmapBtn", "heatmapPanel", "closeHeatmapBtn");
	setupPanel("openTacticsBtn", "tacticsPanel", "closeTacticsBtn");
	setupPanel("openBenchBtn", "benchPanel", "closeBenchBtn");
	setupPanel("openFitnessBtn", "fitnessPanel", "closeFitnessBtn");
	setupPanel("openPassingBtn", "passingPanel", "closePassingBtn");
	setupPanel("openKeeperBtn", "keeperPanel", "closeKeeperBtn");
	setupPanel("openRefBtn", "refPanel", "closeRefBtn");
	// Prevent page scroll on arrow keys
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
