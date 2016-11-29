var socket = io();

var panel = document.getElementById('drawingPanel');
var clearButton = document.getElementById('clearButton');
var imageUploader = document.getElementById('imageUpload');
var isDrawing = false;  //toggle for drawing 
var previousX;
var previouxY;

imageUploader.addEventListener('change', uploadImage, false);

clearButton.addEventListener('click', function(e) {
  console.log("clear");
  socket.emit('server clear canvas');
});

function uploadImage(e){
    var reader = new FileReader();
    var context = panel.getContext("2d");
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            context.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
        socket.emit('server draw image', event.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);     
}

panel.addEventListener('mousemove', function(e) {
  draw(e);
 // socket.emit()
});

panel.addEventListener("mousedown", function(e) {
  isDrawing = true;
});

panel.addEventListener("mouseup", function(e) {
  isDrawing = false;
  console.log("mouseup");
})

function draw(e) {

  /* needed to find relative location to window */
  var rect = panel.getBoundingClientRect();
  var canvasTop = parseInt(rect.top);
  var canvasLeft = parseInt(rect.left);

  // need to convert to canvas coordinates, look into factoring this out
  
  var x = e.clientX - canvasLeft;
  var y = e.clientY - canvasTop;
  if (isDrawing) {
    var pen = panel.getContext("2d");
    // pen.moveTo(previousX, previousY);
    // pen.lineTo(x, y);
    // pen.stroke();
    socket.emit('server draw line', previousX, previousY, x, y);

  }
  previousX = x;
  previousY = y;

  var coor = "Coordinates: (" + x + "," + y + ")";
  document.getElementById("demo").innerHTML = coor;
}

socket.on('client clear canvas', function() {
  var context = panel.getContext("2d");
  //context.clearRect(0, 0, panel.width, panel.height);
  panel.width = panel.width;
  console.log("clearing");

});

socket.on('client draw image', function(info) { 
  var context = panel.getContext("2d");
  var img = new Image();
  img.src = info;
  context.drawImage(img, 0, 0);


});

socket.on('client draw line', function(previousX, previousY, x, y){
    var pen = panel.getContext("2d");
    pen.moveTo(previousX, previousY);
    pen.lineTo(x, y);
    pen.stroke();
  });
// function drawOnMouse(e) {
//   var pen = panel.getContext("2d");
//   pen.moveTo(0, 0);
//   pen.lineTo(e.clientX - canvasLeft ,e.clientY - canvasTop);
//   pen.stroke();  
// }

   /*
      $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
      });
      socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
      });*/