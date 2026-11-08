# Eoin's Football Game

A football management game for the browser with a twist: when a fixture matters, you can leave the dugout and play it yourself on a top-down pitch.

Pick a club from a generated world of countries, leagues and squads, then run a full season. Routine fixtures can be simulated in a click; the rest of the league plays out around you every round. For the big games you take control of one player on a canvas pitch, with AI teammates and opponents, and the result feeds straight back into the league table, the scorers' charts and the end-of-season review.

Everything you see and hear is drawn or synthesised in code. There are no image or audio files in the repository.

Play it at <https://eoinfitzsimons.github.io/Eoin-s-Football-Game/>.

## How to play

1. **New career** – choose a country, a league and a club. The world is freshly generated each time.
2. **Dashboard** – shows your next fixture. Press **Play on the pitch** to play it, or **Simulate** to let the engine decide. Every other match in that round is resolved at the same time so the table moves on for all twenty clubs.
3. **Fixtures / League / Team / Transfers / Statistics** – the management side: results and form, the table, your squad and the transfer market.
4. **Season** – when the last fixture has been played the season review appears: final position, record, biggest win, heaviest defeat, top scorers and the final table, with a button to start the next season.
5. **Continue** on the main menu resumes a saved career. The game saves automatically after every match.

### Controls on the pitch

| Key | Action |
| --- | --- |
| Arrow keys / WASD | Move the highlighted player |
| Space | Shoot (aim with the arrows); tackle or kick a loose ball |
| Shift / X | Pass to the teammate you are facing (or the best option if you are standing still) |
| Ctrl / C | Sprint |
| Q / Tab | Switch to another player |
| P | Pause |
| M | Mute |

When the other side has the ball, control switches automatically to your nearest outfield player. Each half lasts 1, 2 or 3 real minutes (set in **Settings**); the match clock is scaled to 45 minutes per half. Throw-ins, corners and goal kicks are awarded when the ball leaves the pitch, and the teams change ends at half time.

## Features

- **Playable matches** – a 2D top-down match on an HTML canvas: a drawn pitch with stripes, markings and nets; kits coloured from each club's colours (with an automatic change strip when they clash); a rolling ball with a shadow; a scoreboard and clock; goal, save and restart messages.
- **AI** – role-based behaviour for defenders, midfielders, forwards and goalkeepers: pressing, support runs, passing lanes, shooting decisions and saves. Three difficulty levels.
- **League simulation** – a double round-robin schedule for every club in your league, a quick simulator based on squad ratings for the matches you do not play, scorers and appearances recorded for every player.
- **Season summary** – an end-of-season review screen and a one-click start to the next campaign.
- **Menu and settings** – a canvas-drawn crest and animated backdrop, continue from save, sound, half length, difficulty and auto-save options.
- **Sound** – crowd ambience, referee whistles, kicks and a goal fanfare, all generated with the Web Audio API, with a mute toggle in the match and in the settings.
- **Save and load** – the career is stored in `localStorage` and restored on the main menu.

## Running locally

The game is a static site with no build step. It uses ES modules, so it has to be served over HTTP rather than opened as a file.

```bash
git clone https://github.com/EoinFitzsimons/Eoin-s-Football-Game.git
cd Eoin-s-Football-Game
python3 -m http.server 8080
# then open http://localhost:8080/
```

Any static server works (`npx http-server .` is wired up as `npm start` if you prefer Node). GitHub Pages serves the repository root directly.

## Technical notes

- **Stack** – plain JavaScript (ES modules), HTML and CSS. No frameworks, no bundler, no dependencies at runtime.
- **Entry point** – `index.html` loads `src/main.js`, which creates a `GameState` (`src/game.js`) and a `GameUI` (`src/ui/gameUI.js`). The UI is a set of sections under `src/ui/sections/`.
- **World generation** – `src/utils/randomData.js` builds countries, leagues, clubs and players. Generation runs under a seeded random number generator (`src/utils/seededRandom.js`), so a save only needs to store the world seed, the club you manage and the results so far; everything else is regenerated on load.
- **League** – `src/league/league.js` builds the double round-robin schedule with the circle method and keeps the table. `src/league/matchSimulator.js` resolves unplayed fixtures with a Poisson model driven by squad ratings and picks scorers weighted by position and finishing.
- **Match engine** – `src/match/matchEngine.js` simulates in metres on a 105 × 68 pitch at the display's refresh rate, with simple ball physics (friction, possession, deflected tackles), a 4-3-3 shape for both sides, keyboard input for one player and AI for the rest. All drawing is done with the Canvas 2D API; the canvas is resized to its container and scaled for high-DPI screens.
- **Audio** – `src/audio/soundscape.js` synthesises every sound: filtered brown noise with a slow LFO for the crowd, detuned square waves with vibrato for the whistle, shaped oscillators for kicks, the post and the goal fanfare. The `AudioContext` is created only after the first user gesture.
- **Settings and saves** – `src/settings.js` and `GameState.save()/loadFromSave()` use `localStorage`.

### Known limitations

- The playable match uses a fixed 4-3-3 for both sides and does not model fouls, offsides or substitutions.
- Transfers made during a season are not stored in the save file; results, the table and player statistics are.
- The thumbnail at `thumbnail.png` is a real screenshot of the match screen, captured in headless Chrome and cropped to 1080 × 360.

## Licence

MIT – see `package.json`.
