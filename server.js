var app = require('./app/app');
var gameController = require('./controller/gameController');
var gameModel = require('./model/game');
var verbose = false;

// create a set of games to test the rest api
gameModel.newGame();
gameModel.newGame();
gameModel.newGame();
gameModel.newGame();

setInterval(function() {
  app.io.sockets.emit('state', app.players);

  if (verbose)
  {
    console.log(app.players);
  }
}, 1000 / 60);