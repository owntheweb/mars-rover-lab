var roverSatellite = require('roversatellite');

//port that rovers and mission control will connect to at this host
//change this to unused port of choice, make sure it matches in RoverLab.js settings
roverSatellite.satPort = 4000;
roverSatellite.satPort = 59671;

//The satellite server will only accept data from rovers with the matching password
//!!! This is just a start in BASIC security, look into making security much stronger
//change this to your own password
roverSatellite.roverPassword = '!*! Your Excellent Password !*!';
roverSatellite.roverPassword = '3DYV2a,zNa]#AC';

roverSatellite.init();

console.log('RoverSatellite started!');