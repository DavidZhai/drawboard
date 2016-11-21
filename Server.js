var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = 8080;

// serve the webpage
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// socket io operations
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(PORT, function(){
  console.log('listening on %d', PORT);
});
