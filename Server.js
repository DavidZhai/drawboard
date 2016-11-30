var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = 8080;

// stores the master copy of drawings on the canvas
var masterBuffer = [];

// store erasing area
var eraseBuffer = [];

// use this to serve static files like .js and .css
app.use(express.static('static'));

// serve the webpage
app.get('/', function(req, res){
  res.sendFile(__dirname + '/drawboard.html');
});

// socket io operations
io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('client draw batch lines', masterBuffer);  // send client master copy
  socket.emit('client erase rectangle', eraseBuffer);  // send erase area
  socket.on('chat message', function(msg){
  	console.log(msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('server erase rectangle', function(erasingBuffer) {
    eraseBuffer.push.apply(eraseBuffer, erasingBuffer);
    io.emit('client erase rectangle', erasingBuffer);
    eraseBuffer = [];
  });

  socket.on('server draw batch lines', function(drawingBuffer) {
    masterBuffer.push.apply(masterBuffer, drawingBuffer);
    io.emit('client draw batch lines', drawingBuffer);
  });

  socket.on('server clear canvas', function() {
    masterBuffer = [];
    eraseBuffer = [];
    io.emit('client clear canvas');
  });

  socket.on('server draw image', function(image, height, width) {
    io.emit('client draw image', image, height, width);
  });
  // synchronize with server every 5 seconds
  // setInterval(function() {
  //   io.emit('client clear canvas');
  //   io.emit('client draw batch lines', drawingBuffer);
  // }, 5000);

});

http.listen(PORT, function(){
  console.log('listening on %d', PORT);
});
