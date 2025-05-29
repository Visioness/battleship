class Board {
  constructor(size) {
    this.size = size;
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
    this.ships = [];
    this.attacks = {
      hit: new Set(),
      miss: new Set(),
    };
  }

  placeShip(ship, row, column, direction) {
    if (
      row < 0 ||
      row + ship.length > this.size ||
      column < 0 ||
      column + ship.length > this.size ||
      !this.isEmpty(ship, row, column, direction)
    )
      return false;

    if (direction === 'horizontal') {
      for (let i = column; i < column + ship.length; i++) {
        this.grid[row][i] = ship;
      }
      this.ships.push(ship);
      return true;
    }

    for (let i = row; i < row + ship.length; i++) {
      this.grid[i][column] = ship;
    }
    this.ships.push(ship);
    return true;
  }

  isEmpty(ship, row, column, direction) {
    if (direction === 'horizontal') {
      for (let i = column; i < column + ship.length; i++) {
        if (this.grid[row][i] !== null) return false;
      }
    }

    for (let i = row; i < row + ship.length; i++) {
      if (this.grid[i][column] !== null) return false;
    }

    return true;
  }

  receiveAttack(row, column) {
    if (row < 0 || row >= this.size || column < 0 || column >= this.size) {
      throw Error('You can not attack outside the board!');
    }

    if (this.isAttackedBefore(row, column)) throw Error('You can not attack the same spot!');

    if (this.grid[row][column]) {
      this.attacks.hit.add(`${row},${column}`);
      this.grid[row][column].hit();
    } else {
      this.attacks.miss.add(`${row},${column}`);
    }

    return this.grid[row][column] || 'miss';
  }

  isAttackedBefore(row, column) {
    return this.attacks.hit.has(`${row},${column}`) || this.attacks.miss.has(`${row},${column}`);
  }

  allShipsSunk() {
    return this.ships.every((ship) => ship.isSunk() === true);
  }
}

module.exports = Board;
