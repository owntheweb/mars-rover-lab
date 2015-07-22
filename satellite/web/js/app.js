//Here's a crude start to a Mission Control interface
//!!! for future:
//!!! support multiple rovers
//!!! OOP it

jQuery( document ).ready(function() {
	(function(){
		//settings
		var satPort = 4000;

		///////////////
		//Rover Cam
		///////////////

		var roverCamContext;
		var roverCamImg = new Image();

		var initRoverCamCanvas = function() {
			//setup canvas/context		
			var roverCamCanvas = $("#roverCam")[0];
			roverCamContext = roverCamCanvas.getContext('2d');

			roverCamContext.canvas.width = 640; //!!! make more dynamic to screen size
			roverCamContext.canvas.height = 480; //!!! make more dynamic to screen size
		};

		var updateRoverCam = function() {
			roverCamContext.drawImage(roverCamImg, 0, 0, roverCamContext.canvas.width, roverCamContext.canvas.height);
		};

		initRoverCamCanvas();

		/////////////////////////
		//Satellite Socket Server
		/////////////////////////

		//get is started
		var satServer = window.location.origin;
		var socket = io.connect(satServer + ":" + satPort + '/mission-control');

		//mission control events
		socket.on('connect', function(url) { //!!! check if url is needed or was copied from below
			console.log('connected');
			addLog('green', 'satellite', 'connected to satellite');
		});

		socket.on('disconnect', function(url) { //!!! check if url is needed or was copied from below
			console.log('disconnected');
			addLog('red', 'satellite', 'disconnected from satellite');
		});

		//rover events as reported from satellite server
		socket.on('roverconnected', function() {
			addLog('green', 'rover', 'a rover has connected to the satellite');
		}

		socket.on('roverloginconfirmed', function(roverID) {
			addLog('green', 'rover', roverID + ' has logged in to the satellite');
		}

		socket.on('roverdenied', function(roverID) {
			addLog('red', 'rover', roverID + ' login has been rejected by the satellite');
		}

		socket.on('roverdisconnected', function(roverID) {
			addLog('red', 'rover', roverID + ' has lost connection with the satellite');
		}

		socket.on('roverimage', function(url) {
			var d = new Date();
			roverCamImg.onload = function() {
				console.log('rover image loaded');
				addLog('blue', 'camera', 'receiving updated image...');
				updateRoverCam();
			}
			roverCamImg.src = "./PiCam/PiCam.jpg?cache=" + d.getTime();
		});


		/////////////////
		//Mars Background
		/////////////////

		var marsBackground = new MarsBackground();
		marsBackground.init();
		//!!! add a preloader for large textures here or there before rendering?
		marsBackground.startRendering();


		///////////
		//interface
		///////////

		//!!! add a preloader
		//!!! window transitions
		//!!! co-worker likes it when things type out: animate the log window

		//resize handler
		//make fullscreen non-scrolling design responsive to fit
		var resize = function() {
			
			//starting sizes for 1440 x 900 original design 
			var origW = 1440;
			var origH = 900;
			var marginW = 20;
			var marginH = 41;
			var startTop = 60;
			
			//sizes include borders, titles, etc
			var camW = 650; //640 px
			var camH = 512; //480 px
			var mapW = 550; //28 ft
			var mapH = camH; //26 ft
			var sigW = origW - marginW - camW - marginW - mapW - (marginW * 2); //leftover to fit
			var sigH = camH;

			var conW = 700;
			var conH = origH - startTop - camH - (marginH * 2);
			var oriW = 220;
			var oriH = conH;
			var logW = origW - marginW - conW - marginW - oriW - (marginW * 2);
			var logH = conH;

			var ratio = 1.0; //will change
			var screenW = window.innerWidth;
			var screenH = window.innerHeight;

			//set scale ratio
			var origWinW = origW - (marginW * 4);
			var origWinH = origH - startTop - (marginH * 2);
			var curWinW = window.innerWidth - (marginW * 4);
			var curWinH = window.innerHeight - startTop - (marginH * 2);

			//use width unless height is shorter % wise
			var origHWRatio = origWinH / origWinW;
			var curHWRatio = curWinH / curWinW;
			if(curHWRatio < origHWRatio) {
				//use height ratio
				ratio = curWinH / origWinH;
			} else {
				//use width ratio
				ratio = curWinW / origWinW;
			}

			//new sizes based on ratio of original design
			var newCamW = Math.floor(camW * ratio);
			var newCamH = Math.floor(camH * ratio);
			var newMapW = Math.floor(mapW * ratio);
			var newMapH = Math.floor(mapH * ratio);
			//var newSigW = Math.floor(sigW * ratio); //to scale
			var newSigW = window.innerWidth - (marginW * 4) - newCamW - newMapW; //to fit
			var newSigH = Math.floor(sigH * ratio);

			var newConW = Math.floor(conW * ratio);
			var newConH = Math.floor(conH * ratio);
			var newOriW = Math.floor(oriW * ratio);
			var newOriH = Math.floor(oriH * ratio);
			//var newLogW = Math.floor(logW * ratio); //to scale
			newLogW = window.innerWidth - (marginW * 4) - newConW - newOriW; //to fit
			var newLogH = Math.floor(logH * ratio);

			//set new window sizes
			$('#roverCamWindow').css('width', newCamW);
			$('#roverCamWindow').css('height', newCamH);

			$('#mapWindow').css('width', newMapW);
			$('#mapWindow').css('height', newMapH);
			$('#mapWindow').css('left', (marginW * 2) + newCamW);

			$('#signalWindow').css('width', newSigW);
			$('#signalWindow').css('height', newSigH);
			$('#signalWindow').css('left', (marginW * 3) + newCamW + newMapW);

			$('#controlWindow').css('width', newConW);
			$('#controlWindow').css('height', newConH);
			$('#controlWindow').css('top', startTop + newCamH + marginH);

			$('#orientationWindow').css('width', newOriW);
			$('#orientationWindow').css('height', newOriH);
			$('#orientationWindow').css('top', startTop + newCamH + marginH);
			$('#orientationWindow').css('left', (marginW * 2) + newConW);

			$('#logWindow').css('width', newLogW);
			$('#logWindow').css('height', newLogH);
			$('#logWindow').css('top', startTop + newCamH + marginH);
			$('#logWindow').css('left', (marginW * 3) + newConW + newOriW);


			//console.log(screenW + ":" + screenH);
		}

		$(window).resize(function() {
			resize();
		});

		//resize on start
		resize();

		////////////
		//Log window
		////////////

		//write text one letter at a time
		//extend jQuery to do this
		//thanks: http://stackoverflow.com/questions/8053683/display-a-sentence-one-character-at-a-time
		$.fn.writeText = function(content) {
			var contentArray = content.split(""),
			    current = 0,
			    elem = this;
			setInterval(function() {
			    if(current < contentArray.length) {
			        elem.text(elem.text() + contentArray[current++]);
			    }
			}, 15);
		};

		var logCount = 0;
		var addLog = function(status, category , message) {
			logCount++;
			$('#logs').append('<div><span class="' + status + '">' + category + ':</span> <span id="log' + logCount + '"></span></div>');
			$('#logs').animate({scrollTop: $('#logs').prop("scrollHeight")}, 350, 'swing', function() { 
				if(logCount > 50) {
					$('#logs').find('div:first').remove(); 
				}
			});

			//!!! todo: animate log messages, reveal one character at a time
			$('#log' + logCount).writeText(message);
		};

	})();
});