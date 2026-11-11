/**
 * GameState - the single source of truth for a managerial career.
 *
 * Owns the generated football world, the user's club, the league schedule,
 * results, the season lifecycle and saving/loading. It also holds the manager's
 * two levers, tactics and training: tactics are handed to the canvas match and
 * the quick simulator, and training is applied to the squad after every match
 * week. The UI talks to it through eventCallbacks; the watched match and the
 * quick simulator both finish by calling completeMatch().
 */

import { generateWorldFootballSystem } from './utils/randomData.js';
import { TransferMarket } from './transfers/transferMarket.js';
import { TransferWindow } from './transfers/transferWindow.js';
import { RegistrationRules } from './transfers/registrationRules.js';
import { withSeededRandom, randomSeed, createSeededRandom } from './utils/seededRandom.js';
import { simulateMatch, startingEleven } from './league/matchSimulator.js';
import { loadSettings } from './settings.js';
import { normaliseTactics, aiTacticsFor } from './tactics/tactics.js';
import { defaultTraining, normaliseTraining, applyTrainingWeek, trainAiClubs } from './training/training.js';

const SAVE_KEY = 'efg_career_save';
const SAVE_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

export class GameState {
  constructor() {
    this.worldSystem = null;
    this.worldSeed = null;
    this.userTeam = null;
    this.league = null;
    this.userCountry = null;
    this.currentSeason = 2024;
    this.currentDate = new Date(2024, 5, 1);
    this.gameSpeed = 1;
    this.settings = loadSettings();

    // Schedule: rounds hold every match in the league, fixtures only the user's.
    this.rounds = [];
    this.fixtures = [];
    this.matchHistory = [];
    this.currentMatch = null;
    this.seasonComplete = false;
    this.lastSeasonSummary = null;

    this.transferMarket = null;
    this.transferWindow = null;
    this.registrationRules = null;

    // Management levers. AI clubs get a fixed style each, derived from their name.
    this.tactics = normaliseTactics();
    this.training = defaultTraining();
    this.lastTrainingReport = null;
    this.aiTactics = new Map();

    this.eventCallbacks = {
      uiUpdate: null,
      playerUpdate: null,
      teamUpdate: null,
      transferUpdate: null,
      transferCompleted: null,
      transferWindowOpened: null,
      transferWindowClosed: null,
      matchUpdate: null,
      matchStarted: null,
      matchCompleted: null,
      seasonEnded: null
    };

    this.stats = {
      matchesPlayed: 0,
      matchesWatched: 0,
      transfersCompleted: 0,
      seasonsCompleted: 0
    };
  }

  /**
   * Generate the world. The seed makes generation reproducible so a save only
   * needs to remember the seed plus the results that happened afterwards.
   */
  async initialize(seed = null) {
    this.worldSeed = seed === null ? randomSeed() : seed >>> 0;
    this.worldSystem = withSeededRandom(this.worldSeed, () => generateWorldFootballSystem());
    console.log(`World generated from seed ${this.worldSeed}: ${this.worldSystem.countries.length} countries, ${this.worldSystem.allTeams.length} teams`);

    this.transferMarket = new TransferMarket(this);
    this.transferWindow = new TransferWindow(this);
    this.registrationRules = new RegistrationRules(this);

    this.userTeam = null;
    this.league = null;

    if (this.eventCallbacks.uiUpdate) this.eventCallbacks.uiUpdate();
    this.setupAutoSave();
  }

  // ---------------------------------------------------------------------------
  // Career setup
  // ---------------------------------------------------------------------------

  setUserTeam(team, league, country) {
    this.userTeam = team;
    this.league = league;
    this.userCountry = country;
    this.userTeam.manager = 'You';
    this.tactics = normaliseTactics();
    this.training = defaultTraining();
    this.lastTrainingReport = null;

    this.league.resetTable();
    this.generateSeasonFixtures();
    this.currentDate = new Date(this.currentSeason, 5, 1);

    this.transferWindow.initializeSeason(this.currentSeason);
    this.transferWindow.openTransferWindow('summer');

    this.save();
    if (this.eventCallbacks.uiUpdate) this.eventCallbacks.uiUpdate();
  }

