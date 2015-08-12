// Special thanks to Arvind Ravulavaru with camera functionality referenced from his work at:
// http://thejackalofjavascript.com/rpi-live-streaming/

// TODO: raspistill has a lot of options and modes that can be utilized!

var fs = require('fs');
var path = require('path');
var events = require('events');
var spawn = require('child_process').spawn;

var Observable = require('rx').Observable;

var imgFile = path.join(__dirname, 'PiCam/PiCam.jpg');
var imgWidth = 640;
var imgHeight = 480;
var captureInterval = 1000; // ms

module.exports = Observable.create(function(observer) {
	var proc = spawn('raspistill', [
		"-vf",
		"-hf",
		"-w", imgWidth,
		"-h", imgHeight,
		"-o", imgFile,
		"-t", "999999999",
		"-tl", captureInterval
	]);

	var onChange = function(current, previous) {
		observer.onNext(current);
	};

	fs.watchFile(self.imgFile, {
		persistent: true,
		interval: captureInterval // ms
	}, onChange);

	return function() {
		// clean up
		proc.kill();
		fs.unwatchFile(self.imgFile, onChange);
	};
})
	.publish()
	.refCount();
