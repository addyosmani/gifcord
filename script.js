var video = document.querySelector('#video'),
	canvas = document.querySelector('#canvas'),
	ctx = canvas.getContext('2d'),
	localMediaStream = null,
	fs = null, // file system
	error = 0, // if file system API error
	_stop = false, // if user presses stop
	frames = 0, // index for the image files (files0 files1 etc)
	_files = []; // store the path of the images recoreded



navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


function errorHandler(err){
error =1 ;
 var msg = 'An error occured: ';
 
	switch (err.code) {
		case FileError.NOT_FOUND_ERR:
			msg += 'File or directory not found';
			break;
 
		case FileError.NOT_READABLE_ERR:
			msg += 'File or directory not readable';
			break;
 
		case FileError.PATH_EXISTS_ERR:
			msg += 'File or directory already exists';
			break;
 
		case FileError.TYPE_MISMATCH_ERR:
			msg += 'Invalid filetype';
			break;
 
		default:
			msg += 'Unknown Error';
			break;
	}
 
 console.log(msg);
}

var stopRec = function() {
	video.pause();
	if(localMediaStream)
		localMediaStream.stop();
	_stop = 1;
};

var stop = document.getElementById('stop');
stop.addEventListener('click', stopRec, false);

var initDirectory = function(fs) {
	fs.root.getDirectory('Video', {create: true}, function(dirEntry) {
		console.log('You have just created the ' + dirEntry.name + ' directory.');

		document.getElementById('replay').addEventListener('click', replayVideo, false);

		fs.root.getDirectory('Video', {}, function(dirEntry){
			var dirReader = dirEntry.createReader();
			dirReader.readEntries(function(entries) {
			for(var i = 0; i < entries.length; i++) {
				var entry = entries[i];
					if (entry.isDirectory){
						console.log('Directory: ' + entry.fullPath);
					}
					else if (entry.isFile){
					console.log('File: ' + entry.fullPath);
					// remove comment to delete all files
					_files.push(entry.fullPath);
					frames = parseInt(entry.fullPath[entry.fullPath.length-1], 10);
				}
			}
		
			}, errorHandler);
		}, errorHandler);
	}, errorHandler);
};

var deleteReplay = function() {
		fs.root.getDirectory('Video', {}, function(dirEntry){
			var dirReader = dirEntry.createReader();
				dirReader.readEntries(function(entries) {
			if(!entries.length) alert('nothing to delete');
			for(var i = 0; i < entries.length; i++) {
				var entry = entries[i];
				if (entry.isFile){
					fs.root.getFile(entry.fullPath, {create: false}, function(fileEntry) {
					fileEntry.remove(function() {
					console.log('File successufully removed.');
					}, errorHandler);
				}, errorHandler);
			}
			}
		
			}, errorHandler);
		}, errorHandler);
};

document.getElementById('delete-replay').addEventListener('click', deleteReplay, false);

var writeToFile = function(name, data) {

	fs.root.getFile('Video/' + name, {create: true, exclusive: true}, function(fileEntry) {
		console.log('A file ' + fileEntry.name + ' was created successfully.');
			fs.root.getFile('Video/' + fileEntry.name, {create: false}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				console.log('writing to ' + 'Video/' + fileEntry.name);
				_files.push('Video/' + fileEntry.name);
				window.URL = window.URL || window.webkitURL;
				var bb = new Blob([data], {type: 'text/plain'});
				fileWriter.write(bb);
			}, errorHandler);
		}, errorHandler);
	}, errorHandler);
};


var initFs = function(filesys) {
	fs = filesys;
	setTimeout(initDirectory(fs), 500);
};

var frameimages = [];

var replayVideo = function(idx) {
	// reads through all the images and show them (image path stored in _files)

	stopRec(); // stop video recording
	video.style.display = 'none'; // hide the video to see the recording
	idx = parseInt(idx,10) || 0;


	if(_files[idx] === undefined) {
		alert('nothing to play');
		return;
	}
	
	var img = document.getElementById('replay-screen');
	fs.root.getFile(_files[idx], {}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
					img.src = this.result;
					
				if(++idx < _files.length) {
					setTimeout(function(){
						replayVideo(idx);
					}, 200);
				}
			};
			reader.readAsText(file);
		}, errorHandler);
	}, errorHandler);
};

function timeStamp() {
// Create a date object with the current time
  var now = new Date();
 
// Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
 
// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
 
// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";
 
// Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
 
// If hour is 0, set it to 12
  time[0] = time[0] || 12;
 
// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
 
// Return the formatted string
  return date.join("-") + " " + time.join("-") + " " + suffix;
}


// e.g readFile('/Video/lastvideo')
var readFile = function(filename) {
	fs.root.getFile(filename, {}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {

				var myImage = document.createElement('img');
			     myImage.src = this.result;
				 document.body.appendChild(myImage);

			};
			//reader.readAsText(file);
			reader.readAsDataURL(file);
		}, errorHandler);
	}, errorHandler);
};

	function fallback(e) {
		alert('User Media not supported in your browser');
	}

	var gif = new GIF({
	  workers: 4,
	  quality: 10,
	  delay: 1,
	  repeat: 0
	});

	gif.on('finished', function(blob) {


/*
 var delta, img;

                    img = document.id('result');
                    img.src = URL.createObjectURL(blob);
                    delta = now() - startTime;
                    return info.set('text', "done in\n" + ((delta / 1000).toFixed(2)) + "sec,\nsize " + ((blob.size / 1000).toFixed(2)) + "kb");
*/	  

	var file = URL.createObjectURL(blob);

	 // window.open(URL.createObjectURL(blob));
	 //window.open(file);
	 
	 //writeToFile( 'video' + timeStamp(), blob);

	writeToFile('lastvideo', blob);

	 var myImage = document.createElement('img');
     myImage.src = file;
	 document.body.appendChild(myImage);
		

	});

	function makeGif(){
	  gif.render();
	}

	function draw(v, bc, w, h) {
			bc.drawImage(v, 0, 0, w, h);
			var stringData=canvas.toDataURL();

			gif.addFrame(canvas, {copy: true});
			
			if(fs !== null) {
				writeToFile('frames' + frames++, stringData);
			}
			if(!_stop) {
				//200
				setTimeout(function(){ draw(v, bc, w, h); }, 100); // the timeout here decides video rec framerate
			}
	}


	function success(stream) {
		localMediaStream = stream;
		video.src = window.webkitURL.createObjectURL(stream);

		var back = document.getElementById('canvas');
		var backcontext = back.getContext('2d');

		cw = 360;
		ch = 240;
		back.width = cw;
		back.height = ch;
		draw(video, backcontext, cw, ch);

	}

	function playVideo() {
		if (!navigator.getUserMedia) {
			fallback();
		} else {
			navigator.getUserMedia({video: true}, success, fallback);
		}
	}

	function playLast(){
		readFile('/Video/lastvideo');
	}

document.getElementById('play').addEventListener('click', playVideo, false);
document.getElementById('makegif').addEventListener('click', makeGif, false);
document.getElementById('playlast').addEventListener('click', playLast, false);


window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestFileSystem(window.TEMPORARY, 10*1024*1024, initFs, errorHandler);


