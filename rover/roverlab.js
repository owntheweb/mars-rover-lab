//RoverLab streams photos and other sensor data from its Raspberry Pi components to a satellite server where that content can be streamed to the world.

//Special thanks to Arvind Ravulavaru with camera streaming functionality referenced from his work at:
//http://thejackalofjavascript.com/rpi-live-streaming/

var io = require('socket.io-client');

// Raspberry Pi camera functionality
var cam = require('./picam');
var beacon = require('./roverbeacon');

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
	},

	onLogin: function() {
		this.loggedIn = true;
		this.onReady();
	},

	onLoginError: function() {
		this.loggedIn = false;
	},

	onConnect: function() {
		if (!this.loggedIn) {
			this.login();
		} else {
			this.onReady();
		}
	},

	onDisconnect: function() {
		console.error('Rover ' + this.roverName + ' disconnected!');
	},

	onError: function(err) {
		throw err;
	}
};

// Factory function
module.exports = function createRoverLab(name, password, host, port) {
	var rover = Object.create(_proto);

	// Settings
	rover.roverName = name || ''; // Make sure this is unique between rovers
	rover.satHost = host || '';
	rover.satPort = port || 80;
	rover.roverPassword = password || '';

	// Rover Initial state
	rover.loggedIn = false;

	// Initialising the socket connection
	rover.socket = io.connect(rover.satHost + ':' + rover.satPort + '/rover');

	// Lifetime event handler actuation
	rover.socket.on('connect', rover.onConnect.bind(rover));
	rover.socket.on('disconnect', rover.onDisconnect.bind(rover));
	rover.socket.on('error', rover.onError.bind(rover));
	rover.socket.on('roverloginconfirmed', rover.onLogin.bind(rover));
	rover.socket.on('roverloginfail', rover.onLoginError.bind(rover));

	return rover;
};
