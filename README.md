# Collaborative DrawBoard

The collaborative drawing board allows multiple users to simultaneously draw on the same canvas.
Changes made by one user will be immediately visible to all other users, allowing a collaborative drawing experience. 
  
  
## Installation/Usage

Running this program requires Node.js along with Node Package Manager(NPM).  
These programs can be found at:  
https://nodejs.org/

After node is installed, clone or download the entire repository.
Run:  
`npm install`  
to download the necessary dependencies.  

A server can be started by entering `node Server.js` from main directory.

The drawingboard should now be accessible by pointing browser to
http://localhost:8080
  
    
## Completed Features List
- [x] Online Users list - pick a custom username on joining and display all active users
- [x] Clearing - wipe the canvas
- [x] Pen - default drawing mode
- [x] Eraser - clear undesired parts of drawing
- [x] Download - save the canvas as an image
- [x] Image Upload - upload a picture to draw on top of
- [x] Color Selection - change pen to an alternate color
- [x] Pen thickness - adjust radius of drawing pen
  
  
## Contribution

Feel free to fork the repository and add your own features. Here's some suggestions for additional features:
- [ ] shapes - draw circles, rectangles, etc
- [ ] Emojis/stickers - stamps for placing custom shapes on canvas
- [ ] Custom rooms - have multiple rooms/instances
- [ ] Undo button
- [ ] eraser resize button
- [ ] offline mode (skip server)
  
## Technical details

Our code is built on top of socket.io.
The main canvas is implemented using HTML5 Canvas, with javascript to handle interaction with the canvas.
Static files are served using express from the /static/ directory.
  
## License

Feel free to fork and modify this program as desired. It would be nice if you provided a reference/link back to this repository if you do end up redistributing the program.
