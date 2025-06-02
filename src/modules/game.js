/**
 * Core Game Logic Controller
 * Manages game state, player turns, victory conditions, and game flow
 * Supports both single-player (vs AI) and multiplayer modes
 */

const Player = require('./player');
const Board = require('./board');
const Ship = require('./ship');

class Game {
  /**
   * Creates a new game instance with default settings
   */
  constructor() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.phase = 'setup'; // Game phases: 'setup', 'playing', 'gameOver'
    this.over = false;
    this.winner = null;
    this.againstAI = false;
    this.boardSize = 10; // Default board dimensions
  }

  /**
   * Initializes the game with players and boards
   * Creates human player and AI/second player based on game mode
   * @param {string} playerOneName - Name for the human player
   */
  setup(playerOneName) {
    // Initialize human player with fleet and board
    const humanPlayer = new Player(
      playerOneName || 'Player',
      this.createFleet(),
      this.createBoard(this.boardSize)
    );
    humanPlayer.type = 'Human';
    this.players.push(humanPlayer);

    // Initialize AI or second human player
    const aiPlayer = new Player('', this.createFleet(), this.createBoard(this.boardSize));
    aiPlayer.type = 'Computer';
    this.players.push(aiPlayer);

    // Auto-place AI ships for single-player mode
    if (this.againstAI && this.players[1].type === 'Computer') {
      this.players[1].placeShipsRandomly();
    }

    this.currentPlayerIndex = 0; // Human player starts first
    this.phase = 'setup';
  }

  /**
   * Configures game mode (single-player vs multiplayer)
   * @param {string} gameType - 'single' for AI opponent, 'multiplayer' for human vs human
   */
  setGameType(gameType) {
    this.againstAI = gameType === 'single' ? true : false;
  }

  /**
   * Legacy method for adding players (maintained for compatibility)
   * @param {string} name - Player name
   * @param {number} boardSize - Board dimensions
   */
  setPlayer(name, boardSize) {
    this.players.push(new Player(name, this.createFleet(), this.createBoard(boardSize)));
  }

  /**
   * Sets the board dimensions for the game
   * @param {number} boardSize - Square board size (e.g., 10 for 10x10)
   */
  setBoardSize(boardSize) {
    this.boardSize = boardSize;
  }

  /**
   * Creates a standard battleship fleet
   * @returns {Ship[]} Array of ship objects representing the complete fleet
   */
  createFleet() {
    return [
      new Ship('Carrier'),
      new Ship('Battleship'),
      new Ship('Destroyer'),
      new Ship('Submarine'),
      new Ship('Cruiser'),
    ];
  }

  /**
   * Creates a new game board with current size settings
   * @returns {Board} New board instance
   */
  createBoard() {
    return new Board(this.boardSize);
  }

  /**
   * Gets the player whose turn it currently is
   * @returns {Player} Current active player
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Gets the player who is not currently taking their turn
   * @returns {Player} The opponent of the current player
   */
  getOpponent() {
    return this.players[1 - this.currentPlayerIndex];
  }

  /**
   * Alternates the active player turn
   */
  switchTurn() {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
  }

  /**
   * Transitions game from setup phase to active gameplay
   * Sets appropriate game state and ensures human player starts
   */
  startPlaying() {
    this.phase = 'playing';
    this.currentPlayerIndex = 0; // Human player always starts
  }

  /**
   * Processes a human player's attack move
   * Validates move legality and handles turn switching
   * @param {number} row - Target row coordinate
   * @param {number} column - Target column coordinate
   * @returns {Ship|string|boolean} Attack result: Ship if hit, 'miss' if miss, false if invalid
   */
  makeMove(row, column) {
    if (this.phase !== 'playing' || this.over) {
      return false;
    }

    const currentPlayer = this.getCurrentPlayer();
    const opponent = this.getOpponent();

    // Restrict to human player moves only
    if (currentPlayer.type !== 'Human') {
      return false;
    }

    // Prevent duplicate attacks on same coordinate
    if (opponent.board.isAttackedBefore(row, column)) {
      return false;
    }

    const result = currentPlayer.attack(opponent, row, column);

    // Check for victory condition
    if (opponent.board.allShipsSunk()) {
      this.over = true;
      this.winner = currentPlayer;
      this.phase = 'gameOver';
      return result;
    }

    // Turn continues on hit, switches on miss
    if (result === 'miss') {
      this.switchTurn();
    }

    return result;
  }

  /**
   * Processes an AI player's attack move with intelligent targeting
   * @returns {Object|null} Attack result object with position and outcome, or null if invalid
   */
  makeAIMove() {
    if (this.phase !== 'playing' || this.over) {
      return null;
    }

    const currentPlayer = this.getCurrentPlayer();
    const opponent = this.getOpponent();

    // Restrict to AI player moves only
    if (currentPlayer.type !== 'Computer') {
      return null;
    }

    const result = currentPlayer.AIAttack(opponent);

    if (!result) {
      return null;
    }

    // Check for victory condition
    if (opponent.board.allShipsSunk()) {
      this.over = true;
      this.winner = currentPlayer;
      this.phase = 'gameOver';
      return { result, row: null, column: null, gameOver: true };
    }

    // Turn continues on hit, switches on miss
    if (result === 'miss') {
      this.switchTurn();
    }

    return {
      result,
      row: currentPlayer.lastAttack?.row,
      column: currentPlayer.lastAttack?.column,
      gameOver: false,
    };
  }

  /**
   * Legacy method for backward compatibility
   * @returns {Player} Current active player
   */
  turn() {
    return this.getCurrentPlayer();
  }
}

module.exports = Game;
