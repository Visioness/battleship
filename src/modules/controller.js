/**
 * Main Controller Module - MVC Pattern Implementation
 * Coordinates interactions between game logic and user interface
 * Manages game state transitions and handles both human and AI player actions
 */

const Game = require('./game');
const View = require('./view');

class Controller {
  /**
   * Creates a new controller instance with game and view components
   */
  constructor() {
    this.game = new Game();
    this.view = new View();
    this.isWaitingForAI = false; // Prevents overlapping AI moves
  }

  /**
   * Processes attack results and updates UI with visual feedback
   * Handles ship destruction rendering and game over detection
   * @param {string} targetPlayerIndex - Target board ('One' or 'Two')
   * @param {Ship|string|boolean} result - Attack result
   * @param {number} row - Attack row coordinate
   * @param {number} column - Attack column coordinate
   * @returns {boolean} True if game continues, false if game over
   */
  processAttackResult(targetPlayerIndex, result, row, column) {
    // Update UI with attack results
    this.view.renderShot(targetPlayerIndex, result, row, column);

    // Handle ship destruction visual feedback
    if (result && result !== 'miss' && result.isSunk && result.isSunk()) {
      this.view.renderSunkShip(result, targetPlayerIndex);
    }

    // Check for game completion
    if (this.game.over) {
      this.view.showGameOver(this.game.winner);
      return false; // Game ended
    }

    return true; // Game continues
  }

  /**
   * Initializes the user interface with callback handlers
   * Sets up form handling for game configuration
   * @param {Function} gameTypeCallback - Handler for game type selection
   * @param {Function} boardSizeCallback - Handler for board size selection
   * @param {Function} playerNamesCallback - Handler for player name configuration
   */
  setup(gameTypeCallback, boardSizeCallback, playerNamesCallback) {
    this.view.createFormHandlers(gameTypeCallback, boardSizeCallback, playerNamesCallback);
  }

  /**
   * Configures game mode (single-player vs multiplayer)
   * @param {string} gameType - Selected game type
   */
  setGameType(gameType) {
    this.game.setGameType(gameType);
  }

  /**
   * Sets the board dimensions for the game
   * @param {number} boardSize - Square board size
   */
  setBoardSize(boardSize) {
    this.game.setBoardSize(boardSize);
  }

  /**
   * Initializes game with players and sets up ship placement phase
   * Creates game boards, fleet display, and drag-and-drop functionality
   * @param {string} playerOneName - Name of the human player
   * @param {string} playerTwoName - Name of second player (empty for AI)
   */
  initializeGame(playerOneName, playerTwoName) {
    // Initialize game logic with players
    this.game.setup(playerOneName, playerTwoName);

    // Set up user interface components
    this.view.drawGameBoards(this.game.boardSize, playerOneName, playerTwoName);
    this.view.drawFleet(this.game.players[0].fleet);
    this.view.handleDragEvents(this.game.players[0]);
    this.view.handleRotation();

    // Show setup notification
    this.view.showNotification('Drag and drop your ships onto the board to begin!', 'info', 5000);

    this.setupShipPlacementHandler();
  }

  /**
   * Configures automatic transition from ship placement to battle phase
   * Monitors ship placement progress and triggers game start when complete
   */
  setupShipPlacementHandler() {
    const checkShipsPlaced = () => {
      const remainingShips = this.game.players[0].fleet.length;

      if (remainingShips === 0) {
        this.view.showNotification('All ships placed! Preparing AI fleet...', 'success', 2000);
        setTimeout(() => {
          this.startBattlePhase();
        }, 1000);
      } else if (remainingShips <= 2) {
        this.view.showNotification(
          `${remainingShips} ship${remainingShips > 1 ? 's' : ''} remaining to place.`,
          'info',
          2000
        );
      }
    };

    // Enhanced drag event handling with completion detection
    const originalHandleDragEvents = this.view.handleDragEvents.bind(this.view);
    this.view.handleDragEvents = (player) => {
      originalHandleDragEvents(player);

      const dropHandler = (event) => {
        setTimeout(() => {
          checkShipsPlaced();
        }, 100); // Allow DOM updates to complete
      };

      this.view.boards.playerOne.addEventListener('drop', dropHandler);
    };

    this.view.handleDragEvents(this.game.players[0]);

    // Initial check for pre-placed ships
    setTimeout(() => {
      checkShipsPlaced();
    }, 500);
  }