  seasonStartDate(season = this.currentSeason) {
    return new Date(season, 7, 10); // 10 August
  }

  /**
   * Build the full league schedule for the season: every round, every match.
   * Rounds are a week apart. The user's own matches are mirrored into
   * this.fixtures, which is what the dashboard and fixtures screens read.
   */
  generateSeasonFixtures() {
    if (!this.league || !this.userTeam) return;

    const start = this.seasonStartDate();
    this.rounds = this.league.fixtures.map((matches, index) => {
      const date = new Date(start.getTime() + index * 7 * DAY_MS);
      return {
        round: index + 1,
        date,
        matches: matches.map(({ home, away }) => ({
          id: `${this.currentSeason}_r${index + 1}_${home.id}_${away.id}`,
          round: index + 1,
          homeTeam: home,
          awayTeam: away,
          date,
          played: false,
          result: null,
          season: this.currentSeason
        }))
      };
    });

    this.fixtures = this.rounds
      .flatMap(round => round.matches)
      .filter(match => match.homeTeam === this.userTeam || match.awayTeam === this.userTeam)
      .sort((a, b) => a.date - b.date);

    this.matchHistory = [];
    this.seasonComplete = false;
    console.log(`Season ${this.currentSeason}: ${this.rounds.length} rounds, ${this.fixtures.length} fixtures for ${this.userTeam.name}`);
  }

  getNextFixture() {
    return this.fixtures.find(f => !f.played) || null;
  }

  isUserFixture(match) {
    return match.homeTeam === this.userTeam || match.awayTeam === this.userTeam;
  }

  // ---------------------------------------------------------------------------
  // Matches
  // ---------------------------------------------------------------------------
  // Tactics and training
  // ---------------------------------------------------------------------------

  tacticsForTeam(team) {
    if (team === this.userTeam) return this.tactics;
    if (!this.aiTactics.has(team)) this.aiTactics.set(team, aiTacticsFor(team));
    return this.aiTactics.get(team);
  }

  setTactics(patch) {
    this.tactics = normaliseTactics({ ...this.tactics, ...patch });
    this.save();
    if (this.eventCallbacks.teamUpdate) this.eventCallbacks.teamUpdate(this.userTeam);
    return this.tactics;
  }

  setTraining(patch) {
    this.training = normaliseTraining({ ...this.training, ...patch, individual: patch.individual ?? this.training.individual });
    this.save();
    return this.training;
  }

  setIndividualTraining(playerId, focus) {
    const individual = { ...this.training.individual };
    if (!focus || focus === 'team') delete individual[playerId];
    else individual[playerId] = focus;
    return this.setTraining({ individual });
  }

  /**
   * One training week for every club, run after each match week. The user's
   * plan produces a report for the training screen; AI clubs follow a seeded
   * balanced plan so a loaded save replays the same development.
   */
  runTrainingWeek(round) {
    if (!this.userTeam || !this.league) return null;
    this.lastTrainingReport = applyTrainingWeek(this.userTeam, this.training, Math.random, { week: round });
    trainAiClubs(this.league.teams, this.userTeam, round, this.trainingSeed(this.stats.seasonsCompleted));
    if (this.eventCallbacks.playerUpdate) this.eventCallbacks.playerUpdate();
    return this.lastTrainingReport;
  }

  /** Seed for the AI clubs' training in a given season, so a load can replay it. */
  trainingSeed(seasonIndex) {
    return ((this.worldSeed >>> 0) ^ Math.imul(seasonIndex + 1, 0x85EBCA6B)) >>> 0;
  }

  // ---------------------------------------------------------------------------
  // Matches
  // ---------------------------------------------------------------------------

