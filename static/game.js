var socket = io();

socket.on('message', function(data) {
  console.log(data);
});

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
};
  document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
    }
  });
  document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = false;
        break;
      case 87: // W
        movement.up = false;
        break;
      case 68: // D
        movement.right = false;
        break;
      case 83: // S
        movement.down = false;
        break;
    }
  });

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

var incomingMessagesCountSec = 0;
var incomingMessagesCount5Secs = 0;
var intervalCounter = 0;
setInterval(function () {
  document.getElementById('framesPerSec').innerHTML = "frames/sec = " + incomingMessagesCountSec;
  intervalCounter++;
  incomingMessagesCount5Secs += incomingMessagesCountSec;
  incomingMessagesCountSec = 0;
  if (intervalCounter == 5) {
    document.getElementById('framesAvg5Secs').innerHTML = "avg/5secs = " + incomingMessagesCount5Secs / 5;
    incomingMessagesCount5Secs = 0;
    intervalCounter = 0;
  }
}, 1000);

var canvas = document.getElementById('canvas');
const width = 800;
const height = 600; 
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

socket.on('state', function (players) {
  const radius = 10;
  context.clearRect(0, 0, width, height);

  incomingMessagesCountSec++;
  context.fillStyle = 'green';
  context.strokeStyle = 'red';
  for (var id in players) {
    var player = players[id];
    //Set the origin to the center of the image
    context.translate(player.x, player.y);
    //Rotate the canvas around the origin
    const radRotation = player.r * Math.PI / 180;
    context.rotate(radRotation);

    context.beginPath();
    // Yes, we draw the player at the origin (0, 0) because we have translated the context
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.fill();

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, 0 - radius * 2);
    context.stroke();

    //reset the canvas  
    context.rotate(radRotation * (-1));
    context.translate(player.x * (-1), player.y * (-1));
  }
});