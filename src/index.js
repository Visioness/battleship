require('./styles/style.css');
const View = require('./modules/view');
const Game = require('./modules/game');
const Board = require('./modules/board');
const Ship = require('./modules/ship');
const Player = require('./modules/player');

const view = new View();
const game = new Game();

const gameTypeCallback = (gameType) => {
  game.setGameType(gameType);
};

const boardSizeCallback = (boardSize) => {
  game.setBoardSize(boardSize);
};

const playerNamesCallback = (playerOneName, playerTwoName) => {
  game.setup(playerOneName, playerTwoName);
  view.setup(game.boardSize, playerOneName, playerTwoName);
  view.drawFleet(game.players[0].fleet);
};

view.handleFormEvents(gameTypeCallback, boardSizeCallback, playerNamesCallback);