  /**
   * mode 'watch' hands the fixture to the canvas match screen, where both
   * sides are AI-controlled; mode 'simulate' resolves it immediately with the
   * quick simulator. Either way the user's tactics are applied.
   */
  startMatch(fixtureId, mode = 'watch') {
    const fixture = this.fixtures.find(f => f.id === fixtureId);
    if (!fixture) {
      console.error('Fixture not found:', fixtureId);
      return null;
    }
    if (fixture.played) return fixture.result;

    if (mode === 'watch' || mode === 'play') {
      this.currentMatch = fixture;
      if (this.eventCallbacks.matchStarted) this.eventCallbacks.matchStarted(fixture);
      return fixture;
    }

    const outcome = this.quickSimulate(fixture);
    return this.completeMatch(fixture, { ...outcome, watched: false });
  }

  simulateNextFixture() {
    const next = this.getNextFixture();
    return next ? this.startMatch(next.id, 'simulate') : null;
  }

  simulateRemainingSeason() {
    let guard = 0;
    while (this.getNextFixture() && guard++ < 100) {
      this.simulateNextFixture();
    }
  }

  /**
   * Record a finished user fixture, then resolve the rest of that round so the
   * league table moves on for every club.
   */
  completeMatch(fixture, outcome) {
    if (!fixture || fixture.played) return fixture?.result || null;

    const result = this.applyResult(fixture, outcome);
    this.stats.matchesPlayed++;
    if (result.watched) this.stats.matchesWatched++;

    this.simulateRestOfRound(fixture.round);
    this.runTrainingWeek(fixture.round);

    if (this.currentDate < fixture.date) this.currentDate = new Date(fixture.date);
    this.currentMatch = null;

    this.save();
    this.checkSeasonEnd();

    if (this.eventCallbacks.matchCompleted) this.eventCallbacks.matchCompleted(result);
    if (this.eventCallbacks.uiUpdate) this.eventCallbacks.uiUpdate();
    console.log(`Full time: ${result.homeTeam.name} ${result.homeScore}-${result.awayScore} ${result.awayTeam.name}`);
    return result;
  }

  applyResult(match, outcome) {
    const result = {
      id: match.id,
      date: match.date,
      round: match.round,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: outcome.homeScore,
      awayScore: outcome.awayScore,
      homeScorers: outcome.homeScorers || [],
      awayScorers: outcome.awayScorers || [],
      watched: Boolean(outcome.watched ?? outcome.playedByUser)
    };
    match.played = true;
    match.result = result;

    this.league.recordResult(match.homeTeam, match.awayTeam, result.homeScore, result.awayScore);
    this.recordPlayerStats(match.homeTeam, result.homeScorers);
    this.recordPlayerStats(match.awayTeam, result.awayScorers);

    if (this.isUserFixture(match)) {
      this.matchHistory.push({ ...match, homeScore: result.homeScore, awayScore: result.awayScore });
    }
    return result;
  }

