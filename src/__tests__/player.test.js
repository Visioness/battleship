const Board = require('../modules/board');
const Player = require('../modules/player');
const Ship = require('../modules/ship');

describe('Player', () => {
  let player1;
  let player2;
  let computer;
  let board;
  let fleet;

  const createNewPlayer = (name = '') => {
    board = new Board(10);
    fleet = [
      new Ship('Carrier'),
      new Ship('Battleship'),
      new Ship('Destroyer'),
      new Ship('Submarine'),
      new Ship('Cruiser'),
    ];

    return new Player(name, fleet, board);
  };

  beforeEach(() => {
    player1 = createNewPlayer('John Doe');
    player2 = createNewPlayer('Jane Doe');
    computer = createNewPlayer();
  });

  test('should be able to create a player', () => {
    expect(player1.name).toBe('John Doe');
    expect(player2.name).toBe('Jane Doe');
    expect(computer.name).toBe('Computer');
  });

  test('has a board', () => {
    expect(player1.board).toBeDefined();
    expect(computer.board).toBeDefined();
    expect(player1.board.grid.length).toBe(player1.board.size);
    expect(computer.board.grid.length).toBe(computer.board.size);
  });

  test('has a fleet', () => {
    expect(player1.fleet).toBeDefined();
    expect(computer.fleet).toBeDefined();
    expect(player1.fleet.length).toBe(5);
  });

  test('places ships on the board', () => {
    const ship1 = player1.fleet.pop();
    const ship2 = computer.fleet.pop();

    expect(player1.board.placeShip(ship1, 0, 0, 'horizontal')).toBe(true);
    expect(computer.board.placeShip(ship2, 0, 0, 'vertical')).toBe(true);

    expect(player1.board.grid[0][0]).toBe(ship1);
    expect(computer.board.grid[0][0]).toBe(ship2);
  });

  describe('attacks the enemy', () => {
    test('should be able to attack the enemy', () => {
      const result1 = player1.attack(computer, 0, 0);
      const result2 = computer.attack(player1, 0, 0);

      // receiveAttack returns Ship object or 'miss', not boolean
      expect(result1).toBe('miss');
      expect(result2).toBe('miss');
    });

    test('should not be able to attack outside the board', () => {
      expect(player1.attack(computer, -1, 0)).toBe(false);
      expect(computer.attack(player1, 0, 10)).toBe(false);
    });

    test('should not be able to attack the same cell twice', () => {
      expect(player1.attack(computer, 0, 0)).toBe('miss');
      expect(player1.attack(computer, 0, 0)).toBe(false);
    });

    test('should hit a ship when attacking occupied cell', () => {
      const ship = computer.fleet.pop();
      computer.board.placeShip(ship, 5, 5, 'horizontal');

      const result = player1.attack(computer, 5, 5);
      expect(result).toBe(ship);
      expect(ship.hitCount).toBe(1);
    });
  });
});
