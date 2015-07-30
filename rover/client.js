var roverLab = require('roverlab');

//Satellite server can support multiple rovers.* 
//Make sure this is unique if running multiple rovers.
roverLab.roverName = 'rover-lab-1';

//satellite server location: where the rover sends images/data to (shared with the world from there)
roverLab.satHost = 'http://yournodewebsite.com';
roverLab.satHost = 'http://app.christopherstevens.cc';
roverLab.satPort = 4000;
//roverLab.satPort = 59671;
roverLab.satPort = 80; //!!! my shared hosting is only accepting 80, redirecting to 59671 via .htaccess hmm

//The satellite server will only accept data from rovers with the matching password
//!!! This is just a start in security, look into making security much stronger
roverLab.roverPassword = '!*! Your Excellent Password !*!'; 
roverLab.roverPassword = '3DYV2a,zNa]#AC'; 

roverLab.init();

console.log('RoverLab started!');