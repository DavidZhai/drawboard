var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = 8080;

// stores the master copy of drawings on the canvas
var masterBuffer = [];
var masterBackground = {};
var idToUsernameMap = [];
var onlineUsers = [];

// use this to serve static files like .js and .css
app.use(express.static('static'));

// serve the webpage
app.get('/', function(req, res){
  res.sendFile(__dirname + '/drawboard.html');
});

// socket io operations
io.on('connection', function(socket){
  socket.on("join" , function(name) {
    idToUsernameMap[socket.id] = name;
    onlineUsers.push(name);
    console.log("user " + name + " has joined");
    socket.emit('user is logged in', name);
    io.emit('update online list', onlineUsers);
    console.log(onlineUsers);
    // update user state to master copy
    refresh();
  });
  socket.on('chat message', function(msg){
  	console.log(msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    if (typeof idToUsernameMap[socket.id] === 'undefined') {
      console.log("some random user disconnected");
    } else {
      console.log(idToUsernameMap[socket.id] + ' has disconnected');
      // remove from online list
      for(var i = 0; i < onlineUsers.length; i++){
        if (onlineUsers[i] === idToUsernameMap[socket.id]) onlineUsers.splice(i, 1);
      }
      // remove from map
      delete idToUsernameMap[socket.id];
      io.emit('update online list', onlineUsers);
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
  setInterval(function() {
    refresh();
  }, 5000);
  // synchronize with server every 5 seconds
  // setInterval(function() {
  //   io.emit('client clear canvas');
  //   io.emit('client draw batch lines', drawingBuffer);
  // }, 5000);

  // syncs everything to master state
  function refresh() {
    if (masterBackground.hasOwnProperty('img')) io.emit('client draw image', masterBackground.img, masterBackground.imgHeight, masterBackground.imgWidth);
    socket.emit('client draw batch lines', masterBuffer);  // send client master copy
    io.emit('update online list', onlineUsers);
  }
});

http.listen(PORT, function(){
  console.log('listening on %d', PORT);
});
