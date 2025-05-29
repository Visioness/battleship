class View {
  constructor() {
    this.forms = {
      gameType: document.getElementById('game-type-form'),
      boardSize: document.getElementById('board-size-form'),
      playerNames: document.getElementById('player-names-form'),
    };
    this.gameContainer = document.getElementById('game-container');
    this.fleetContainer = document.querySelector('.fleet-container');
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
    this.fleetContainer.innerHTML = '';

    fleet.forEach((ship) => {
      const fleetItem = document.createElement('div');
      fleetItem.classList.add('fleet-item');
      fleetItem.innerHTML = `
        <div class="fleet-item-name">${ship.name.toUpperCase()}</div>
        <img width="100" height="50" src="" alt="${ship.name}">
      `;
      this.fleetContainer.appendChild(fleetItem);
    });
  }
}

module.exports = View;
