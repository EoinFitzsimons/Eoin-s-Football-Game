// Ultra-complex Player class for Eoin's Football Game
export class Player {
  constructor({
    name,
    age = 18,
    position = 'CM',
    attributes = {},
    traits = [],
    nationality = 'Ireland',
    id = null
  }) {
    this.name = name;
    this.age = age;
    this.position = position;
    this.nationality = nationality;
    this.id = id || Player.generateId();
    this.traits = traits;
    // 50+ attributes, grouped by category
    this.attributes = Player.initAttributes(attributes);
    // Dynamic state
    this.fatigue = 0; // 0-100
    this.form = 50; // 0-100
    this.morale = 50; // 0-100
    this.injured = false;
    this.injuryDays = 0;
    this.experience = 0; // Career minutes
    this.potential = Math.floor(Math.random() * 30) + 70; // 70-100
    this.lastMatchRating = 6.0;
    this.injuryHistory = [];
    this.development = 0; // Tracks training progress
    this.fitness = 100; // 0-100
    this.suspension = 0;
    this.matchSharpness = 50; // 0-100
    this.reputation = 50; // 0-100
    this.value = 0;
  }

  static generateId() {
    return 'P' + Math.random().toString(36).substr(2, 9);
  }

  static initAttributes(overrides = {}) {
    // 100+ hyper-granular attributes, grouped
    const base = {
      // Attacking
      finishing: 50, composure: 50, offball: 50, technique: 50, flair: 50, crossing: 50, dribbling: 50, firsttouch: 50, longshots: 50, passing: 50, vision: 50, heading: 50, movement: 50, creativity: 50, anticipation: 50, volley: 50, curve: 50, throughball: 50, cutback: 50, chip: 50, lob: 50, onevone: 50, poaching: 50, tapin: 50, setpiece: 50, freekick: 50, penalty: 50, corner: 50, shotpower: 50, shotaccuracy: 50, finishingangle: 50, composurebox: 50, instinct: 50, reaction: 50, 
      // Defending
      marking: 50, tackling: 50, positioning: 50, aggression: 50, bravery: 50, concentration: 50, decisions: 50, teamwork: 50, interceptions: 50, workrate: 50, composuredef: 50, strength: 50, balance: 50, block: 50, clearance: 50, slide: 50, stand: 50, aerialduel: 50, anticipationdef: 50, cover: 50, press: 50, tracking: 50, recoveryrun: 50, discipline: 50, 
      // Physical
      pace: 50, acceleration: 50, stamina: 50, strength: 50, balance: 50, agility: 50, jumping: 50, naturalfitness: 50, injuryproneness: 50, recovery: 50, flexibility: 50, resilience: 50, sprint: 50, burst: 50, core: 50, upperbody: 50, lowerbody: 50, reach: 50, reactiontime: 50, quickness: 50, explosiveness: 50, 
      // Mental
      determination: 50, leadership: 50, workrate: 50, composuremental: 50, vision: 50, flair: 50, anticipationmental: 50, decisions: 50, concentration: 50, positioningmental: 50, influence: 50, discipline: 50, temperament: 50, pressure: 50, focus: 50, confidence: 50, aggressionmental: 50, consistency: 50, adaptability: 50, ambition: 50, professionalism: 50, controversy: 50, sportsmanship: 50, loyalty: 50, temperamentbig: 50, 
      // Technical
      ballcontrol: 50, dribblingclose: 50, dribblingopen: 50, passinglong: 50, passingshort: 50, passingvision: 50, crossingearly: 50, crossinglate: 50, shootingdistance: 50, shootingclose: 50, touch: 50, trapping: 50, feint: 50, nutmeg: 50, flick: 50, backheel: 50, rabona: 50, outsidefoot: 50, volleytech: 50, chiptech: 50, lobtech: 50, 
      // Goalkeeping
      gkhandling: 1, gkreflexes: 1, gkpositioning: 1, gkcommunication: 1, gkdistribution: 1, gkonevone: 1, gkcommand: 1, gkthrowing: 1, gkkicking: 1, gkaerial: 1, gkanticipation: 1, gkpenalty: 1, gkdiving: 1, gkcatch: 1, gkparry: 1, gkfootwork: 1, gkdecision: 1, gkconcentration: 1, gkbravery: 1, gkcomposure: 1, gkvision: 1, gkdistributionlong: 1, gkdistributionshort: 1, gkthrowaccuracy: 1, gkkickaccuracy: 1, gkonehand: 1, gktwopunch: 1, gkcommandbox: 1, gkclaim: 1, gkanticipate: 1, 
      // Psychological
      morale: 50, form: 50, pressurehandling: 50, crowd: 50, rivalry: 50, clutch: 50, bigmatch: 50, nerves: 50, 
      // Miscellaneous
      staminaend: 50, staminaearly: 50, staminaextra: 50, weather: 50, altitude: 50, travel: 50, language: 50, teamworkchem: 50, leadershipchem: 50, 
    };
    return { ...base, ...overrides };
  }

