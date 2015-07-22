//RoverLab streams photos and other sensor data from its Raspberry Pi components to a satellite server where that content can be streamed to the world.

//Special thanks to Arvind Ravulavaru with camera streaming functionality referenced from his work at:
//http://thejackalofjavascript.com/rpi-live-streaming/

var RoverLab = function() {
	//settings

	//Satellite server can support multiple rovers.* 
	//Make sure this is unique if running multiple rovers.
	this.roverName = '';

	//satellite server location: where the rover sends images/data to (shared with the world from there)
	this.satHost = '';
	this.satPort = 0;

	//The satellite server will only accept data from rovers with the matching password
	//!!! This is just a start in security, look into making security much stronger
	this.roverPassword = ''; 

	//Run rover as a socket.io client that connects to the satellite socket.io server
	this.io = require('socket.io/node_modules/socket.io-client');
	this.ss = require('socket.io-stream');
	this.fs = require('fs');
	this.client;

	//Raspberry Pi camera functionality
	this.cam = require('./PiCam');

	this.active = false;
	this.sendingImage = false;
	this.socketNamespace = '/rover';

};

//start streaming cam images and other data to the "satellite" server (sharing with the world from there)
//!!! currently related 
RoverLab.prototype.startStreaming = function(io) {
 	var self = this;

	//camera
	self.cam.start();
	self.cam.on('imageupdate', function(imgLoc) {
		console.log('event: cam image updated: ' + imgLoc);

		//!!!testing
		self.client.emit('test');

		//socket stream for sending files (all from camera for now)
		var stream = self.ss.createStream();
		
		//only transmit if the last image has finished transmitting
		//why: prevent too many images being sent at once: bandwidth clog?
		//!!! This may cause some delays with a single stream/slow internet. Discuss options.
		if(self.sendingImage == false) {
			self.sendingImage = true;

			//transmit image
			self.ss(self.client).emit('roverimage', stream, {name: imgLoc});
			self.fs.createReadStream(imgLoc).pipe(stream);
		}

		//allow another image to transmitted after current transmition is complete
		stream.on('finish', function() {
			console.log('finished uploading rover image');
			self.sendingImage = false;
		});
		
	});
};
 
//stop streaming camera and sensors
//!!! todo if appropriate
RoverLab.prototype.stopStreaming = function() {
	var self = this;

	
};

RoverLab.prototype.init = function() {
	var self = this;

	self.client = self.io.connect(this.satHost + ':' + this.satPort + this.socketNamespace);

	//!!! need to also handle other socket.io events to help prevent app from stopping unexpectedly
	self.client.on('connect', function() {

		//prevent sensors and such from doing double work if connection is lost and re-established
		//!!! disconnect event?
		if(self.active == false) {
			self.active = true;

			console.log('connected to satellite, logging in...');
		
			//after logging in:
			self.client.on('roverloginconfirmed', function() {
				//get the show started!
				console.log('successfully logged in, starting up services');

				self.startStreaming();
				
			});

			self.client.on('roverloginfail', function() {
				//oh uh
				console.log('satellite server says: access denied: check RoverLab settings and restart');
				//!!! actually, login may have been lost, need to start over and work to keep things moving?
			});
			
			//login
			var login = {
				roverID: self.roverName,
				roverPassword: self.roverPassword
			};
			this.emit('roverlogin', login);
			
		} else {

			console.log('Connect to server detected, but RoverLab is already active and connected? Ignoring and moving on...');
		}
	}); 

};

module.exports = new RoverLab();

