# Eoin's Football Game

A football management game for the browser. You never touch the players: you set the tactics, run the training and watch the match play out on a top-down pitch where all twenty-two players are AI-controlled.

Pick a club from a generated world of countries, leagues and squads, then run a full season. Routine fixtures can be simulated in a click; the rest of the league plays out around you every round. For the big games you can watch the match on a canvas pitch, change your instructions from the dugout as it unfolds, and the result feeds straight back into the league table, the scorers' charts and the end-of-season review.

Everything you see and hear is drawn or synthesised in code. There are no image or audio files in the repository.

Play it at <https://eoinfitzsimons.github.io/Eoin-s-Football-Game/>.

## How to play

1. **New career** – choose a country, a league and a club. The world is freshly generated each time.
2. **Tactics** – choose the formation (4-4-2, 4-3-3, 4-2-3-1, 3-5-2 or 5-3-2), mentality, tempo, pressing, width, passing style and corner taker. Both the watched match and the quick simulator read these.
3. **Training** – pick a team focus (balanced, attacking, possession, defending, physical, set pieces, goalkeeping or rest) and an intensity, and give individual players their own programme if you like. Training runs after every match week and moves attributes up or down; the **Team** screen shows the running change next to each player.
4. **Dashboard** – shows your next fixture. Press **Watch the match** to see it played on the pitch, or **Simulate** to let the engine decide. Every other match in that round is resolved at the same time so the table moves on for all twenty clubs.
5. **Fixtures / League / Team / Transfers / Statistics** – the management side: results and form, the table, your squad and the transfer market.
6. **Season** – when the last fixture has been played the season review appears: final position, record, biggest win, heaviest defeat, top scorers and the final table, with a button to start the next season.
7. **Continue** on the main menu resumes a saved career. The game saves automatically after every match.

### Watching a match

There are no player controls. Every player on the pitch is driven by the AI, which reads each side's tactics:

| Instruction | What it changes on the pitch |
| --- | --- |
| Formation | The slots the eleven line up in; the strongest available players fill them, keeper first |
| Mentality | How far up the pitch the shape sits, how far players run to support an attack and how willing they are to shoot |
| Tempo | How long a player holds the ball before deciding, and how often he releases it |
| Pressing | How many players hunt the ball when it is lost (one, two or three) and how far the whole side squeezes towards it |
| Width | How far the shape is stretched across the pitch |
| Passing | The longest pass a player will attempt and how strongly forward progress is weighted when choosing one |
| Corner taker | Who takes corners; his set-piece attributes decide how accurately they find a teammate in the box |

While the match is running the **Dugout** card under the pitch lets you change any of these and the players adjust straight away; the HUD along the bottom of the pitch summarises both sides' tactics. The toolbar offers **Pause** (<kbd>P</kbd>), playback at 1×, 2× or 4×, **Skip to FT** and **Mute** (<kbd>M</kbd>). Each half lasts 1, 2 or 3 real minutes (set in **Settings**); the match clock is scaled to 45 minutes per half. Throw-ins, corners and goal kicks are awarded when the ball leaves the pitch, and the teams change ends at half time. The **Opposition strength** setting boosts only the other side's AI.

### Training

Training is applied to every club after each match week. Your plan decides which attributes your players work on and how hard: younger players gain fastest, players over thirty slowly lose the physical attributes they are not training, intense weeks tire players for match day and carry a small injury risk, and a rest week recovers fatigue without changing anything. The **Training** screen shows last week's report and the total change per player since you took charge; the **Team** screen shows the same change next to ratings and attributes. Because the match AI and the quick simulator both read the live attributes, what you train shows up in results.

## Features

- **Watched matches** – a 2D top-down match on an HTML canvas: a drawn pitch with stripes, markings and nets; kits coloured from each club's colours (with an automatic change strip when they clash); a rolling ball with a shadow; a scoreboard, clock and tactics HUD; goal, save and restart messages; pause, 2×/4× speed and skip to full time.
- **Tactics** – five formations plus mentality, tempo, pressing, width, passing style and corner taker, changeable before and during a match. Every AI club has a stable style of its own, so the opposition varies from week to week.
- **AI** – role-based behaviour for defenders, midfielders, forwards and goalkeepers that follows the tactics: pressing, support runs, passing lanes, shooting decisions, corner deliveries and saves. Three opposition-strength levels.
- **Training** – a weekly plan with eight focuses, three intensities and individual programmes, with a report after every match week and attribute changes shown on the squad screen.
- **League simulation** – a double round-robin schedule for every club in your league, a quick simulator based on squad ratings and tactics for the matches you do not watch, scorers and appearances recorded for every player.
- **Season summary** – an end-of-season review screen and a one-click start to the next campaign.
- **Menu and settings** – a canvas-drawn crest and animated backdrop, continue from save, sound, half length, opposition strength and auto-save options.
- **Sound** – crowd ambience, referee whistles, kicks and a goal fanfare, all generated with the Web Audio API, with a mute toggle in the match and in the settings.
- **Save and load** – the career, tactics, training plan and the attribute changes training has produced are stored in `localStorage` and restored on the main menu. Saves made before tactics and training existed still load with the defaults.

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
- **World generation** – `src/utils/randomData.js` builds countries, leagues, clubs and players. Generation runs under a seeded random number generator (`src/utils/seededRandom.js`), so a save only needs to store the world seed, the club you manage, the results so far, your tactics and training plan and the per-attribute training changes for your squad; everything else is regenerated on load, and the other clubs' training is replayed from the seed.
- **League** – `src/league/league.js` builds the double round-robin schedule with the circle method and keeps the table. `src/league/matchSimulator.js` resolves unplayed fixtures with a Poisson model driven by squad ratings, adjusted by both sides' tactics, and picks scorers weighted by position and finishing.
- **Tactics and training** – `src/tactics/tactics.js` holds the formations, the option lists and `tacticModifiers()`, which turns a tactics object into the numbers the match AI reads (line height, pressing count and distance, decision time, pass range, shooting range and so on), plus `tacticsEffect()` for the quick simulator. `src/training/training.js` applies a training week to a squad and records the cumulative change on each player.
- **Match engine** – `src/match/matchEngine.js` simulates in metres on a 105 × 68 pitch in fixed sub-steps (so 2× and 4× playback and skip-to-full-time stay stable), with simple ball physics (friction, possession, deflected tackles) and AI for all twenty-two players driven by each side's tactics. All drawing is done with the Canvas 2D API; the canvas is resized to its container and scaled for high-DPI screens.
- **Audio** – `src/audio/soundscape.js` synthesises every sound: filtered brown noise with a slow LFO for the crowd, detuned square waves with vibrato for the whistle, shaped oscillators for kicks, the post and the goal fanfare. The `AudioContext` is created only after the first user gesture.
- **Settings and saves** – `src/settings.js` and `GameState.save()/loadFromSave()` use `localStorage`.

### Known limitations

- The watched match does not model fouls, offsides or substitutions, and the only set pieces with dedicated behaviour are corners.
- Transfers made during a season are not stored in the save file; results, the table and player statistics are.
- The thumbnail at `thumbnail.png` is a real screenshot of the match screen, captured in headless Chrome and cropped to 1080 × 360.

## Licence

MIT – see `package.json`.
