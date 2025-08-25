// Player.js - Player class for Football Manager

export class Player {
  constructor({ name, age = 20, position = 'MID', speed = 5, skill = 5, stamina = 5, value = 100000, contract = 3, color = '#fff' }) {
    this.name = name;
    this.age = age;
    this.position = position; // e.g., GK, DEF, MID, FWD
    this.speed = speed;
    this.skill = skill;
    this.stamina = stamina;
    this.value = value;
    this.contract = contract; // years left
    this.color = color;
    this.fitness = 100;
    this.injured = false;
    this.goals = 0;
    this.assists = 0;
  }

  train() {
    // Simple training logic
    this.skill += Math.random() * 0.1;
    this.stamina += Math.random() * 0.1;
  }

  ageOneYear() {
    this.age++;
    this.contract--;
    if (this.age > 30) this.stamina -= 0.2;
  }
}
