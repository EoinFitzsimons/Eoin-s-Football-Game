# Eoin's Football Game

## Overview
Eoin's Football Game is a fast-paced, browser-based 3D football (soccer) game built with Three.js. Play as a team of 3 against a CPU team, with realistic physics, passing, shooting, tackling, and advanced AI.

## Features
- **3D Graphics:** Uses Three.js for immersive visuals and smooth gameplay.
- **Teams:** 3v3 match (You vs CPU), with customizable team colors.
- **Controls:**
  - Arrow keys / WASD: Move
  - Space: Pass / Shoot / Tackle
  - R: Replay last goal
  - M: Mute/unmute sound
- **Game Mechanics:**
  - Passing, shooting, tackling, dribbling
  - Power bar for passes, shots, and throw-ins
  - Realistic ball physics (spin, curve, bounce)
  - Throw-ins, goal kicks, corners, and goals
  - Replay system for last goal
- **AI:** CPU team coordinates to attack, defend, and tackle.
- **Sound:** Percussive effects and a football melody.
- **UI:** Scoreboard, overlays, player labels, and main menu for color selection.

## How to Play
1. Open `index.html` in your browser.
2. Choose your team and CPU colors in the main menu.
3. Use the controls to move, pass, shoot, and tackle.
4. Try to score more goals than the CPU before time runs out!

## Technical Details
- Built with Three.js (via CDN)
- Modular code structure (~2000 lines)
- GLTF player models (Soldier.glb from Three.js examples)
- Physics: Elastic collisions, Magnus effect, friction, gravity
- No external dependencies except Three.js and GLTFLoader

## Credits
- Developed by Eoin
- 3D assets: Three.js examples

## License
This project is for educational and personal use.

