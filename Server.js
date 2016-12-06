var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = 8080;

// stores the master copy of drawings on the canvas
var masterBuffer = [];
var masterBackground = {};
var connectedUsers = [];

// use this to serve static files like .js and .css
app.use(express.static('static'));

// serve the webpage
app.get('/', function(req, res){
  res.sendFile(__dirname + '/drawboard.html');
});

// socket io operations
io.on('connection', function(socket){
  socket.on("join" , function(name) {
    connectedUsers[socket.id] = name;
    console.log("user " + name + " has joined");
    socket.emit('user is logged in', name);
  });
  if (masterBackground.hasOwnProperty('img')) io.emit('client draw image', masterBackground.img, masterBackground.imgHeight, masterBackground.imgWidth);
  socket.emit('client draw batch lines', masterBuffer);  // send client master copy
  socket.on('chat message', function(msg){
  	console.log(msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    if (typeof connectedUsers[socket.id] === 'undefined') {
      console.log("some random user disconnected");
    } else {
      console.log(connectedUsers[socket.id] + ' has disconnected');
      delete connectedUsers[socket.id];
    }
  });

  // socket.on('server erase rectangle', function(erasingBuffer) {
  //   eraseBuffer.push.apply(eraseBuffer, erasingBuffer);
  //   io.emit('client erase rectangle', erasingBuffer);
  // });

  socket.on('server draw batch lines', function(drawingBuffer) {
    masterBuffer.push.apply(masterBuffer, drawingBuffer);
    io.emit('client draw batch lines', drawingBuffer);
  });

  socket.on('server clear canvas', function() {
    masterBuffer = [];
    io.emit('client clear canvas');
  });

  socket.on('server draw image', function(image, height, width) {
    masterBackground = {img : image, imgHeight : height, imgWidth : width};
    io.emit('client draw image', image, height, width);
  });
  // Periodically update everything to master version
  setInterval(function() {
    console.log("Syncing Server");
  }, 5000);
  // synchronize with server every 5 seconds
  // setInterval(function() {
  //   io.emit('client clear canvas');
  //   io.emit('client draw batch lines', drawingBuffer);
  // }, 5000);

});

http.listen(PORT, function(){
  console.log('listening on %d', PORT);
});
