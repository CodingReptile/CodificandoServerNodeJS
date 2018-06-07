var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var Game = require('./lib/game');
var options = require('./public/options.json');
var app = express();

app.use(express.static('public'));
app.get('/', function (request, response) {
    response.send('Hello World');
});

var server = http.Server(app);
var io = socketio(server);
var port = process.env.port;
server.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening on http://%s:%s', host, port);
});

io.on('connection', function (socket) {
    console.log('%s connected', socket.id);
    game.addPlayer(socket.id);

    socket.on('disconnect', function () {
        console.log('%s disconnected', socket.id);
        game.removePlayer(socket.id);
    });

    socket.on('position', function (data) {
        console.log('%s is at (%s, %s)', socket.id, data.x, data.y);
        game.update(socket.id, data);
    });
});

var game = new Game(options);
function emitGameState() {
    game.tick();
    io.emit('state', game.state());
};
setInterval(emitGameState, 1000 / 60);
