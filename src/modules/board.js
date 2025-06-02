/**
 * Game Board Management System
 * Handles ship placement, attack processing, and game state tracking
 * Implements standard battleship rules including ship spacing requirements
 */
class Board {
  /**
   * Creates a new game board with specified dimensions
   * @param {number} size - Board dimensions (creates size x size grid)
   */
  constructor(size) {
    this.size = size;
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
    this.ships = [];
    this.attacks = {
      hit: new Set(),
      miss: new Set(),
    };
  }

  /**
   * Validates if coordinates are within board boundaries
   * @param {number} row - Row coordinate to validate
   * @param {number} column - Column coordinate to validate
   * @returns {boolean} True if coordinates are valid
   */
  isValidCoordinate(row, column) {
    return row >= 0 && row < this.size && column >= 0 && column < this.size;
  }

  /**
   * Calculates all cells a ship would occupy at given position
   * @param {number} row - Starting row coordinate
   * @param {number} column - Starting column coordinate
   * @param {number} length - Ship length
   * @param {string} direction - Ship orientation ('horizontal' or 'vertical')
   * @returns {Array} Array of {row, column} objects representing ship cells
   */
  getShipCells(row, column, length, direction) {
    const cells = [];
    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        cells.push({ row: row, column: column + i });
      } else {
        cells.push({ row: row + i, column: column });
      }
    }
    return cells;
  }

  /**
   * Gets all 8-directional neighboring cells for a given position
   * @param {number} row - Center row coordinate
   * @param {number} column - Center column coordinate
   * @returns {Array} Array of {row, column} objects for valid neighbors
   */
  getSurroundingCells(row, column) {
    const neighbors = [];
    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        if (deltaRow === 0 && deltaCol === 0) continue;

        const newRow = row + deltaRow;
        const newCol = column + deltaCol;

        if (this.isValidCoordinate(newRow, newCol)) {
          neighbors.push({ row: newRow, column: newCol });
        }
      }
    }
    return neighbors;
  }

  /**
   * Attempts to place a ship on the board
   * Validates placement rules including boundaries and ship spacing
   * @param {Ship} ship - The ship object to place
   * @param {number} row - Starting row coordinate
   * @param {number} column - Starting column coordinate
   * @param {string} direction - Ship orientation ('horizontal' or 'vertical')
   * @returns {boolean} True if placement successful, false otherwise
   */
  placeShip(ship, row, column, direction) {
    // Validate placement boundaries and spacing requirements
    if (
      !this.isValidCoordinate(row, column) ||
      (direction === 'vertical' && row + ship.length > this.size) ||
      (direction === 'horizontal' && column + ship.length > this.size) ||
      !this.isEmpty(ship, row, column, direction)
    ) {
      return false;
    }

    // Configure ship position and orientation
    ship.head = { row, column };
    ship.direction = direction;

    // Place ship segments on the grid
    const shipCells = this.getShipCells(row, column, ship.length, direction);
    shipCells.forEach((cell) => {
      this.grid[cell.row][cell.column] = ship;
    });

    this.ships.push(ship);
    return true;
  }

  /**
   * Validates ship placement by checking for conflicts and spacing violations
   * Ensures ships don't overlap and maintain proper spacing (including diagonals)
   * @param {Ship} ship - The ship to validate placement for
   * @param {number} row - Starting row coordinate
   * @param {number} column - Starting column coordinate
   * @param {string} direction - Ship orientation
   * @returns {boolean} True if position is valid for placement
   */
  isEmpty(ship, row, column, direction) {
    const shipCells = this.getShipCells(row, column, ship.length, direction);

    // Verify ship cells are unoccupied and within bounds
    for (const cell of shipCells) {
      if (
        !this.isValidCoordinate(cell.row, cell.column) ||
        this.grid[cell.row][cell.column] !== null
      ) {
        return false;
      }
    }

    // Enforce ship spacing rules - check all surrounding cells
    for (const cell of shipCells) {
      const neighbors = this.getSurroundingCells(cell.row, cell.column);
      for (const neighbor of neighbors) {
        if (this.grid[neighbor.row][neighbor.column] !== null) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Processes an attack on the specified coordinates
   * Handles hit/miss logic and updates attack tracking
   * @param {number} row - Target row coordinate
   * @param {number} column - Target column coordinate
   * @returns {Ship|string|boolean} Ship object if hit, 'miss' if miss, false if invalid
   */
  receiveAttack(row, column) {
    // Validate attack coordinates and prevent duplicate attacks
    if (!this.isValidCoordinate(row, column) || this.isAttackedBefore(row, column)) {
      return false;
    }

    // Process attack and update tracking
    if (this.grid[row][column]) {
      this.attacks.hit.add(`${row},${column}`);
      this.grid[row][column].hit();
    } else {
      this.attacks.miss.add(`${row},${column}`);
    }

    return this.grid[row][column] || 'miss';
  }

  /**
   * Checks if a coordinate has been previously attacked
   * @param {number} row - Row coordinate to check
   * @param {number} column - Column coordinate to check
   * @returns {boolean} True if coordinate was previously attacked
   */
  isAttackedBefore(row, column) {
    return this.attacks.hit.has(`${row},${column}`) || this.attacks.miss.has(`${row},${column}`);
  }

  /**
   * Determines if all ships on the board have been sunk
   * Used to check for game victory conditions
   * @returns {boolean} True if all ships are destroyed
   */
  allShipsSunk() {
    return this.ships.every((ship) => ship.isSunk() === true);
  }
}

module.exports = Board;
