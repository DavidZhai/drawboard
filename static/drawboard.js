var socket = io();

var panel = document.getElementById('drawingPanel');
var clearButton = document.getElementById('clearButton');
var useEraser = document.getElementById('eraser');
var usePen = document.getElementById('pen');
var imageUploader = document.getElementById('imageUpload');
var downloadButton = document.getElementById('downloadButton');
var chooseColorButton = document.getElementById('colorButton');
var imageButton = document.getElementById('imageButton');
var loginButton = document.getElementById('login');
var isDrawing = false;  //toggle for drawing
var usingEraser = false;
var isMoving = false;  //toggle for drawing
var drawingBuffer = [];
var previousX;
var previouxY;
var startTimer;
var numOfSample = 0;
var averageSum = 0;

window.onresize = function(event) {
  var pen = panel.getContext("2d");
  panel.height = window.innerHeight - 50;
  panel.width = window.innerWidth * .85;
  pen.clearRect(0, 0, panel.width, panel.height);
  socket.emit("client resize window");
};

panel.height = window.innerHeight - 50;
panel.width = window.innerWidth * .85;

chooseColorButton.addEventListener('click', function(e) {
  document.getElementById('colorInput').click();
});

imageButton.addEventListener('click', function(e) {
  document.getElementById('imageUpload').click();
});


$('#login-modal').modal({
    backdrop: 'static',
    keyboard: false
});


// allows users to login on enter key
$(document).ready(function() {
  $('#username').keydown(function(event) {
    // enter has keyCode = 13, change it if you want to use another button
    if (event.keyCode == 13) {
      loginUser();
      return false;
    }
  });

});

loginButton.addEventListener('click', function(e) {
    loginUser();
});

function loginUser() {
  var username = document.getElementById("username").value;
  if (username.length < 3 || username.length > 25) {
    alert("Please enter username between 3 and 25 characters");
    return false;
  }
  socket.emit('join', username);
  $('#login-modal').modal({
      backdrop: 'static',
      keyboard: false
  });
}

imageUploader.addEventListener('change', uploadImage, false);

downloadButton.addEventListener('click', function(e) {
  console.log("download");
  var link = document.createElement('a');
  link.download = "drawBoard.png";
  link.href = panel.toDataURL("image/png").replace("image/png", "image/octet-stream");;
  link.click();
});

usePen.addEventListener('click', function(e) {
  console.log("Switch to pen");
  usingEraser = false;
});

useEraser.addEventListener('click', function(e) {
  console.log("Switch to eraser");
  usingEraser = true;
});

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
  isMoving = true;
});

panel.addEventListener("mouseup", function(e) {
  isMoving = false;
});

// every 50 milliseconds poll for drawing updates
setInterval(function(){
  if (drawingBuffer.length > 0) {
    startTimer = new Date().valueOf();
    numOfSample++;
    socket.emit('server draw batch lines', drawingBuffer);
    drawingBuffer = [];
  }
}, 20);

function draw(e) {
  /* needed to find relative location to window */
  var rect = panel.getBoundingClientRect();
  var canvasTop = parseInt(rect.top);
  var canvasLeft = parseInt(rect.left);

  // need to convert to canvas coordinates, look into factoring this out

  var x = e.clientX - canvasLeft;
  var y = e.clientY - canvasTop;
  if (isMoving) {
    var pen = panel.getContext("2d");
    drawingBuffer.push({
      windowWidth: panel.width,
      winddowHeight: panel.height,
      previousX: previousX,
      previousY: previousY,
      x: x,
      y: y,
      erase: usingEraser,  // temporal fix  boolean indiates eraser
      color: document.getElementById('colorInput').value,
      width: document.getElementById('brushSize').value
    })
  }
  previousX = x;
  previousY = y;

  //var coor = "Coordinates: (" + x + "," + y + ")";
  //document.getElementById("demo").innerHTML = coor;
}

socket.on('update online list', function(onlineUsers) {
  var activeUserList = document.getElementById("activeUserList");
  activeUserList.innerHTML = '';
  onlineUsers.forEach(function(user) {
    var li = document.createElement("li");
    var innerSpan = document.createElement("span");
    innerSpan.className += "glyphicon glyphicon-user";
    innerSpan.style.paddingRight = "10px";
    li.appendChild(innerSpan);
    li.appendChild(document.createTextNode(user));
    
    activeUserList.appendChild(li);
  });
});

socket.on('user is logged in', function(username) {
  $('#login-modal').modal('hide');
  //document.getElementById("thisUser").innerHTML = 'Welcome, ' + username;
});

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

socket.on('client draw batch lines', function(serverDrawingPanel) {
  averageSum += new Date().valueOf() - startTimer;
  if (numOfSample >= 100) {
    console.log("Average Latency: " + (averageSum / numOfSample));
    numOfSample = 0;
    averageSum = 0;
  }
  var pen = panel.getContext("2d");
  serverDrawingPanel.forEach(function(line) {
    var widthScale = (panel.width / line.windowWidth).toPrecision(3);
    var heightScale = (panel.height / line.winddowHeight).toPrecision(3);
    if (line.erase) {
      pen.clearRect(line.x * widthScale, line.y * heightScale, 20 * widthScale, 20 * heightScale);
    } else {
      pen.beginPath();
      pen.moveTo(line.previousX * widthScale, line.previousY * heightScale);
      pen.lineTo(line.x * widthScale, line.y * heightScale);
      pen.strokeStyle = line.color;
      pen.lineWidth = line.width;
      pen.lineJoin = "round";
      pen.lineCap = "round";
      pen.stroke();
      pen.closePath();
    }
  });
});
