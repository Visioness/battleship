/**
 * User Interface Management System
 * Handles all DOM manipulation, visual feedback, and user interactions
 * Implements the View component of the MVC pattern for the battleship game
 */

const cruiser = require('../assets/images/cruiser.svg');
const destroyer = require('../assets/images/destroyer.svg');
const submarine = require('../assets/images/submarine.svg');
const battleship = require('../assets/images/battleship.svg');
const carrier = require('../assets/images/carrier.svg');

class View {
  /**
   * Initializes the view with DOM element references and ship image mapping
   */
  constructor() {
    this.forms = {
      gameType: document.getElementById('game-type-form'),
      boardSize: document.getElementById('board-size-form'),
      playerNames: document.getElementById('player-names-form'),
    };
    this.gameContainer = document.getElementById('game-container');
    this.fleetContainer = document.querySelector('.fleet-container');
    this.fleetElement = document.querySelector('.fleet-container .fleet');
    this.main = document.querySelector('main');
    this.players = {
      playerOne: document.querySelector('#player-one'),
      playerTwo: document.querySelector('#player-two'),
    };
    this.boards = {
      playerOne: this.players.playerOne.querySelector('.game-board'),
      playerTwo: this.players.playerTwo.querySelector('.game-board'),
    };
    this.names = {
      playerOne: this.players.playerOne.querySelector('.player-name'),
      playerTwo: this.players.playerTwo.querySelector('.player-name'),
    };

    // Welcome dialog elements
    this.welcomeDialog = document.getElementById('welcome-dialog');
    this.initializeWelcomeDialog();

    // Turn indicator and notification system
    this.turnIndicator = document.getElementById('turn-indicator');
    this.turnText = document.getElementById('turn-text');
    this.notificationContainer = document.getElementById('notification-container');
  }

