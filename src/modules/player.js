/**
 * Player Management and AI Intelligence System
 * Handles human and computer players with advanced AI targeting algorithms
 * Implements hunt/target behavior patterns for strategic gameplay
 */

const Ship = require('./ship');
const Board = require('./board');

class Player {
  /**
   * Creates a new player instance (human or AI)
   * @param {string} name - Player name (empty string defaults to Computer)
   * @param {Ship[]} ships - Fleet of ships for this player
   * @param {Board} board - Game board instance
   */
  constructor(name = '', ships, board) {
    this.type = name === '' ? 'Computer' : 'Human';
    this.name = name || 'Computer';
    this.fleet = ships;
    this.board = board;

    // AI strategic targeting system
    this.aiState = {
      mode: 'hunt', // 'hunt' (random) or 'target' (adjacent to hit)
      lastHit: null, // Coordinates of most recent successful hit
      targetQueue: [], // Priority queue of positions to attack
      hitShips: [], // Track hits on current target ship
      allHits: [], // Complete attack history for analysis
      knownWater: new Set(), // Cells confirmed to be empty (ship spacing)
    };

    this.lastAttack = null; // Track most recent attack coordinates
  }

  /**
   * Executes a basic attack on an enemy player
   * @param {Player} enemy - Target player to attack
   * @param {number} row - Target row coordinate
   * @param {number} column - Target column coordinate
   * @returns {Ship|string|boolean} Attack result from board
   */
  attack(enemy, row, column) {
    return enemy.board.receiveAttack(row, column);
  }

  /**
   * Executes an intelligent AI attack using hunt/target strategy
   * Employs sophisticated targeting algorithms for optimal ship destruction
   * @param {Player} enemy - Target player to attack
   * @returns {Ship|string|boolean} Attack result from board
   */
  AIAttack(enemy) {
    let row, column;
    let attempts = 0;
    const maxAttempts = 100;

    // Target mode: Focus on areas adjacent to known hits
    if (this.aiState.mode === 'target' && this.aiState.targetQueue.length > 0) {
      let validTargetFound = false;

      while (this.aiState.targetQueue.length > 0 && !validTargetFound && attempts < maxAttempts) {
        const target = this.aiState.targetQueue.shift();
        row = target.row;
        column = target.column;
        attempts++;

        // Validate target using board utility function
        if (
          enemy.board.isValidCoordinate(row, column) &&
          !enemy.board.isAttackedBefore(row, column)
        ) {
          validTargetFound = true;
        }
      }

      // Switch to hunt mode if no valid targets remain
      if (!validTargetFound) {
        this.aiState.mode = 'hunt';
        this.aiState.targetQueue = [];
        this.aiState.hitShips = [];
      }
    }

    // Hunt mode: Random targeting with strategic cell avoidance
    if (this.aiState.mode === 'hunt' || row === undefined || column === undefined) {
      let isValidTarget = false;

      do {
        row = Math.floor(Math.random() * enemy.board.size);
        column = Math.floor(Math.random() * enemy.board.size);
        attempts++;

        const cellKey = `${row},${column}`;
        const isKnownWater = this.aiState.knownWater.has(cellKey);
        const isAlreadyAttacked = enemy.board.isAttackedBefore(row, column);

        isValidTarget = !isAlreadyAttacked && !isKnownWater;
      } while (!isValidTarget && attempts < maxAttempts);
    }

    this.lastAttack = { row, column };
    const result = enemy.board.receiveAttack(row, column);

    // Update AI targeting strategy based on attack outcome
    this.processAttackResult(result, row, column, enemy);

    return result;
  }

  /**
   * Analyzes attack results and updates AI targeting strategy
   * Manages hunt/target mode transitions and target queue optimization
   * @param {Ship|string} result - Attack result (Ship object, 'miss', or false)
   * @param {number} row - Attack row coordinate
   * @param {number} column - Attack column coordinate
   * @param {Player} enemy - Enemy player reference for board access
   */
  processAttackResult(result, row, column, enemy) {
    // Track attack history for strategic analysis
    this.aiState.allHits.push({ row, column, result: result === 'miss' ? 'miss' : 'hit' });

    if (result && result !== 'miss') {
      // Successful hit - update targeting data
      this.aiState.lastHit = { row, column };
      this.aiState.hitShips.push({ row, column });

      // Check if ship is completely destroyed
      if (result.isSunk && result.isSunk()) {
        // Mark surrounding area as water to optimize future targeting
        this.markSurroundingCellsAsWater(result, enemy.board);
        this.aiState.hitShips = [];

        // Return to hunt mode if no targets queued
        if (this.aiState.targetQueue.length === 0) {
          this.aiState.mode = 'hunt';
        }
      } else {
        // Ship hit but not sunk - enter/continue target mode
        this.aiState.mode = 'target';

        if (this.aiState.hitShips.length === 1) {
          // First hit on ship - target orthogonal neighbors
          this.addOrthogonalTargets(row, column, enemy.board);
        } else if (this.aiState.hitShips.length >= 2) {
          // Multiple hits - determine ship orientation and target endpoints
          this.targetAlongShipLine(enemy.board);
        }
      }
    }
  }

