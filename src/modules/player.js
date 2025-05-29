const Ship = require('./ship');
const Board = require('./board');

class Player {
  constructor(name = '', ships, board) {
    this.type = name === '' ? 'Computer' : 'Human';
    this.name = name || 'Computer';
    this.fleet = ships;
    this.board = board;
  }

  attack(enemy, row, column) {
    // Implement validity here instead of the board class!
    return enemy.board.receiveAttack(row, column) !== false;
  }
}

module.exports = Player;
