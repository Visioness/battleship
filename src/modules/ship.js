const shipSizes = {
  Carrier: 5,
  Battleship: 4,
  Destroyer: 3,
  Submarine: 3,
  'Patrol Boat': 2,
};

class Ship {
  constructor(name) {
    this.name = name;
    this.length = shipSizes[this.name];
    this.hitCount = 0;
  }

  hit() {
    if (!this.isSunk()) this.hitCount++;
  }

  isSunk() {
    return this.hitCount === this.length;
  }
}

module.exports = Ship;
