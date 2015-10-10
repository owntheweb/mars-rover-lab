//RoverLab streams photos and other sensor data from its Raspberry Pi components to a satellite server where that content can be streamed to the world.

//Special thanks to Arvind Ravulavaru with camera streaming functionality referenced from his work at:
//http://thejackalofjavascript.com/rpi-live-streaming/

var fs = require('fs');
var io = require('socket.io-client');
var ss = require('socket.io-stream');
var q = require('q');
var cam = require("raspicam");

//var beacon = require('./roverbeacon');

var _proto = {
	
	// Socket event emitters
	login: function() {
		this.socket.emit('roverlogin', {
			roverID: this.roverName,
			// The password shoulb be hashed
			roverPassword: this.roverPassword
		});
	},

	// Lifetime event handlers

	onReady: function() {
		console.log('Ready!');

		var socket = this.socket;

		this.camera.start();
	},

	onLogin: function() {
		this.loggedIn = true;
		this.onReady();
	},

	onLoginError: function() {
		this.loggedIn = false;
	},

	//socket event handlers

	onSocketConnect: function() {
		if (!this.loggedIn) {
			this.login();
		} else {
			this.onReady();
		}
	},

	onSocketDisconnect: function() {
		console.error('Rover ' + this.roverName + ' disconnected!');

		// clean up
		this.camera.stop();
		this.sendingImage = false;
		this.loggedIn = false;
	},

	onSocketError: function(err) {
		//throw err; //not all socket errors sink the ship ;)
		console.log('socket error: ');
		console.log(err);
	},

	//camera

	sendImage: function(filename) {
		var defer = q.defer();
		var self = this;
		var size = 0;

		//only send one image at a time
		if(self.sendingImage == false) {
			self.sendingImage = true;
			console.log('Started transferring image.');
			
			var stream = ss.createStream();
			stream.on('end', function() {
				console.log('Finished transferring image.');
				self.sendingImage = false;
				defer.resolve();
			});

			stream.on('error', function() {
				self.sendingImage = false;
				defer.reject(new Error('There was a file streaming error.'));
			});

			ss(self.socket).emit('roverimage', stream, {
				name: filename
			});

			fs.createReadStream(filename).pipe(stream);
		} else {
			defer.reject(new Error('Already sending an image. Try again later.'));
		}

		return defer.promise;
	},

	camera event handlers

	onCameraStart: function() {
		console.log("Camera started.");
	},

	onCameraStop: function() {
		console.log("Camera stopped.");
	},

	onCameraRead: function(err, filename) {
		var promise = this.sendImage(this.cameraOutputFile);
		//console.log('hi');
	}
};

// Factory function
module.exports = function createRoverLab(name, password, host, port, camOps) {
	var rover = Object.create(_proto);

	// Initialize Camera
	rover.camera = new cam(camOps);
	rover.cameraOutputFile = camOps.output;

	// Camera event handlers
	rover.camera.on("started", rover.onCameraStart.bind(rover));
	rover.camera.on("exited", rover.onCameraStop.bind(rover));
	rover.camera.on("read", rover.onCameraRead.bind(rover));

	// Settings
	rover.roverName = name || ''; // Make sure this is unique between rovers
	rover.satHost = host || '';
	rover.satPort = port || 80;
	rover.roverPassword = password || '';

	// Rover Initial state
	rover.loggedIn = false;
	rover.sendingImage = false;

	// Initialising the socket connection
	rover.socket = io.connect(rover.satHost + ':' + rover.satPort + '/rover');

	// Lifetime event handler actuation
	rover.socket.on('connect', rover.onSocketConnect.bind(rover));
	rover.socket.on('disconnect', rover.onSocketDisconnect.bind(rover));
	rover.socket.on('error', rover.onSocketError.bind(rover));
	rover.socket.on('roverloginconfirmed', rover.onLogin.bind(rover));
	rover.socket.on('roverloginfail', rover.onLoginError.bind(rover));

	return rover;
};
