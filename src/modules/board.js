class Board {
  constructor(size) {
    this.size = size;
    this.grid = new Array(size).fill(null);
    this.ships = [];
    this.attacks = {
      hit: [],
      miss: [],
    };
  }

  placeShip(ship, row, column, direction) {
    try {
      if (this.isEmpty(ship, row, column, direction)) {
        if (direction === 'horizontal') {
          for (let i = row; i < row + ship.length; i++) {
            this.grid[i][column] = ship;
          }
        }
      }
    } catch {
      // TODO
    }
  }

  isEmpty(ship, row, column, direction) {
    if (direction === 'horizontal') {
      for (let i = row; i < row + ship.length; i++) {
        if (this.grid[i][column] !== null) return false;
      }
    }

    for (let i = column; i < column + ship.length; i++) {
      if (this.grid[row][i] !== null) return false;
    }

    return true;
  }
}

module.exports = Board;
