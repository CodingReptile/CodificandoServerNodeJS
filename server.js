var app = require('./app/app');
var gameModel = require('./model/game');

// create a set of games to test the rest api
gameModel.newGame();
gameModel.newGame();
gameModel.newGame();
gameModel.newGame();


setInterval(function() {
  app.io.sockets.emit('state', app.players);
  //console.log(players);
}, 1000 / 60);