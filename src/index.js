/**
 * Battleship Game Entry Point
 * Initializes the game controller and sets up callback handlers for game configuration
 */

require('./styles/style.css');
const Controller = require('./modules/controller');

// Initialize the main game controller
const controller = new Controller();

/**
 * Handles game type selection (single player vs multiplayer)
 * @param {string} gameType - The selected game type ('single' or 'multiplayer')
 */
const gameTypeCallback = (gameType) => {
  controller.setGameType(gameType);
};

/**
 * Handles board size selection
 * @param {number} boardSize - The selected board dimensions (e.g., 10 for 10x10)
 */
const boardSizeCallback = (boardSize) => {
  controller.setBoardSize(boardSize);
};

/**
 * Handles player name configuration and game initialization
 * @param {string} playerOneName - Name of the first player
 * @param {string} playerTwoName - Name of the second player (empty for AI)
 */
const playerNamesCallback = (playerOneName, playerTwoName) => {
  controller.initializeGame(playerOneName, playerTwoName);
};

// Configure controller with callback handlers and start the game setup
controller.setup(gameTypeCallback, boardSizeCallback, playerNamesCallback);