  recordPlayerStats(team, scorers) {
    const ensure = player => {
      player.stats = player.stats || { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
      return player.stats;
    };
    startingEleven(team).forEach(player => { ensure(player).appearances++; });
    scorers.forEach(goal => {
      const player = team.players.find(p => p.id === goal.playerId || p.name === goal.player);
      if (player) ensure(player).goals++;
    });
  }

  simulateRestOfRound(roundNumber) {
    const round = this.rounds[roundNumber - 1];
    if (!round) return;
    round.matches
      .filter(match => !match.played && !this.isUserFixture(match))
      .forEach(match => this.applyResult(match, { ...this.quickSimulate(match), watched: false }));
  }

  quickSimulate(match) {
    return simulateMatch(match.homeTeam, match.awayTeam, Math.random, this.tacticsForTeam(match.homeTeam), this.tacticsForTeam(match.awayTeam));
  }

  // ---------------------------------------------------------------------------
  // Time
  // ---------------------------------------------------------------------------

  advanceTime(days = 1) {
    for (let i = 0; i < days; i++) {
      this.currentDate = new Date(this.currentDate.getTime() + DAY_MS);

      const matchToday = this.fixtures.some(f => !f.played && sameDay(f.date, this.currentDate));
      this.transferWindow.updateTransferWindows(this.currentDate);
      this.transferMarket.updateMarketDynamics?.();

      if (i === days - 1 || matchToday) this.processPlayerDevelopment();
      if (matchToday) break;
    }
    if (this.eventCallbacks.uiUpdate) this.eventCallbacks.uiUpdate();
  }

  processPlayerDevelopment() {
    this.worldSystem.allTeams.forEach(team => {
      team.players.forEach(player => {
        if (player.fatigue > 0) player.fatigue = Math.max(0, player.fatigue - 2);
        player.morale = Math.max(20, Math.min(80, player.morale + (Math.random() - 0.5) * 2));
        if (player.injured && player.injuryDays > 0) {
          player.injuryDays--;
          if (player.injuryDays <= 0) player.injured = false;
        }
        if (Math.random() < 0.1) {
          const keys = Object.keys(player.attributes);
          const attribute = keys[Math.floor(Math.random() * keys.length)];
          const change = (Math.random() - 0.5) * 0.5;
          player.attributes[attribute] = Math.max(1, Math.min(99, player.attributes[attribute] + change));
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Seasons
  // ---------------------------------------------------------------------------

  checkSeasonEnd() {
    if (this.seasonComplete || !this.fixtures.length) return;
    if (this.fixtures.some(f => !f.played)) return;

    this.seasonComplete = true;
    this.stats.seasonsCompleted++;
    this.lastSeasonSummary = this.buildSeasonSummary();
    if (this.transferWindow.currentWindow) this.transferWindow.closeTransferWindow();
    this.save();
    if (this.eventCallbacks.seasonEnded) this.eventCallbacks.seasonEnded(this.lastSeasonSummary);
  }

  buildSeasonSummary() {
    const standings = this.league.getStandings();
    const position = standings.findIndex(t => t === this.userTeam) + 1;
    const stats = this.userTeam.stats;
    const userMatches = this.fixtures.filter(f => f.played);

    const margin = f => {
      const home = f.homeTeam === this.userTeam;
      const scored = home ? f.result.homeScore : f.result.awayScore;
      const conceded = home ? f.result.awayScore : f.result.homeScore;
      return { fixture: f, scored, conceded, diff: scored - conceded };
    };
    const margins = userMatches.map(margin);
    const biggestWin = margins.filter(m => m.diff > 0).sort((a, b) => b.diff - a.diff || b.scored - a.scored)[0] || null;
    const heaviestDefeat = margins.filter(m => m.diff < 0).sort((a, b) => a.diff - b.diff || b.conceded - a.conceded)[0] || null;

    const topScorers = [...this.userTeam.players]
      .filter(p => (p.stats?.goals || 0) > 0)
      .sort((a, b) => b.stats.goals - a.stats.goals)
      .slice(0, 5)
      .map(p => ({ name: p.name, position: p.position, goals: p.stats.goals }));

    const total = standings.length;
    let verdict;
    if (position === 1) verdict = 'Champions';
    else if (position <= 3 && this.league.tier > 1) verdict = 'Promoted';
    else if (position > total - 3 && this.league.tier < 3) verdict = 'Relegated';
    else if (position <= 4) verdict = 'European places';
    else if (position <= Math.ceil(total / 2)) verdict = 'Upper half';
    else verdict = 'Lower half';

    return {
      season: this.currentSeason,
      leagueName: this.league.name,
      teamName: this.userTeam.name,
      position,
      teams: total,
      verdict,
      champion: standings[0]?.name,
      record: { ...stats },
      biggestWin: biggestWin && describeFixture(biggestWin.fixture, this.userTeam),
      heaviestDefeat: heaviestDefeat && describeFixture(heaviestDefeat.fixture, this.userTeam),
      watched: userMatches.filter(f => f.result.watched).length,
      simulated: userMatches.filter(f => !f.result.watched).length,
      topScorers,
      standings: standings.map((team, index) => ({
        position: index + 1,
        name: team.name,
        isUser: team === this.userTeam,
        ...team.stats
      }))
    };
  }

  startNewSeason() {
    this.currentSeason++;
    this.currentDate = new Date(this.currentSeason, 5, 1);

    this.worldSystem.allTeams.forEach(team => {
      team.players.forEach(player => {
        if (player.stats) player.stats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
        player.age = (player.age || 20) + 1;
      });
    });

    this.league.resetTable();
    this.generateSeasonFixtures();
    this.transferWindow.initializeSeason(this.currentSeason);
    this.transferWindow.openTransferWindow('summer');
    this.registrationRules.updateRegistrationPeriods?.(this.currentSeason);

    this.save();
    if (this.eventCallbacks.uiUpdate) this.eventCallbacks.uiUpdate();
    console.log(`Season ${this.currentSeason} started`);
  }

  // ---------------------------------------------------------------------------
  // Saving and loading
  // ---------------------------------------------------------------------------

  static hasSave() {
    return Boolean(GameState.readSaveSummary());
  }

  static readSaveSummary() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== SAVE_VERSION) return null;
      return {
        teamName: data.userTeam.name,
        leagueName: data.userTeam.league,
        season: data.currentSeason,
        played: data.results.filter(r => r.user).length,
        savedAt: data.savedAt
      };
    } catch (error) {
      console.warn('Save could not be read', error);
      return null;
    }
  }

  static deleteSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (error) { console.warn(error); }
  }

  /**
   * The save stores the world seed, who the user manages, every result so far,
   * the tactics and training plan, and what training has done to the user's
   * squad (as per-attribute deltas). Everything else is regenerated; AI clubs'
   * training is replayed from the seed. Transfers are not persisted. Saves
   * written before tactics and training existed simply lack those fields.
   */
  save() {
    if (!this.userTeam || !this.league) return;
    try {
      const teamIndex = team => this.league.teams.indexOf(team);
      const packScorers = scorers => scorers.map(s => ({ p: s.playerId, n: s.player, m: s.minute }));
      const data = {
        version: SAVE_VERSION,
        savedAt: new Date().toISOString(),
        worldSeed: this.worldSeed,
        currentSeason: this.currentSeason,
        currentDate: this.currentDate.toISOString(),
        stats: this.stats,
        userTeam: {
          country: this.userCountry.name,
          league: this.league.name,
          index: teamIndex(this.userTeam),
          name: this.userTeam.name
        },
        results: this.rounds.flatMap(round => round.matches
          .filter(match => match.played)
          .map(match => ({
            r: match.round,
            h: teamIndex(match.homeTeam),
            a: teamIndex(match.awayTeam),
            hs: match.result.homeScore,
            as: match.result.awayScore,
            hsc: packScorers(match.result.homeScorers),
            asc: packScorers(match.result.awayScorers),
            user: this.isUserFixture(match),
            u: match.result.watched
          }))),
        tactics: this.tactics,
        training: this.training,
        lastTrainingReport: this.lastTrainingReport,
        playerDeltas: this.userTeam.players
          .filter(player => (player.trainingDeltas && Object.keys(player.trainingDeltas).length) || player.injured || player.fatigue > 0)
          .map(player => ({
            id: player.id,
            d: Object.fromEntries(Object.entries(player.trainingDeltas || {}).map(([k, v]) => [k, Math.round(v * 100) / 100])),
            inj: player.injured ? Math.max(1, Math.round(player.injuryDays || 1)) : 0,
            fat: Math.round(player.fatigue || 0)
          }))
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  async loadFromSave() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) return false;

    this.currentSeason = data.currentSeason;
    await this.initialize(data.worldSeed);

    const country = this.worldSystem.countries.find(c => c.name === data.userTeam.country);
    const league = country?.leagues.find(l => l.name === data.userTeam.league);
    const team = league?.teams[data.userTeam.index];
    if (!country || !league || !team) {
      console.error('Saved club could not be found in the regenerated world');
      return false;
    }

    this.setUserTeam(team, league, country);

    const unpackScorers = scorers => (scorers || []).map(s => ({ playerId: s.p, player: s.n, minute: s.m }));
    data.results
      .sort((a, b) => a.r - b.r)
      .forEach(saved => {
        const round = this.rounds[saved.r - 1];
        const match = round?.matches.find(m => m.homeTeam === league.teams[saved.h] && m.awayTeam === league.teams[saved.a]);
        if (match && !match.played) {
          this.applyResult(match, {
            homeScore: saved.hs,
            awayScore: saved.as,
            homeScorers: unpackScorers(saved.hsc),
            awayScorers: unpackScorers(saved.asc),
            watched: Boolean(saved.u)
          });
        }
      });

    this.tactics = normaliseTactics(data.tactics);
    this.training = normaliseTraining(data.training);
    this.lastTrainingReport = data.lastTrainingReport || null;
    (data.playerDeltas || []).forEach(saved => {
      const player = team.players.find(p => p.id === saved.id);
      if (!player) return;
      player.trainingDeltas = {};
      for (const [key, delta] of Object.entries(saved.d || {})) {
        if (!(key in player.attributes) || typeof delta !== 'number') continue;
        player.attributes[key] = Math.max(1, Math.min(99, player.attributes[key] + delta));
        player.trainingDeltas[key] = delta;
      }
      if (saved.inj > 0) {
        player.injured = true;
        player.injuryDays = saved.inj;
      }
      if (typeof saved.fat === 'number') player.fatigue = saved.fat;
    });
    // AI clubs' training is replayed from the seed, but only for careers that
    // trained at all; a save from before training existed stays as it was.
    // seasonsCompleted is bumped when the final fixture is played, before the
    // next season starts, so a save made in that gap still belongs to the
    // season whose rounds are in `results`.
    const seasonsCompleted = data.stats?.seasonsCompleted || 0;
    const thisSeasonFinished = this.fixtures.length > 0 && this.fixtures.every(f => f.played);
    const seasonIndex = Math.max(0, seasonsCompleted - (thisSeasonFinished ? 1 : 0));
    const ageEveryone = () => this.worldSystem.allTeams.forEach(t => t.players.forEach(p => { p.age = (p.age || 20) + 1; }));
    if (data.training) {
      for (let season = 0; season < seasonIndex; season++) {
        this.rounds.forEach((_, index) => trainAiClubs(league.teams, team, index + 1, this.trainingSeed(season)));
        ageEveryone();
      }
      const playedRounds = [...new Set(data.results.filter(r => r.user).map(r => r.r))].sort((a, b) => a - b);
      playedRounds.forEach(round => trainAiClubs(league.teams, team, round, this.trainingSeed(seasonIndex)));
    } else {
      for (let season = 0; season < seasonIndex; season++) ageEveryone();
    }

    const { matchesPlayedOnPitch, ...savedStats } = data.stats || {};
    this.stats = { ...this.stats, ...savedStats };
    if (matchesPlayedOnPitch !== undefined && savedStats.matchesWatched === undefined) this.stats.matchesWatched = matchesPlayedOnPitch;
    this.currentDate = new Date(data.currentDate);
    this.transferWindow.updateTransferWindows(this.currentDate);

    if (this.fixtures.length && this.fixtures.every(f => f.played)) {
      this.seasonComplete = true;
      this.lastSeasonSummary = this.buildSeasonSummary();
    }
    this.save();
    if (this.eventCallbacks.uiUpdate) this.eventCallbacks.uiUpdate();
    console.log(`Loaded ${team.name}, season ${this.currentSeason}`);
    return true;
  }

  setupAutoSave() {
    if (this.autoSaveInstalled) return;
    this.autoSaveInstalled = true;
    window.addEventListener('beforeunload', () => {
      if (this.settings.autoSave) this.save();
    });
  }

  getGameStats() {
    return {
      ...this.stats,
      currentSeason: this.currentSeason,
      userTeam: this.userTeam?.name,
      transferBudget: this.transferMarket?.getTransferBudget?.(this.userTeam) || 0,
      leaguePosition: this.league?.getPosition?.(this.userTeam) || 'Unknown'
    };
  }
}

function sameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function describeFixture(fixture, userTeam) {
  const home = fixture.homeTeam === userTeam;
  const opponent = home ? fixture.awayTeam.name : fixture.homeTeam.name;
  const scored = home ? fixture.result.homeScore : fixture.result.awayScore;
  const conceded = home ? fixture.result.awayScore : fixture.result.homeScore;
  return `${scored}-${conceded} v ${opponent} (${home ? 'H' : 'A'})`;
}

export { createSeededRandom };
