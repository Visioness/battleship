const Ship = require('../modules/ship');

describe('Ship', () => {
  test('should be initialized with a name', () => {
    const ship = new Ship('Carrier');
    expect(ship.length).toBe(5);

    const ship2 = new Ship('Battleship');
    expect(ship2.length).toBe(4);

    const ship3 = new Ship('Destroyer');
    expect(ship3.length).toBe(3);

    const ship4 = new Ship('Submarine');
    expect(ship4.length).toBe(3);

    const ship5 = new Ship('Cruiser');
    expect(ship5.length).toBe(2);
  });

  test('should be initialized with a hit count of 0', () => {
    const ship = new Ship('Carrier');
    expect(ship.hitCount).toBe(0);

    const ship2 = new Ship('Battleship');
    expect(ship2.hitCount).toBe(0);

    const ship3 = new Ship('Destroyer');
    expect(ship3.hitCount).toBe(0);

    const ship4 = new Ship('Submarine');
    expect(ship4.hitCount).toBe(0);

    const ship5 = new Ship('Cruiser');
    expect(ship5.hitCount).toBe(0);
  });

  test('should be able to be hit', () => {
    const ship = new Ship('Carrier');
    ship.hit();
    expect(ship.hitCount).toBe(1);
    ship.hit();
    expect(ship.hitCount).toBe(2);
    ship.hit();
    expect(ship.hitCount).toBe(3);
    ship.hit();
    expect(ship.hitCount).toBe(4);
    ship.hit();
    expect(ship.hitCount).toBe(5);
    ship.hit();
    expect(ship.hitCount).toBe(5);

    const ship2 = new Ship('Cruiser');
    ship2.hit();
    expect(ship2.hitCount).toBe(1);
    ship2.hit();
    expect(ship2.hitCount).toBe(2);
    ship2.hit();
    expect(ship2.hitCount).toBe(2);
  });

  test('should be able to be sunk', () => {
    const ship = new Ship('Submarine');
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.isSunk()).toBe(true);

    const ship2 = new Ship('Cruiser');
    ship2.hit();
    expect(ship2.isSunk()).toBe(false);
    ship2.hit();
    expect(ship2.isSunk()).toBe(true);
  });
});
