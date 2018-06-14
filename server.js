var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

// Constants
//const portNumber = process.env.port;
const portNumber = 8888;

var app = express();
var server = http.Server(app);
var io = new socketIO(server);

app.set('port', portNumber);
app.use('/static', express.static(__dirname + '/static'));

// Set routing
app.get('/', function(request, response)
{
    response.sendFile(path.join(__dirname, "index.html"));
});

server.listen(portNumber, function() {
    console.log('Started listening on port: ' + portNumber);
});

var players = {};
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

setInterval(function() {
  io.sockets.emit('state', players);
  console.log(players);
}, 1000 / 60);