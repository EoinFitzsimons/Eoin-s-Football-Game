# Copilot Instructions for Eoin's Football Game

## Project Architecture
- **Modular Vanilla JS**: All core logic is organized in `/src` subfolders: `/league/league.js`, `/team/team.js`, `/player/player.js`, `/match/matchEngine.js`, `/ui/ui.js`.
- **No Flat JS Files**: Do not use or recreate `/src/league.js`, `/src/team.js`, `/src/player.js`, etc. Only use files inside their respective folders.
- **UI**: The UI is managed by `/src/ui/ui.js` and styled with `/assets/style.css`.
- **Data Model**: 
  - `Team` and `Player` classes are in `/src/team/team.js` and `/src/player/player.js`.
  - Real Irish Premier Division teams are provided as `Team.realTeams` (static array, no sample teams/players).
  - Player attributes: 50+ one-word, original attributes grouped by category (attacking, defending, physical, mental, goalkeeping).
- **League System**: `/src/league/league.js` implements double round-robin, calendar, and league logic. Uses real teams from `Team.realTeams`.
- **Match Engine**: `/src/match/matchEngine.js` simulates and animates matches.

## Developer Workflows
- **No Build Step**: Pure ES modules, run directly in browser. No bundler or transpiler.
- **Testing**: No formal test suite yet. Add tests in `/src/` as needed.
- **Debugging**: Use browser devtools. All logic is in ES modules, so breakpoints and live reload work as expected.

## Project Conventions
- **Imports**: Always use relative imports (e.g. `import { Team } from '../team/team.js'`).
- **No Sample Data**: Do not generate or use sample teams/players. Use only real teams from `Team.realTeams`.
- **No 3D/Three.js**: All 3D remnants have been removed. This is a 2D football manager.
- **Naming**: Use clear, descriptive, one-word property names for player attributes.
- **UI Navigation**: UI sections are switched via `/src/ui/ui.js`.

## Integration Patterns
- **Teams**: Use `Team.realTeams` for league and match integration.
- **Players**: Integrate real player data by populating the `players` array in each `Team` object.
- **League**: Instantiate `League` with real teams only.

## Key Files/Directories
- `/src/league/league.js` — League logic
- `/src/team/team.js` — Team class, realTeams static array
- `/src/player/player.js` — Player class, 50+ attributes
- `/src/match/matchEngine.js` — Match simulation
- `/src/ui/ui.js` — UI logic
- `/assets/style.css` — Styles

## Example: Using Real Teams
```js
import { Team } from '../team/team.js';
const league = new League({ name: 'Irish Premier', teams: Team.realTeams });
```

---
If you find any conventions or patterns not covered here, update this file to keep Copilot and other AI agents productive.