  // Attribute evolution: called at season/month end
  progress({ training = {}, matchMinutes = 0, injury = false, bigMatch = false }) {
    // Age curve: peak 25-29, decline after 31
    const peak = this.age >= 25 && this.age <= 29;
    const decline = this.age > 31;
    for (const key in this.attributes) {
      let delta = 0;
      if (training[key]) delta += training[key];
      if (matchMinutes > 0) delta += matchMinutes / 900;
      if (peak) delta += 0.15;
      if (decline) delta -= 0.25;
      if (injury) delta -= 0.7;
      if (this.hasTrait('ModelProfessional')) delta += 0.1;
      if (this.hasTrait('InjuryProne')) delta -= 0.2;
      if (bigMatch && this.hasTrait('BigMatchPlayer')) delta += 0.2;
      // Clamp
      this.attributes[key] = Math.max(1, Math.min(99, this.attributes[key] + delta));
    }
    this.experience += matchMinutes;
    this.development += matchMinutes / 1000 + Object.values(training).reduce((a, b) => a + b, 0);
    if (injury) {
      this.injured = true;
      this.injuryDays = Math.floor(Math.random() * 30) + 5;
      this.injuryHistory.push({ days: this.injuryDays, date: Date.now() });
    }
    // Update value and reputation
    this.value = Math.round((this.potential + this.form + this.reputation) * 1000);
    this.reputation = Math.max(1, Math.min(100, this.reputation + (matchMinutes > 0 ? 0.1 : 0)));
  }

  // Fatigue, form, morale, sharpness
  updateMatchState({ minutes = 90, events = [], rating = 6.0 }) {
    this.fatigue = Math.min(100, this.fatigue + minutes * 0.6 - this.attributes.naturalfitness * 0.01);
    this.matchSharpness = Math.max(0, Math.min(100, this.matchSharpness + minutes * 0.2 - this.fatigue * 0.05));
    // Form: based on key events and rating
    let formDelta = 0;
    for (const e of events) {
      if (e.type === 'goal' && e.playerId === this.id) formDelta += 6;
      if (e.type === 'assist' && e.playerId === this.id) formDelta += 4;
      if (e.type === 'error' && e.playerId === this.id) formDelta -= 5;
      if (e.type === 'yellow' && e.playerId === this.id) formDelta -= 2;
      if (e.type === 'red' && e.playerId === this.id) formDelta -= 5;
    }
    formDelta += (rating - 6.0) * 2;
    this.form = Math.max(0, Math.min(100, this.form + formDelta));
    this.lastMatchRating = rating;
    // Morale: influenced by form, events, and random
    let moraleDelta = formDelta * 0.5 + (Math.random() - 0.5) * 2;
    if (this.hasTrait('Leader')) moraleDelta += 1;
    if (this.hasTrait('Temperamental')) moraleDelta -= 1;
    this.morale = Math.max(0, Math.min(100, this.morale + moraleDelta));
    // Fitness
    this.fitness = Math.max(0, Math.min(100, this.fitness - minutes * 0.3 + this.attributes.naturalfitness * 0.05));
    // Suspension
    for (const e of events) {
      if (e.type === 'red' && e.playerId === this.id) this.suspension += 1;
      if (e.type === 'yellow' && e.playerId === this.id) this.suspension += 0.5;
    }
  }

