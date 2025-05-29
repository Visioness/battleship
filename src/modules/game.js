const Player = require('./player');
const Board = require('./board');
const Ship = require('./ship');

class Game {
  constructor() {
    this.players = [];
    this.over = false;
    this.currentPlayer = null;
  }

  setPlayer(name) {
    this.players.push(new Player(name, this.createFleet(), this.createBoard()));
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

  createBoard(size) {
    return new Board(size);
  }

  turn() {
    if (this.currentPlayer === null) return this.players[0];
    return this.players[(this.players.indexOf(this.currentPlayer) + 1) % 2];
  }
}

module.exports = Game;
