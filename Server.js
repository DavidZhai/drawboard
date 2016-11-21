var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var PORT = 8080;

// serve the client on the top level
app.get('/', function(req, res){
  res.sendFile(__dirname + '/drawboard.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});


http.listen(PORT, function() {
  console.log('listening on 8080');
});
