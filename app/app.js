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

server.listen(configuration.Configuration.ListeningPort, function() {
    console.log('Started listening on port: ' + configuration.Configuration.ListeningPort);
});

players = {}

io.on('connection', function(socket) {
  console.log(socket.id + " connected");
  socket.on('new player', function() {
    players[socket.id] = {
      x: 300,
      y: 300,
      r: 0 // rotation - 0 to 360
    };
  });
  socket.on('movement', function (data) {
    // TODO: create a world class - contains the state of the world, including all players, ring size, etc.
    // TODO: create a gameObject class
    // TODO: create a player class derived from gameObject
    const playerSpeed = 5;
    var player = players[socket.id] || {};
    // Update rotation first
    if (data.left) {
      player.r -= 5;
      if (player.r < 0) {
        player.r += 360;
      }
    }
    if (data.right) {
      player.r += 5;
      if (player.r + 5 > 360) {
        player.r -= 360;
      }
    }

    // update position later
    if (data.up) {
      // Why 90 - player.r? When the player's rotation angle is 0, the player is pointing to the top so the angle starts at the vertical axis.
      // However the math formula to calculate x and y around a circle (i.e. x = radius * cos(angle)) consider the angle to start at the horizontal axis.
      // Hence we need to calculate 90 - player.rotation to obtain the complementary angle as if we were rotating starting from the horizontal axis.
      const rad = (90 - player.r) * Math.PI / 180;
      player.y -= playerSpeed * Math.sin(rad);
      player.x += playerSpeed * Math.cos(rad);
    }
    if (data.down) {
      const rad = (270 - player.r) * Math.PI / 180;
      player.y -= playerSpeed * Math.sin(rad);
      player.x += playerSpeed * Math.cos(rad);
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