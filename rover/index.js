
var path = require('path');
var createRoverLab = require('./roverlab');
var outputFile = path.join(__dirname, 'PiCam/PiCam.jpg');

var rover = createRoverLab(
  'rover-lab-1', //rover name, make unique if running multiple rovers
  'YOUR_PASSWORD', //rover login password
  'http://your.server.location.com', //location of satellite server
  80,
  { //raspicam options, see https://github.com/troyth/node-raspicam
  	w: 640,
  	h: 480,
  	mode: 'photo',
  	output: outputFile,
  	q: 75,
  	t: 999999999,
  	tl: 1000,
  	hf: true,
  	vf: true
  }
);

var rover = createRoverLab(
  'rover-lab-1',
  '3DYV2a,zNa]#AC',
  'http://127.0.0.1',
  59671
);