  /**
   * Transitions from ship placement to active battle phase
   * Configures UI for gameplay and sets up attack event handlers
   */
  startBattlePhase() {
    this.game.startPlaying();

    // Update UI for battle phase
    this.view.fleetContainer.classList.add('hidden');
    this.view.main.querySelector('.change-direction').classList.add('hidden');

    // Show initial turn indicator
    const currentPlayer = this.game.getCurrentPlayer();
    this.view.showTurnIndicator(currentPlayer.name, currentPlayer.type === 'Computer');

    // Show game start notification
    this.view.showNotification('Battle has begun! Click on enemy cells to attack.', 'info', 4000);

    // Enable attack functionality
    this.view.handleAttackEvents((row, column) => this.playTurn(row, column));
  }

  /**
   * Processes a human player's turn including attack and victory checking
   * Handles turn validation, UI updates, and AI turn triggering
   * @param {number} row - Target row coordinate
   * @param {number} column - Target column coordinate
   */
  playTurn(row, column) {
    // Validate turn preconditions
    if (this.isWaitingForAI || this.game.over || this.game.phase !== 'playing') {
      if (this.isWaitingForAI) {
        this.view.showNotification('Please wait for AI to finish its turn.', 'warning', 2000);
      }
      return;
    }

    const result = this.game.makeMove(row, column);

    if (result === false) {
      this.view.showNotification(
        'Invalid move! Cell already attacked or out of bounds.',
        'warning',
        2000
      );
      return;
    }

    // Show attack result notification
    if (result === 'miss') {
      this.view.showNotification('Miss! Shot landed in water.', 'info', 2000);
    } else if (result && result !== 'miss') {
      if (result.isSunk && result.isSunk()) {
        this.view.showNotification(`Direct hit! ${result.name} destroyed!`, 'success', 3000);
      } else {
        this.view.showNotification('Direct hit! Enemy ship damaged.', 'success', 2000);
      }
    }

    // Process attack result and check for game over
    const gameStillActive = this.processAttackResult('Two', result, row, column);
    if (!gameStillActive) {
      this.view.hideTurnIndicator();
      return; // Game ended
    }

    // Update turn indicator for AI turn
    if (this.game.againstAI && this.game.getCurrentPlayer().type === 'Computer') {
      const aiPlayer = this.game.getCurrentPlayer();
      this.view.showTurnIndicator(aiPlayer.name, true);
      this.handleAITurn();
    }
  }

  /**
   * Manages AI turn execution with timing delays for better user experience
   * Handles recursive AI turns on successful hits and victory conditions
   */
  handleAITurn() {
    this.isWaitingForAI = true;

    // Add strategic delay to make AI moves visible
    setTimeout(() => {
      const aiResult = this.game.makeAIMove();

      if (aiResult && aiResult.result) {
        const { result, row, column } = aiResult;

        // Show AI attack notification
        const cellName = `${String.fromCharCode(65 + row)}${column + 1}`;
        if (result === 'miss') {
          this.view.showNotification(`AI attacked ${cellName} - Miss!`, 'info', 2000);
        } else if (result && result !== 'miss') {
          if (result.isSunk && result.isSunk()) {
            this.view.showNotification(
              `AI attacked ${cellName} - Your ${result.name} was destroyed!`,
              'error',
              3000
            );
          } else {
            this.view.showNotification(
              `AI attacked ${cellName} - Your ship was hit!`,
              'warning',
              2000
            );
          }
        }

        // Process attack result and check for game over
        const gameStillActive = this.processAttackResult('One', result, row, column);
        if (!gameStillActive) {
          this.isWaitingForAI = false;
          this.view.hideTurnIndicator();
          return; // Game ended
        }

        // AI continues turn on hit, otherwise return control to human
        if (result !== 'miss' && this.game.getCurrentPlayer().type === 'Computer') {
          setTimeout(() => this.handleAITurn(), 1000); // Delay consecutive AI moves
        } else {
          this.isWaitingForAI = false;
          // Update turn indicator back to human player
          const humanPlayer = this.game.players[0];
          this.view.showTurnIndicator(humanPlayer.name, false);
        }
      } else {
        this.isWaitingForAI = false;
        // Update turn indicator back to human player
        const humanPlayer = this.game.players[0];
        this.view.showTurnIndicator(humanPlayer.name, false);
      }
    }, 500); // AI "thinking" delay
  }

  /**
   * Legacy method for backward compatibility
   */
  handleDragEvents() {
    this.view.handleDragEvents(this.game);
  }

  /**
   * Legacy attack method - redirects to main turn handler
   * @param {number} row - Target row coordinate
   * @param {number} column - Target column coordinate
   */
  makeAttack(row, column) {
    this.playTurn(row, column);
  }

  /**
   * Checks if the game has ended
   * @returns {boolean} True if game is over
   */
  checkGameOver() {
    return this.game.over;
  }
}

module.exports = Controller;
