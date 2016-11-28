var socket = io();

var panel = document.getElementById('drawingPanel');

/* needed to find relative location to window */
var rect = panel.getBoundingClientRect();
var canvasTop = parseInt(rect.top);
var canvasLeft = parseInt(rect.left);

panel.addEventListener('mousemove', function(e) {
  myFunction(e);
 // socket.emit()
});

function myFunction(e) {
  var x = e.clientX - canvasLeft;
  var y = e.clientY - canvasTop;
  var coor = "Coordinates: (" + x + "," + y + ")";
  document.getElementById("demo").innerHTML = coor;
}

   /*
      $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
      });
      socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
      });*/