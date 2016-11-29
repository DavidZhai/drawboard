var socket = io();

var panel = document.getElementById('drawingPanel');
var clearButton = document.getElementById('clearButton');
var imageUploader = document.getElementById('imageUpload');
var isDrawing = false;  //toggle for drawing
var drawingBuffer = [];
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
          socket.emit('server draw image', event.target.result, img.height, img.width);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

panel.addEventListener('mousemove', function(e) {
  draw(e);
});

panel.addEventListener("mousedown", function(e) {
  isDrawing = true;
});

panel.addEventListener("mouseup", function(e) {
  isDrawing = false;
});

// every 50 milliseconds poll for drawing updates
setInterval(function(){
  if (drawingBuffer.length > 0) {
    socket.emit('server draw batch lines', drawingBuffer);
    drawingBuffer = [];
  }
}, 50);

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
    drawingBuffer.push({
      previousX: previousX,
      previousY: previousY,
      x: x,
      y: y
    })
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

socket.on('client draw image', function(image, height, width) { 
  var context = panel.getContext("2d");
  var img = new Image();
  img.src = image;
  context.drawImage(img, 0, 0, width, height, 0, 0, panel.width, panel.height);
});

socket.on('client draw batch lines', function(serverDrawingPanel){
  var pen = panel.getContext("2d");
  serverDrawingPanel.forEach(function(line) {
    pen.moveTo(line.previousX, line.previousY);
    pen.lineTo(line.x, line.y);
    pen.stroke();
  });
});