  /**
   * Adds orthogonal (non-diagonal) neighboring cells to target queue
   * Used after first hit on a ship to find remaining segments
   * @param {number} row - Center row coordinate
   * @param {number} column - Center column coordinate
   * @param {Board} board - Board instance for validation
   */
  addOrthogonalTargets(row, column, board) {
    const directions = [
      { row: -1, column: 0 }, // north
      { row: 1, column: 0 }, // south
      { row: 0, column: -1 }, // west
      { row: 0, column: 1 }, // east
    ];

    directions.forEach((dir) => {
      const newRow = row + dir.row;
      const newColumn = column + dir.column;

      // Validate coordinates using board utility function
      if (board.isValidCoordinate(newRow, newColumn)) {
        const alreadyQueued = this.aiState.targetQueue.some(
          (target) => target.row === newRow && target.column === newColumn
        );

        if (!alreadyQueued) {
          this.aiState.targetQueue.push({ row: newRow, column: newColumn });
        }
      }
    });
  }

  /**
   * Determines ship orientation and targets endpoints for efficient destruction
   * Analyzes multiple hits to identify linear ship alignment
   * @param {Board} board - Board instance for boundary validation
   */
  targetAlongShipLine(board) {
    const hits = this.aiState.hitShips;
    if (hits.length < 2) return;

    let isHorizontal = false;
    let isVertical = false;

    // Detect horizontal alignment (same row)
    const firstRow = hits[0].row;
    if (hits.every((hit) => hit.row === firstRow)) {
      isHorizontal = true;
    }
    // Detect vertical alignment (same column)
    else {
      const firstCol = hits[0].column;
      if (hits.every((hit) => hit.column === firstCol)) {
        isVertical = true;
      }
    }

    if (isHorizontal || isVertical) {
      // Clear queue and target ship endpoints only
      this.aiState.targetQueue = [];

      if (isHorizontal) {
        const row = firstRow;
        const minCol = Math.min(...hits.map((h) => h.column));
        const maxCol = Math.max(...hits.map((h) => h.column));

        // Target both ends of horizontal ship using board validation
        if (board.isValidCoordinate(row, minCol - 1)) {
          this.aiState.targetQueue.push({ row: row, column: minCol - 1 });
        }
        if (board.isValidCoordinate(row, maxCol + 1)) {
          this.aiState.targetQueue.push({ row: row, column: maxCol + 1 });
        }
      } else if (isVertical) {
        const column = hits[0].column;
        const minRow = Math.min(...hits.map((h) => h.row));
        const maxRow = Math.max(...hits.map((h) => h.row));

        // Target both ends of vertical ship using board validation
        if (board.isValidCoordinate(minRow - 1, column)) {
          this.aiState.targetQueue.push({ row: minRow - 1, column: column });
        }
        if (board.isValidCoordinate(maxRow + 1, column)) {
          this.aiState.targetQueue.push({ row: maxRow + 1, column: column });
        }
      }
    }
  }

  /**
   * Marks all cells surrounding a sunk ship as known water
   * Optimizes future targeting by eliminating impossible ship locations
   * @param {Ship} sunkShip - The destroyed ship object
   * @param {Board} board - Board instance for validation and utilities
   */
  markSurroundingCellsAsWater(sunkShip, board) {
    // Calculate all cells occupied by the sunk ship using board utility
    const shipCells = board.getShipCells(
      sunkShip.head.row,
      sunkShip.head.column,
      sunkShip.length,
      sunkShip.direction
    );

    // Mark all surrounding cells (8-directional) as water using board utility
    const waterCells = new Set();

    shipCells.forEach((cell) => {
      const neighbors = board.getSurroundingCells(cell.row, cell.column);
      neighbors.forEach((neighbor) => {
        const cellKey = `${neighbor.row},${neighbor.column}`;
        waterCells.add(cellKey);
        this.aiState.knownWater.add(cellKey);
      });
    });

    // Remove water cells from target queue to optimize targeting
    this.aiState.targetQueue = this.aiState.targetQueue.filter((target) => {
      const targetKey = `${target.row},${target.column}`;
      return !waterCells.has(targetKey);
    });
  }

  /**
   * Automatically places all ships randomly on the board
   * Used for AI players to set up their fleet without human input
   * @returns {boolean} True if all ships placed successfully
   */
  placeShipsRandomly() {
    // Restrict to AI players only
    if (this.type !== 'Computer') return false;

    this.fleet.forEach((ship) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        // Generate random placement parameters
        const row = Math.floor(Math.random() * this.board.size);
        const column = Math.floor(Math.random() * this.board.size);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

        placed = this.board.placeShip(ship, row, column, direction);
        attempts++;
      }

      if (!placed) {
        // Silent failure - ship placement failed after maximum attempts
        return false;
      }
    });

    return true;
  }
}

module.exports = Player;
