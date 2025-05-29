const Player = require('./player');
const Board = require('./board');
const Ship = require('./ship');

class Game {
  constructor() {
    this.players = [];
    this.over = false;
    this.currentPlayer = null;
  }

  setup(playerOneName, playerTwoName) {
    this.setPlayer(playerOneName, this.boardSize);
    this.setPlayer(playerTwoName, this.boardSize);
  }

  setGameType(gameType) {
    this.againstAI = gameType === 'single' ? true : false;
  }

  setPlayer(name, boardSize) {
    this.players.push(new Player(name, this.createFleet(), this.createBoard(boardSize)));
  }

  setBoardSize(boardSize) {
    this.boardSize = boardSize;
  }

  createFleet() {
    return [
      new Ship('Carrier'),
      new Ship('Battleship'),
      new Ship('Destroyer'),
      new Ship('Submarine'),
      new Ship('Patrol Boat'),
    ];
  }

  createBoard() {
    return new Board(this.boardSize);
  }

  turn() {
    if (this.currentPlayer === null) return this.players[0];
    return this.players[(this.players.indexOf(this.currentPlayer) + 1) % 2];
  }
}

module.exports = Game;
