var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var configuration = require('../config/configuration');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

app.set('port', configuration.Configuration.ListeningPort);

// Set routing for static resource files
app.use('/static', express.static(configuration.Configuration.StaticResourcesPath));

// Set routing for html game view
app.get('/', function(request, response)
{
    response.sendFile(path.join(configuration.Configuration.StaticResourcesPath, "index.html"));
});

// Set routing for model apis
var gameController = require('../controller/gameController')
app.use(gameController.apiName, gameController.router);


server.listen(configuration.Configuration.ListeningPort, function() {
    console.log('Started listening on port: ' + configuration.Configuration.ListeningPort);
});

players = {}

io.on('connection', function(socket) {
  console.log(socket.id + " connected");
  socket.on('new player', function() {
    players[socket.id] = {
      x: 300,
      y: 300
    };
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });

  socket.on('disconnecting', (reason) => {
    console.log(socket.id + " is disconnecting: " + reason);
    delete players[socket.id];
  });  
});


module.exports  = {
    app,
    server,
    io,

    // this has to be removed
    players

}