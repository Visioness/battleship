/**
 * Ship Configuration and Management
 * Defines standard naval vessel types with their corresponding lengths
 */

// Standard battleship fleet composition with historical ship sizes
const shipSizes = {
  Carrier: 5,
  Battleship: 4,
  Destroyer: 3,
  Submarine: 3,
  Cruiser: 2,
};

/**
 * Represents a naval ship in the battleship game
 * Tracks ship state including damage, position, and orientation
 */
class Ship {
  /**
   * Creates a new ship instance
   * @param {string} name - The ship type name (must match shipSizes keys)
   */
  constructor(name) {
    this.name = name;
    this.length = shipSizes[this.name];
    this.hitCount = 0;
    this.head = null; // Starting position coordinates {row, column}
    this.direction = null; // 'horizontal' or 'vertical'
  }

  /**
   * Registers a hit on this ship
   * Only increments hit count if ship is not already sunk
   */
  hit() {
    if (!this.isSunk()) this.hitCount++;
  }

  /**
   * Determines if the ship has been completely destroyed
   * @returns {boolean} True if all ship segments have been hit
   */
  isSunk() {
    return this.hitCount === this.length;
  }
}

module.exports = Ship;