  // Decision logic: context-aware, ultra-precise
  decideAction(context) {
    // Example: pass, shoot, dribble, hold, cross, clear, tackle
    const { pressure, distanceToGoal, teammates, instructions, matchMinute, isBigMatch, ballHeight, isGK } = context;
    // Weighted by attributes, fatigue, morale, form, traits, match context
    let passScore = this.attributes.passing + this.attributes.vision + this.form + this.morale - this.fatigue + (teammates.length * 2);
    let shootScore = this.attributes.finishing + this.attributes.composure + (100 - distanceToGoal) + this.form - this.fatigue;
    let dribbleScore = this.attributes.dribbling + this.attributes.flair + this.form - pressure - this.fatigue;
    let crossScore = this.attributes.crossing + this.attributes.vision + this.form - pressure - this.fatigue + (ballHeight < 2 ? 5 : 0);
    let clearScore = this.attributes.tackling + this.attributes.strength + this.attributes.bravery - pressure + (instructions === 'defend' ? 5 : 0);
    let tackleScore = this.attributes.tackling + this.attributes.positioning + this.form - this.fatigue - pressure;
    // GK logic
    let gkSaveScore = isGK ? (this.attributes.gkreflexes + this.attributes.gkpositioning + this.form - this.fatigue) : -Infinity;
    // Traits
    if (this.traits.includes('ShootsFromDistance')) shootScore += 7;
    if (this.traits.includes('LikesToDribble')) dribbleScore += 7;
    if (this.traits.includes('Crosser')) crossScore += 7;
    if (this.traits.includes('NoNonsenseDefender')) clearScore += 7;
    if (this.traits.includes('BigMatchPlayer') && isBigMatch) { passScore += 5; shootScore += 5; }
    // Tactical instructions
    if (instructions === 'attack') { shootScore += 4; dribbleScore += 2; }
    if (instructions === 'retain') passScore += 4;
    if (instructions === 'defend') { clearScore += 4; tackleScore += 2; }
    // Fatigue penalty
    passScore -= this.fatigue * 0.2;
    shootScore -= this.fatigue * 0.3;
    dribbleScore -= this.fatigue * 0.25;
    crossScore -= this.fatigue * 0.2;
    clearScore -= this.fatigue * 0.1;
    tackleScore -= this.fatigue * 0.15;
    // Morale bonus
    passScore += this.morale * 0.05;
    shootScore += this.morale * 0.05;
    dribbleScore += this.morale * 0.05;
    // Form bonus
    passScore += this.form * 0.05;
    shootScore += this.form * 0.05;
    dribbleScore += this.form * 0.05;
    // Pick best
    const scores = [
      { action: 'pass', score: passScore },
      { action: 'shoot', score: shootScore },
      { action: 'dribble', score: dribbleScore },
      { action: 'cross', score: crossScore },
      { action: 'clear', score: clearScore },
      { action: 'tackle', score: tackleScore },
      { action: 'gkSave', score: gkSaveScore },
    ];
    scores.sort((a, b) => b.score - a.score);
    return scores[0].action;
  }

  // Special traits: e.g. "Leader", "Injury Prone", "Big Match Player"
  hasTrait(trait) {
    return this.traits.includes(trait);
  }

  // Injury logic: call after match or training
  maybeInjure() {
    const risk = (100 - this.attributes.naturalfitness) * 0.01 + this.attributes.injuryproneness * 0.01;
    if (Math.random() < risk) {
      this.injured = true;
      this.injuryDays = Math.floor(Math.random() * 30) + 3;
      this.injuryHistory.push({ days: this.injuryDays, date: Date.now() });
    }
  }

  // Reset state at new season
  resetSeason() {
    this.fatigue = 0;
    this.form = 50;
    this.morale = 50;
    this.injured = false;
    this.injuryDays = 0;
    this.matchSharpness = 50;
    this.suspension = 0;
  }
}
