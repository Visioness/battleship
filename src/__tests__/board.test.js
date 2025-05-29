const Ship = require('../modules/ship');
const Board = require('../modules/board');

describe('Board', () => {
  test('should be initialized with a size', () => {
    const board = new Board(10);
    expect(board.size).toBe(10);
  });

  describe('placing ships', () => {
    test('should be able to place a ship', () => {
      const board = new Board(10);
      const ship = new Ship('Carrier');
      board.placeShip(ship, 0, 0, 'horizontal');
      expect(board.grid[0][0].name).toBe('Carrier');
      expect(board.grid[0][1].name).toBe('Carrier');
      expect(board.grid[0][2].name).toBe('Carrier');
      expect(board.grid[0][3].name).toBe('Carrier');
      expect(board.grid[0][4].name).toBe('Carrier');
      expect(board.grid[1][0]).toBe(null);

      const ship2 = new Ship('Battleship');
      board.placeShip(ship2, 3, 4, 'vertical');
      expect(board.grid[3][4].name).toBe('Battleship');
      expect(board.grid[4][4].name).toBe('Battleship');
      expect(board.grid[5][4].name).toBe('Battleship');
      expect(board.grid[6][4].name).toBe('Battleship');
    });

    test('should not be able to place a ship outside the board', () => {
      const board = new Board(5);
      const ship = new Ship('Patrol Boat');
      expect(board.placeShip(ship, 0, 0, 'horizontal')).toBe(true);
      expect(board.placeShip(ship, 2, 3, 'vertical')).toBe(true);

      const ship2 = new Ship('Battleship');
      expect(board.placeShip(ship2, 0, 4, 'horizontal')).toBe(false);
      expect(board.placeShip(ship2, 3, 3, 'vertical')).toBe(false);

      const ship3 = new Ship('Destroyer');
      expect(board.placeShip(ship3, -5, 0, 'horizontal')).toBe(false);
      expect(board.placeShip(ship3, 0, -5, 'vertical')).toBe(false);
    });

    test('should not be able to place a ship on top of another ship', () => {
      const board = new Board(10);
      const ship = new Ship('Carrier');
      board.placeShip(ship, 0, 0, 'horizontal');
      expect(board.placeShip(ship, 0, 0, 'horizontal')).toBe(false);
      expect(board.placeShip(ship, 0, 0, 'vertical')).toBe(false);
    });
  });

  describe('receiving attacks', () => {
    test('should be able to receive a hit', () => {
      const board = new Board(10);
      const ship = new Ship('Carrier');
      board.placeShip(ship, 0, 0, 'horizontal');
      expect(board.receiveAttack(0, 0)).toBe(ship);
      expect(board.receiveAttack(0, 1)).toBe(ship);
      expect(board.receiveAttack(0, 2)).toBe(ship);
      expect(board.receiveAttack(0, 3)).toBe(ship);
      expect(board.receiveAttack(0, 4)).toBe(ship);
      expect(ship.isSunk()).toBe(true);
      expect(board.receiveAttack(1, 0)).toBe('miss');
      expect(board.receiveAttack(2, 0)).toBe('miss');
      expect(board.receiveAttack(0, 5)).toBe('miss');
      expect(board.receiveAttack(0, 6)).toBe('miss');
      expect(board.receiveAttack(0, 7)).toBe('miss');

      const ship2 = new Ship('Battleship');
      board.placeShip(ship2, 3, 4, 'vertical');
      expect(board.receiveAttack(3, 4)).toBe(ship2);
      expect(board.receiveAttack(4, 4)).toBe(ship2);
      expect(board.receiveAttack(5, 4)).toBe(ship2);
      expect(board.receiveAttack(6, 4)).toBe(ship2);
      expect(ship2.isSunk()).toBe(true);
      expect(board.receiveAttack(7, 4)).toBe('miss');
      expect(board.receiveAttack(8, 4)).toBe('miss');
    });

    test('record of attacks should be stored', () => {
      const board = new Board(10);
      const ship = new Ship('Carrier');
      board.placeShip(ship, 0, 0, 'horizontal');
      board.receiveAttack(0, 0);
      board.receiveAttack(0, 1);
      board.receiveAttack(3, 6);
      board.receiveAttack(7, 2);
      board.receiveAttack(4, 1);
      expect(board.attacks).toMatchObject({
        hit: new Set(['0,0', '0,1']),
        miss: new Set(['3,6', '7,2', '4,1']),
      });
    });

    test('prevents attacking outside the board', () => {
      const board = new Board(10);
      const ship = new Ship('Carrier');
      board.placeShip(ship, 0, 0, 'horizontal');
      board.receiveAttack(0, 0);
      expect(board.receiveAttack(0, -1)).toBe(false);
      expect(board.receiveAttack(10, 0)).toBe(false);
      expect(board.receiveAttack(0, 10)).toBe(false);
    });

    test('prevents attacking the same spot twice', () => {
      const board = new Board(10);
      const ship = new Ship('Carrier');
      board.placeShip(ship, 0, 0, 'horizontal');
      board.receiveAttack(0, 0);
      expect(board.receiveAttack(0, 0)).toBe(false);
    });
  });

  describe('checking if all ships are sunk', () => {
    test('should be able to check if all ships are sunk', () => {
      const board = new Board(10);
      const ship = new Ship('Carrier');
      board.placeShip(ship, 0, 0, 'horizontal');
      const ship2 = new Ship('Submarine');
      board.placeShip(ship2, 3, 4, 'vertical');
      expect(board.allShipsSunk()).toBe(false);
      board.receiveAttack(0, 0);
      board.receiveAttack(0, 1);
      board.receiveAttack(0, 2);
      board.receiveAttack(0, 3);
      board.receiveAttack(0, 4);
      expect(board.allShipsSunk()).toBe(false);
      board.receiveAttack(3, 4);
      board.receiveAttack(4, 4);
      board.receiveAttack(5, 4);
      board.receiveAttack(6, 4);
      expect(board.allShipsSunk()).toBe(true);
    });
  });
});
