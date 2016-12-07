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

panel.height = 600;
panel.width = 1000;

chooseColorButton.addEventListener('click', function(e) {
  document.getElementById('colorInput').click();
});

imageButton.addEventListener('click', function(e) {
  document.getElementById('imageUpload').click();
});

var widthOfPen = 1;
// var width_1 = document.getElementById("width_1");
// var width_5 = document.getElementById("width_5");
// var width_10 = document.getElementById("width_10");
// var width_15 = document.getElementById("width_15");

// width_1.addEventListener('click', function(e) {
//   console.log("Change widto to 1");
//   widthOfPen = 1;
// });

// width_5.addEventListener('click', function(e) {
//   console.log("Change widto to 5");
//   widthOfPen = 5;
// });

// width_10.addEventListener('click', function(e) {
//   console.log("Change widto to 10");
//   widthOfPen = 10;
// });

// width_15.addEventListener('click', function(e) {
//   console.log("Change widto to 15");
//   widthOfPen = 15;
// });


var colorOfPen = '#000000';
// var black = document.getElementById("black");
// var red = document.getElementById("red");
// var orange = document.getElementById("orange");
// var yellow = document.getElementById("yellow");
// var green = document.getElementById("green");
// var blue = document.getElementById("blue");
// var purple = document.getElementById("purple");

// black.addEventListener('click', function(e) {
//   console.log("Switch color to black");
//   colorOfPen = '#000000';
// });

// red.addEventListener('click', function(e) {
//   console.log("Switch color to red");
//   colorOfPen = '#ff0000';
// });

// orange.addEventListener('click', function(e) {
//   console.log("Switch color to orange");
//   colorOfPen = '#ffA500';
// });

// yellow.addEventListener('click', function(e) {
//   console.log("Switch color to yellow");
//   colorOfPen = '#ffff00';
// });

// green.addEventListener('click', function(e) {
//   console.log("Switch color to green");
//   colorOfPen = '#00ff00';
// });

// blue.addEventListener('click', function(e) {
//   console.log("Switch color to blue");
//   colorOfPen = '#0000ff';
// });

// purple.addEventListener('click', function(e) {
//   console.log("Switch color to purple");
//   colorOfPen = '#551a8b';
// });


$('#login-modal').modal({
    backdrop: 'static',
    keyboard: false
});


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function colorMenu() {
  document.getElementById("colors").classList.toggle("show");
}

function widthMenu() {
  document.getElementById("widths").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}






//
// $('#username input').keydown(function(e) {
//     if (e.keyCode == 13) {
//       window.alert("hi");
//     }
// });

// $("#username").keyup(function(event){
//   if(event.which == 13){
//     window.alert("ASDGDSGa");
//     loginUser();
//     }
// });

loginButton.addEventListener('click', function(e) {
  var username = document.getElementById("username").value;
  socket.emit('join', username);
  $('#login-modal').modal({
      backdrop: 'static',
      keyboard: false
  });
});

function loginUser() {
  var username = document.getElementById("username").value;
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
    var innerDiv = document.createElement("div");
    innerDiv.className += "pull-right glyphicon glyphicon-user";
    li.appendChild(document.createTextNode(user));
    li.appendChild(innerDiv);
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
  var pen = panel.getContext("2d");
  serverDrawingPanel.forEach(function(line) {
    console.log(line);
    if (line.erase) {
      pen.clearRect(line.x, line.y, 20, 20);
    } else {
      pen.beginPath();
      pen.moveTo(line.previousX, line.previousY);
      pen.lineTo(line.x, line.y);
      pen.strokeStyle = line.color;
      pen.lineWidth = line.width;
      pen.lineJoin = "round";
      pen.lineCap = "round";
      pen.stroke();
    }
  });
});
