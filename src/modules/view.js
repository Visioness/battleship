const cruiser = require('../assets/images/cruiser.svg');
const destroyer = require('../assets/images/destroyer.svg');
const submarine = require('../assets/images/submarine.svg');
const battleship = require('../assets/images/battleship.svg');
const carrier = require('../assets/images/carrier.svg');

class View {
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
  }

  setup(boardSize, playerOneName, playerTwoName) {
    this.drawGameBoards(boardSize, playerOneName, playerTwoName);
  }

  handleFormEvents(gameTypeCallback, boardSizeCallback, playerNamesCallback) {
    this.createFormHandlers(gameTypeCallback, boardSizeCallback, playerNamesCallback);
  }

  createFormHandlers(gameTypeCallback, boardSizeCallback, playerNamesCallback) {
    let gameType;
    let boardSize;
    let playerOneName;
    let playerTwoName;

    this.forms.gameType.addEventListener('submit', (event) => {
      event.preventDefault();

      this.forms.gameType.classList.toggle('hidden');
      this.forms.boardSize.classList.toggle('hidden');

      // Pass the game type
      gameType = this.forms.gameType.elements['game-type'].value;
      gameTypeCallback(gameType);
    });

    this.forms.boardSize.addEventListener('submit', (event) => {
      event.preventDefault();

      this.forms.boardSize.classList.toggle('hidden');
      this.forms.playerNames.classList.toggle('hidden');

      // Pass the board size
      boardSize = Number(this.forms.boardSize.elements['board-size'].value);
      boardSizeCallback(boardSize);
    });

    this.forms.playerNames.addEventListener('submit', (event) => {
      event.preventDefault();

      this.forms.playerNames.classList.toggle('hidden');
      this.gameContainer.classList.toggle('hidden');
      this.fleetContainer.classList.toggle('hidden');
      this.main.querySelector('.change-direction').classList.toggle('hidden');

      // Pass the player names
      playerOneName = this.forms.playerNames.elements['player-one-name'].value;
      playerTwoName =
        gameType === 'single' ? '' : this.forms.playerNames.elements['player-two-name'].value;
      playerNamesCallback(playerOneName, playerTwoName);
    });
  }

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

  handleDragEvents(player) {
    // Assuming the board is the player's board and the game is single player
    const playerShips = player.fleet;
    const playerBoard = player.board;
    let draggedShip = null;
    let dropZone = null;

    this.fleetElement.addEventListener('dragstart', (event) => {
      const target = event.target.closest('.ship');
      if (target) {
        draggedShip = target;
        draggedShip.classList.add('dragging');

        // Create an empty element to use as drag image
        const emptyElement = document.createElement('div');
        emptyElement.style.opacity = '0';
        document.body.appendChild(emptyElement);

        // Set the drag image to the empty element
        event.dataTransfer.setDragImage(emptyElement, 0, 0);

        // Clean up
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

          // Place the ship on logic side
          playerBoard.placeShip(
            ship,
            Number(cell.dataset.row),
            Number(cell.dataset.column),
            draggedShip.dataset.direction
          );

          player.fleet.splice(player.fleet.indexOf(ship), 1);

          // Place the ship on view side
          const cellRow = Number(cell.dataset.row);
          const cellColumn = Number(cell.dataset.column);
          for (let i = 0; i < Number(draggedShip.dataset.length); i++) {
            if (draggedShip.dataset.direction === 'horizontal') {
              const cellToMark = document.getElementById(`player-one-${cellRow},${cellColumn + i}`);
              cellToMark.classList.add('ship-part');
            } else {
              const cellToMark = document.getElementById(`player-one-${cellRow + i},${cellColumn}`);
              cellToMark.classList.add('ship-part');
            }
          }

          this.fleetElement.removeChild(draggedShip);
          cell.appendChild(draggedShip);

          if (player.fleet.length === 0) {
            document.querySelector('.start-game').classList.remove('hidden');
            this.fleetContainer.classList.add('hidden');
          }

          // Clear the position preview
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

  isPositionAvailable(cell, draggedShip) {
    const shipLength = Number(draggedShip.dataset.length);
    const isHorizontal = draggedShip.dataset.direction === 'horizontal';
    const boardSize = Number(this.boards.playerOne.dataset.size);

    const cellRow = Number(cell.dataset.row);
    const cellColumn = Number(cell.dataset.column);

    if (
      cellRow < 0 ||
      cellColumn < 0 ||
      cellRow >= boardSize ||
      cellColumn >= boardSize ||
      (!isHorizontal && cellRow + shipLength > boardSize) ||
      (isHorizontal && cellColumn + shipLength > boardSize)
    ) {
      return false;
    }

    for (let i = 0; i < shipLength; i++) {
      if (isHorizontal) {
        const cellToCheck = document.getElementById(`player-one-${cellRow},${cellColumn + i}`);
        if (cellToCheck.classList.contains('ship-part')) {
          return false;
        }
      } else {
        const cellToCheck = document.getElementById(`player-one-${cellRow + i},${cellColumn}`);
        if (cellToCheck.classList.contains('ship-part')) {
          return false;
        }
      }
    }

    return true;
  }

  showPosition(cell, draggedShip, className) {
    const shipLength = Number(draggedShip.dataset.length);
    const isHorizontal = draggedShip.dataset.direction === 'horizontal';
    const boardSize = Number(this.boards.playerOne.dataset.size);

    const cellRow = Number(cell.dataset.row);
    const cellColumn = Number(cell.dataset.column);

    for (let i = 0; i < shipLength; i++) {
      if (isHorizontal) {
        if (cellColumn + i < boardSize) {
          const cellToMark = document.getElementById(`player-one-${cellRow},${cellColumn + i}`);
          cellToMark.classList.add(className);
        }
      } else {
        if (cellRow + i < boardSize) {
          const cellToMark = document.getElementById(`player-one-${cellRow + i},${cellColumn}`);
          cellToMark.classList.add(className);
        }
      }
    }
  }

  clearPosition(cell, draggedShip) {
    const shipLength = Number(draggedShip.dataset.length);
    const isHorizontal = draggedShip.dataset.direction === 'horizontal';
    const boardSize = Number(this.boards.playerOne.dataset.size);

    const cellRow = Number(cell.dataset.row);
    const cellColumn = Number(cell.dataset.column);

    for (let i = 0; i < shipLength; i++) {
      if (isHorizontal) {
        if (cellColumn + i < boardSize) {
          const cellToClear = document.getElementById(`player-one-${cellRow},${cellColumn + i}`);
          cellToClear.classList.remove('valid', 'invalid');
        }
      } else {
        if (cellRow + i < boardSize) {
          const cellToClear = document.getElementById(`player-one-${cellRow + i},${cellColumn}`);
          cellToClear.classList.remove('valid', 'invalid');
        }
      }
    }
  }

  handleRotation() {
    const directionButton = this.main.querySelector('.change-direction');
    directionButton.addEventListener('click', () => {
      this.changeDirection(directionButton);
    });
  }

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
}

module.exports = View;