  /**
   * Initializes welcome dialog functionality and checks for first-time users
   * Sets up event handlers and manages localStorage for user preferences
   */
  initializeWelcomeDialog() {
    if (!this.welcomeDialog) return;

    // Check if user is visiting for the first time
    const hasSeenWelcome = localStorage.getItem('battleship-welcome-seen');

    if (!hasSeenWelcome) {
      this.showWelcomeDialog();
    }

    // Set up event handlers
    const closeButton = document.getElementById('close-welcome');
    const startButton = document.getElementById('start-game');
    const skipButton = document.getElementById('skip-tutorial');

    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideWelcomeDialog());
    }

    if (startButton) {
      startButton.addEventListener('click', () => {
        this.hideWelcomeDialog();
        this.markWelcomeSeen();
      });
    }

    if (skipButton) {
      skipButton.addEventListener('click', () => {
        this.hideWelcomeDialog();
        this.markWelcomeSeen();
      });
    }

    // Close dialog when clicking outside
    this.welcomeDialog.addEventListener('click', (event) => {
      if (event.target === this.welcomeDialog) {
        this.hideWelcomeDialog();
        this.markWelcomeSeen();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.welcomeDialog.classList.contains('hidden')) {
        this.hideWelcomeDialog();
        this.markWelcomeSeen();
      }
    });

    // Set up help button
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
      helpButton.addEventListener('click', () => {
        this.showWelcomeDialog();
      });
    }
  }

  /**
   * Shows the welcome dialog with smooth animation
   */
  showWelcomeDialog() {
    if (this.welcomeDialog) {
      this.welcomeDialog.classList.remove('hidden');
    }
  }

  /**
   * Hides the welcome dialog with smooth animation
   */
  hideWelcomeDialog() {
    if (this.welcomeDialog) {
      this.welcomeDialog.classList.add('hidden');
    }
  }

  /**
   * Marks that the user has seen the welcome dialog
   * Stores preference in localStorage to avoid showing again
   */
  markWelcomeSeen() {
    localStorage.setItem('battleship-welcome-seen', 'true');
  }

  /**
   * Forces the welcome dialog to show again (useful for testing or help button)
   */
  resetWelcomeDialog() {
    localStorage.removeItem('battleship-welcome-seen');
    this.showWelcomeDialog();
  }

  /**
   * Generates standardized cell ID for DOM elements
   * @param {string} playerIndex - Player identifier ('One' or 'Two')
   * @param {number} row - Row coordinate
   * @param {number} column - Column coordinate
   * @returns {string} Formatted cell ID
   */
  getCellId(playerIndex, row, column) {
    return `player-${playerIndex.toLowerCase()}-${row},${column}`;
  }

  /**
   * Extracts ship direction and size data from DOM element
   * @param {Element} shipElement - Ship DOM element
   * @returns {Object} Object containing direction, length, and boardSize
   */
  getShipData(shipElement) {
    return {
      isHorizontal: shipElement.dataset.direction === 'horizontal',
      length: Number(shipElement.dataset.length),
      boardSize: Number(this.boards.playerOne.dataset.size),
    };
  }

  /**
   * Calculates all cells a ship would occupy in the UI
   * @param {number} row - Starting row coordinate
   * @param {number} column - Starting column coordinate
   * @param {number} length - Ship length
   * @param {boolean} isHorizontal - Ship orientation
   * @param {number} boardSize - Board dimensions for boundary checking
   * @returns {Array} Array of {row, column} objects representing ship cells
   */
  getShipCells(row, column, length, isHorizontal, boardSize = null) {
    const cells = [];
    for (let i = 0; i < length; i++) {
      const cellRow = isHorizontal ? row : row + i;
      const cellCol = isHorizontal ? column + i : column;

      // Only add cells within bounds if boardSize is provided
      if (
        !boardSize ||
        (cellRow >= 0 && cellRow < boardSize && cellCol >= 0 && cellCol < boardSize)
      ) {
        cells.push({ row: cellRow, column: cellCol });
      }
    }
    return cells;
  }

  /**
   * Validates if coordinates are within board boundaries
   * @param {number} row - Row coordinate
   * @param {number} column - Column coordinate
   * @param {number} boardSize - Board dimensions
   * @returns {boolean} True if coordinates are valid
   */
  isValidCoordinate(row, column, boardSize) {
    return row >= 0 && row < boardSize && column >= 0 && column < boardSize;
  }

  /**
   * Applies or removes CSS class to ship cells
   * @param {number} row - Starting row coordinate
   * @param {number} column - Starting column coordinate
   * @param {Element} shipElement - Ship DOM element
   * @param {string} className - CSS class to apply/remove
   * @param {boolean} add - True to add class, false to remove
   */
  modifyShipCells(row, column, shipElement, className, add = true) {
    const { isHorizontal, length, boardSize } = this.getShipData(shipElement);
    const cells = this.getShipCells(row, column, length, isHorizontal, boardSize);

    cells.forEach((cell) => {
      const cellElement = document.getElementById(this.getCellId('One', cell.row, cell.column));
      if (cellElement) {
        if (add) {
          cellElement.classList.add(className);
        } else {
          cellElement.classList.remove(className);
        }
      }
    });
  }

  /**
   * Legacy method for form event handling (maintained for compatibility)
   * @param {Function} gameTypeCallback - Game type selection handler
   * @param {Function} boardSizeCallback - Board size selection handler
   * @param {Function} playerNamesCallback - Player names configuration handler
   */
  handleFormEvents(gameTypeCallback, boardSizeCallback, playerNamesCallback) {
    this.createFormHandlers(gameTypeCallback, boardSizeCallback, playerNamesCallback);
  }

  /**
   * Sets up form submission handlers for game configuration
   * Manages progressive form display and data collection
   * @param {Function} gameTypeCallback - Handler for game type selection
   * @param {Function} boardSizeCallback - Handler for board size selection
   * @param {Function} playerNamesCallback - Handler for player names input
   */
  createFormHandlers(gameTypeCallback, boardSizeCallback, playerNamesCallback) {
    let gameType;
    let boardSize;
    let playerOneName;

    this.forms.gameType.addEventListener('submit', (event) => {
      event.preventDefault();

      this.forms.gameType.classList.toggle('hidden');
      this.forms.boardSize.classList.toggle('hidden');

      gameType = this.forms.gameType.elements['game-type'].value;
      gameTypeCallback(gameType);
    });

    this.forms.boardSize.addEventListener('submit', (event) => {
      event.preventDefault();

      this.forms.boardSize.classList.toggle('hidden');
      this.forms.playerNames.classList.toggle('hidden');

      boardSize = Number(this.forms.boardSize.elements['board-size'].value);
      boardSizeCallback(boardSize);
    });

    this.forms.playerNames.addEventListener('submit', (event) => {
      event.preventDefault();

      this.forms.playerNames.classList.toggle('hidden');
      this.gameContainer.classList.toggle('hidden');
      this.fleetContainer.classList.toggle('hidden');
      this.main.querySelector('.change-direction').classList.toggle('hidden');

      playerOneName = this.forms.playerNames.elements['player-one-name'].value;
      // Since we only support single player mode now, player two is always AI
      playerNamesCallback(playerOneName, '');
    });
  }

  /**
   * Generates the visual game boards with proper cell identification
   * Creates interactive grid cells for both player boards
   * @param {number} boardSize - Dimensions of the square game board
   * @param {string} playerOneName - Display name for first player
   * @param {string} playerTwoName - Display name for second player (or AI)
   */
  drawGameBoards(boardSize, playerOneName, playerTwoName) {
    this.names.playerOne.textContent = playerOneName.toUpperCase() || 'PLAYER ONE';
    this.names.playerTwo.textContent = playerTwoName.toUpperCase() || 'AI';

    this.boards.playerOne.innerHTML = '';
    this.boards.playerTwo.innerHTML = '';
    this.boards.playerOne.dataset.size = boardSize;
    this.boards.playerTwo.dataset.size = boardSize;

    const players = [
      { board: this.boards.playerOne, prefix: 'player-one' },
      { board: this.boards.playerTwo, prefix: 'player-two' },
    ];

    players.forEach(({ board, prefix }) => {
      for (let i = 0; i < boardSize; i++) {
        const row = document.createElement('div');
        row.classList.add('row');

        for (let j = 0; j < boardSize; j++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.draggable = false;
          cell.id = `${prefix}-${i},${j}`;
          cell.dataset.row = i;
          cell.dataset.column = j;

          row.appendChild(cell);
        }

        board.appendChild(row);
      }
    });
  }

  /**
   * Renders the ship fleet interface for player ship placement
   * Creates draggable ship elements with visual representations
   * @param {Ship[]} fleet - Array of ship objects to display
   */
  drawFleet(fleet) {
    this.fleetElement.innerHTML = '';
    const shipImages = {
      cruiser: cruiser,
      destroyer: destroyer,
      submarine: submarine,
      battleship: battleship,
      carrier: carrier,
    };

    fleet.forEach((ship) => {
      const shipElement = document.createElement('div');
      shipElement.classList.add('ship');
      shipElement.draggable = true;
      shipElement.dataset.length = ship.length;
      shipElement.dataset.type = ship.name.toLowerCase();
      shipElement.dataset.direction = 'horizontal';

      shipElement.innerHTML = `
        <span class="name">${ship.name.toUpperCase()}</span>
        <img class="view" width="100" height="50" src="${shipImages[ship.name.toLowerCase()]}" alt="${ship.name}">
      `;

      this.fleetElement.appendChild(shipElement);
    });
  }

  /**
   * Implements comprehensive drag-and-drop functionality for ship placement
   * Handles visual feedback, validation, and automatic fleet updates
   * @param {Player} player - Player object containing fleet and board references
   */
  handleDragEvents(player) {
    const playerShips = player.fleet;
    const playerBoard = player.board;
    let draggedShip = null;
    let dropZone = null;

    this.fleetElement.addEventListener('dragstart', (event) => {
      const target = event.target.closest('.ship');
      if (target) {
        draggedShip = target;
        draggedShip.classList.add('dragging');

        // Create invisible drag image for custom visual feedback
        const emptyElement = document.createElement('div');
        emptyElement.style.opacity = '0';
        document.body.appendChild(emptyElement);

        event.dataTransfer.setDragImage(emptyElement, 0, 0);

        requestAnimationFrame(() => {
          document.body.removeChild(emptyElement);
        });
      }
    });

    this.boards.playerOne.addEventListener('dragover', (event) => {
      event.preventDefault();
      const cell = document.elementFromPoint(event.clientX, event.clientY);
      if (cell && cell.classList.contains('cell') && draggedShip) {
        if (dropZone && dropZone !== cell) {
          this.clearPosition(dropZone, draggedShip);
        }

        if (this.isPositionAvailable(cell, draggedShip)) {
          this.showPosition(cell, draggedShip, 'valid');
        } else {
          this.showPosition(cell, draggedShip, 'invalid');
        }
        dropZone = cell;
      }
    });

    this.boards.playerOne.addEventListener('drop', (event) => {
      event.preventDefault();
      const cell = document.elementFromPoint(event.clientX, event.clientY);

      if (cell && cell.classList.contains('cell') && draggedShip) {
        if (dropZone && dropZone.classList.contains('valid')) {
          const ship = playerShips.find(
            (ship) => ship.name.toLowerCase() === draggedShip.dataset.type
          );

          // Update game logic
          playerBoard.placeShip(
            ship,
            Number(cell.dataset.row),
            Number(cell.dataset.column),
            draggedShip.dataset.direction
          );

          player.fleet.splice(player.fleet.indexOf(ship), 1);

          // Update visual representation using utility function
          const { isHorizontal, length } = this.getShipData(draggedShip);
          const cellRow = Number(cell.dataset.row);
          const cellColumn = Number(cell.dataset.column);
          const cells = this.getShipCells(cellRow, cellColumn, length, isHorizontal);

          cells.forEach((cell) => {
            const cellElement = document.getElementById(
              this.getCellId('One', cell.row, cell.column)
            );
            if (cellElement) {
              cellElement.classList.add('ship-part');
            }
          });

          this.fleetElement.removeChild(draggedShip);
          cell.appendChild(draggedShip);

          if (player.fleet.length === 0) {
            this.fleetContainer.classList.add('hidden');
          }

          this.clearPosition(dropZone, draggedShip);
          draggedShip.classList.remove('dragging');
          dropZone = null;
          draggedShip = null;
        }
      }
    });

    this.fleetElement.addEventListener('dragend', (event) => {
      if (dropZone) {
        this.clearPosition(dropZone, draggedShip);
      }

      draggedShip.classList.remove('dragging');
      draggedShip = null;
      dropZone = null;
    });
  }

  /**
   * Validates whether a ship can be placed at the specified position
   * Checks boundary constraints and ship spacing requirements
   * @param {Element} cell - Target cell DOM element
   * @param {Element} draggedShip - Ship element being placed
   * @returns {boolean} True if position is valid for ship placement
   */
  isPositionAvailable(cell, draggedShip) {
    const { isHorizontal, length, boardSize } = this.getShipData(draggedShip);
    const cellRow = Number(cell.dataset.row);
    const cellColumn = Number(cell.dataset.column);

    // Validate board boundaries
    if (
      !this.isValidCoordinate(cellRow, cellColumn, boardSize) ||
      (!isHorizontal && cellRow + length > boardSize) ||
      (isHorizontal && cellColumn + length > boardSize)
    ) {
      return false;
    }

    // Calculate ship cell positions and check for conflicts
    const shipCells = this.getShipCells(cellRow, cellColumn, length, isHorizontal);

    // Check for occupied cells
    for (const shipCell of shipCells) {
      const cellToCheck = document.getElementById(
        this.getCellId('One', shipCell.row, shipCell.column)
      );
      if (cellToCheck && cellToCheck.classList.contains('ship-part')) {
        return false;
      }
    }

    // Enforce ship spacing rules (8-directional)
    for (const shipCell of shipCells) {
      for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
        for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
          if (deltaRow === 0 && deltaCol === 0) continue;

          const checkRow = shipCell.row + deltaRow;
          const checkCol = shipCell.column + deltaCol;

          if (this.isValidCoordinate(checkRow, checkCol, boardSize)) {
            const cellToCheck = document.getElementById(this.getCellId('One', checkRow, checkCol));
            if (cellToCheck && cellToCheck.classList.contains('ship-part')) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  /**
   * Displays visual preview of ship placement during drag operations
   * @param {Element} cell - Target cell for ship placement
   * @param {Element} draggedShip - Ship being dragged
   * @param {string} className - CSS class for visual feedback ('valid' or 'invalid')
   */
  showPosition(cell, draggedShip, className) {
    const cellRow = Number(cell.dataset.row);
    const cellColumn = Number(cell.dataset.column);
    this.modifyShipCells(cellRow, cellColumn, draggedShip, className, true);
  }

  /**
   * Removes visual preview indicators from board cells
   * @param {Element} cell - Base cell for clearing preview
   * @param {Element} draggedShip - Ship element being dragged
   */
  clearPosition(cell, draggedShip) {
    const cellRow = Number(cell.dataset.row);
    const cellColumn = Number(cell.dataset.column);
    this.modifyShipCells(cellRow, cellColumn, draggedShip, 'valid', false);
    this.modifyShipCells(cellRow, cellColumn, draggedShip, 'invalid', false);
  }

  /**
   * Sets up ship rotation control functionality
   */
  handleRotation() {
    const directionButton = this.main.querySelector('.change-direction');
    directionButton.addEventListener('click', () => {
      this.changeDirection(directionButton);
    });
  }

  /**
   * Toggles ship orientation between horizontal and vertical
   * Updates all available ships and UI indicators
   * @param {Element} directionButton - Rotation button element
   */
  changeDirection(directionButton) {
    const ships = this.fleetElement.querySelectorAll('.ship');
    const direction = directionButton.querySelector('.direction-icon').dataset.direction;

    if (direction === 'horizontal') {
      directionButton.querySelector('.direction-icon').dataset.direction = 'vertical';
      directionButton.querySelector('.direction-text').textContent = 'Vertical';
    } else {
      directionButton.querySelector('.direction-icon').dataset.direction = 'horizontal';
      directionButton.querySelector('.direction-text').textContent = 'Horizontal';
    }

    ships.forEach((ship) => {
      ship.dataset.direction = directionButton.querySelector('.direction-icon').dataset.direction;
    });
  }

  /**
   * Sets up click event handling for enemy board attacks
   * @param {Function} playTurnCallback - Handler function for processing attacks
   */
  handleAttackEvents(playTurnCallback) {
    this.boards.playerTwo.addEventListener('click', (event) => {
      const cell = event.target.closest('.cell');
      if (cell) {
        playTurnCallback(Number(cell.dataset.row), Number(cell.dataset.column));
      }
    });
  }

  /**
   * Renders visual feedback for attack results on game boards
   * @param {string} playerIndex - Target board ('One' or 'Two')
   * @param {Ship|string} result - Attack result (Ship object for hit, 'miss' for miss)
   * @param {number} row - Target row coordinate
   * @param {number} column - Target column coordinate
   */
  renderShot(playerIndex, result, row, column) {
    const cell = document.getElementById(this.getCellId(playerIndex, row, column));

    if (!cell) {
      return; // Silent failure - cell not found
    }

    // Clear previous shot indicators
    cell.classList.remove('miss', 'hit', 'shot');

    // Apply appropriate visual feedback
    if (result === 'miss') {
      cell.classList.add('miss');
    } else {
      cell.classList.add('hit');
    }
    cell.classList.add('shot');
  }

  /**
   * Displays warning messages for invalid actions
   * @param {string} message - Warning message to display
   */
  renderWarning(message = 'Invalid move!') {
    this.showNotification(message, 'warning', 2000);
  }

  /**
   * Renders visual indication of destroyed ships with detailed graphics
   * @param {Ship} ship - Destroyed ship object
   * @param {string} playerIndex - Target board ('One' or 'Two')
   */
  renderSunkShip(ship, playerIndex) {
    const row = ship.head.row;
    const column = ship.head.column;

    const shipImages = {
      cruiser: cruiser,
      destroyer: destroyer,
      submarine: submarine,
      battleship: battleship,
      carrier: carrier,
    };

    // Calculate ship cells and mark as sunk
    const isHorizontal = ship.direction === 'horizontal';
    const cells = this.getShipCells(row, column, ship.length, isHorizontal);

    cells.forEach((cell, index) => {
      const cellElement = document.getElementById(
        this.getCellId(playerIndex, cell.row, cell.column)
      );

      if (cellElement) {
        cellElement.classList.add('sunk');
        cellElement.classList.add('ship-part');

        // Add ship visualization to head segment
        if (index === 0) {
          cellElement.innerHTML = '';

          const shipElement = document.createElement('div');
          shipElement.classList.add('ship', 'sunk-ship');
          shipElement.dataset.length = ship.length;
          shipElement.dataset.type = ship.name.toLowerCase();
          shipElement.dataset.direction = ship.direction;

          shipElement.innerHTML = `
            <span class="name">${ship.name.toUpperCase()}</span>
            <img class="view" width="100" height="50" src="${shipImages[ship.name.toLowerCase()]}" alt="${ship.name}">
          `;

          cellElement.appendChild(shipElement);
        }
      } else {
        // Silent failure - cell not found
      }
    });
  }

  /**
   * Displays game over screen with winner announcement and restart option
   * @param {Player} winner - Winning player object
   */
  showGameOver(winner) {
    this.main.innerHTML = '';
    const gameOverMessage = document.createElement('div');
    gameOverMessage.classList.add('game-over');
    gameOverMessage.innerHTML = `
      <h2>Game Over!</h2>
      <p>${winner.name} wins!</p>
      <button onclick="location.reload()">Play Again</button>
    `;
    this.main.appendChild(gameOverMessage);
  }

  /**
   * Shows the turn indicator with player information
   * @param {string} playerName - Name of the current player
   * @param {boolean} isAI - Whether the current player is AI
   */
  showTurnIndicator(playerName, isAI = false) {
    if (!this.turnIndicator || !this.turnText) return;

    this.turnText.textContent = isAI ? 'AI Thinking...' : `${playerName}'s Turn`;

    if (isAI) {
      this.turnIndicator.classList.add('ai-turn');
    } else {
      this.turnIndicator.classList.remove('ai-turn');
    }

    this.turnIndicator.classList.remove('hidden');
  }

  /**
   * Hides the turn indicator
   */
  hideTurnIndicator() {
    if (this.turnIndicator) {
      this.turnIndicator.classList.add('hidden');
    }
  }

  /**
   * Shows a notification to the user
   * @param {string} message - The notification message
   * @param {string} type - Notification type ('success', 'info', 'warning', 'error')
   * @param {number} duration - Auto-hide duration in milliseconds (0 = manual close)
   */
  showNotification(message, type = 'info', duration = 3000) {
    if (!this.notificationContainer) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    };

    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-text">${message}</span>
      </div>
      <button class="notification-close">&times;</button>
    `;

    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification);
    });

    this.notificationContainer.appendChild(notification);

    // Trigger show animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto-hide if duration is set
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * Removes a notification with smooth animation
   * @param {Element} notification - The notification element to remove
   */
  removeNotification(notification) {
    if (!notification) return;

    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 700);
  }

  /**
   * Clears all notifications
   */
  clearNotifications() {
    if (this.notificationContainer) {
      this.notificationContainer.innerHTML = '';
    }
  }
}

module.exports = View;
