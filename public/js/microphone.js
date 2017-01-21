
// OCTAVE 0 - PROBABLY WILL NOT BE NEEDED
var oct_0_beg = 16.35; // C0
var oct_0_end = 30.87; // B0
var octave_0 = [ 16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87 ];

// OCTAVE 1
var oct_1_beg = 32.70; // C1
var oct_1_end = 61.74; // B1
var octave_1 = [ 32.70, 34.65, 36.71, 38.89, 41.20, 43.65, 46.25, 49.00, 51.91, 55.00, 58.27, 61.74 ];

// OCTAVE 2
var oct_2_beg = 65.41; // C2
var oct_2_end = 123.47; // B2
var octave_2 = [ 65.41, 69.30, 73.42, 77.78, 82.41, 87.31, 92.50, 98.00, 103.83, 110.00, 116.54, 123.47 ];

// OCTAVE 3
var oct_3_beg = 130.81; // C3
var oct_3_end = 246.94; // B3
var octave_3 = [ 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94 ];

// OCTAVE 4
var oct_4_beg = 261.63; // C4
var oct_4_end = 493.88; // B4
var octave_4 = [ 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88 ];

// OCTAVE 5
var oct_5_beg = 523.25; // C5
var oct_5_end = 987.77; // B5
var octave_5 = [ 523.25, 554.37, 587.33, 622.25, 659.26, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77 ];

// OCTAVE 6 - MAYBE NEEDED FOR INSTRUMENT
var oct_6_beg = 1046.50; // C6
var oct_6_end = 1975.53; // B6
var octave_6 = [ 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53 ];

// OCTAVE 7 - PROBABLY WILL NOT BE NEEDED
var oct_7_beg = 2093.00; // C7
var oct_7_end = 3951.07; // B7
var octave_7 = [ 2093.00, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520.00, 3729.31, 3951.07 ];

// OCTAVE 8 - PROBABLY WILL NOT BE NEEDED
var oct_8_beg = 4186.01; // C8
var oct_8_end = 7902.13; // B8
var octave_8 = [ 4186.01, 4434.92, 4698.64, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040.00, 7458.62, 7902.13 ];

// SETS MIDDLE C
var C_0 = 16.35;
var C_3 = 130.81;
var F_sharp_5 = 739.99;

var notes = [ "Cnormal", "Csharp", "Dnormal", "Eflat", "Enormal", "Fnormal", "Fsharp", "Gnormal", "Gsharp", "Anormal", "Bflat", "Bnormal" ]; // NEED TO ADD OCTAVE NUMBER
var test_frequencies = [];

for (var i = 0; i < 30; i++)
{
	// LOWER OCTAVE C0 TO F2
	var lower_note_frequency = C_0 * Math.pow(2, i / 12);

	// CREATES A RANGE FROM C3 TO F5
	var middle_note_frequency = C_3 * Math.pow(2, i / 12); // 2 to the 12th power

	// CREATES A RANGE FROM F#5 TO B7
	var upper_note_frequency = F_sharp_5 * Math.pow(2, i / 12);

	// console.log(lower_octave);
	var note_name = notes[i % 12];
	var note = { "frequency": middle_note_frequency, "name": note_name };
	var just_above = { "frequency": middle_note_frequency * Math.pow(2, 1 / 48), "name": note_name + " (a bit sharp)" };
	var just_below = { "frequency": middle_note_frequency * Math.pow(2, -1 / 48), "name": note_name + " (a bit flat)" };
	test_frequencies = test_frequencies.concat([ just_below, note, just_above ]);
}

window.addEventListener("load", initialize);
var correlation_worker = new Worker("/js/correlation_worker.js");
correlation_worker.addEventListener("message", interpret_correlation_result);

function initialize()
{
	var get_user_media = navigator.getUserMedia;
	get_user_media = get_user_media || navigator.webkitGetUserMedia;
	get_user_media = get_user_media || navigator.mozGetUserMedia;
	get_user_media.call(navigator, { "audio": true }, use_stream, function() {});
}


function use_stream(stream)
{
	var audio_context = new AudioContext();

	var microphone = audio_context.createMediaStreamSource(stream);

	window.source = microphone; // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=934512

	// (bufferSize, numberOfInputChannels, numberOfOutputChannels)
	var script_processor = audio_context.createScriptProcessor(1024, 1, 1);

	script_processor.connect(audio_context.destination);
	microphone.connect(script_processor);

	var buffer = [];
	var sample_length_milliseconds = 1; // was 100, changed on 4/17
	var recording = true;

	window.capture_audio = function(event)
	{
		if (!recording)
			return;
		buffer = buffer.concat(Array.prototype.slice.call(event.inputBuffer.getChannelData(0)));

		// Stop recording after sample_length_milliseconds.
		if (buffer.length > sample_length_milliseconds * audio_context.sampleRate / 1000)
		{
			recording = false;
			correlation_worker.postMessage
			(
				{
					"timeseries": buffer,
					"test_frequencies": test_frequencies,
					"sample_rate": audio_context.sampleRate
				}
			);
			buffer = [];
			setTimeout(function() { recording = true; }, 1);
		}
	};

	script_processor.onaudioprocess = window.capture_audio;
}

function createAudioMeter(audioContext,clipLevel,averaging,clipLag)
{
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || .1;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;

	// this will have no effect, since we don't copy the input to the output,
	// but works around a current Chrome bug.
	processor.connect(audioContext.destination);

	processor.checkClipping =
		function(){
			if (!this.clipping)
				return false;
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false;
			return this.clipping;
		};

	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};

	return processor;
}

function volumeAudioProcess( event )
{
	var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
	var sum = 0;
    var x;

	// Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
    	x = buf[i];
    	if (Math.abs(x)>=this.clipLevel) {
    		this.clipping = true;
    		this.lastClip = window.performance.now();
    	}
    	sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
    var volume = Math.max(rms, this.volume*this.averaging);
    vol = (volume * 100).toFixed(1);

}

	// get canvas
	var c = document.getElementById('canvas');
	ctx = c.getContext("2d");

	// we will start at the center
	// x and y coordinates
	var x = 960, y = 360;

	var notesArray = ["An","Bf","Bn","Cn","Cs","Dn","Ef","En","Fn","Fs","Gn","Gs"];

	notesArray["An"]  = {leftX : 0, rightX : 480, topY : 0, bottomY : 360, color : "#ffffff"};
	notesArray["Bf"] = {leftX : 0, rightX : 480, topY : 360, bottomY : 720, color : "#ffffff"};
	notesArray["Bn"]  = {leftX : 480, rightX : 960, topY : 0, bottomY : 360, color: "#ffffff"};
	notesArray["Cn"]  = {leftX : 0, rightX : 480, topY : 720, bottomY : 1080, color: "#ffffff"};
	notesArray["Cs"] = {leftX : 480, rightX : 960, topY : 360, bottomY : 720, color: "#ffffff"};
	notesArray["Dn"]  = {leftX : 960, rightX : 1440, topY : 0, bottomY : 360, color: "#ffffff"};
	notesArray["Ef"] = {leftX : 480, rightX : 960, topY : 720, bottomY : 1080, color: "#ffffff"};
	notesArray["En"]  = {leftX : 960, rightX : 1440, topY : 360, bottomY : 720, color: "#ffffff"};
	notesArray["Fn"]  = {leftX : 1440, rightX : 1920, topY : 0, bottomY : 360, color: "#ffffff"};
	notesArray["Fs"]  = {leftX : 960, rightX : 1440, topY : 720, bottomY : 1080, color: "#ffffff"};
	notesArray["Gn"] = {leftX : 1440, rightX : 1920, topY : 360, bottomY : 720, color: "#ffffff"};
	notesArray["Gs"]  = {leftX : 1440, rightX : 1920, topY : 720, bottomY : 1080, color: "#ffffff"};

	var started = 0;
	var stop = 0;

function interpret_correlation_result(event) {

	ctx.beginPath();
	ctx.moveTo(x,y);

	var timeseries = event.data.timeseries;
	var frequency_amplitudes = event.data.frequency_amplitudes;
	// Compute the (squared) magnitudes of the complex amplitudes for each
	// test frequency.
	var magnitudes = frequency_amplitudes.map(function(z) { return z[0] * z[0] + z[1] * z[1]; });

	// Find the maximum in the list of magnitudes.
	var maximum_index = -1;
	var maximum_magnitude = 0;
	for (var i = 0; i < magnitudes.length; i++)
	{
		if (magnitudes[i] <= maximum_magnitude)
			continue;
		maximum_index = i;
		maximum_magnitude = magnitudes[i];
	}
	// Compute the average magnitude. We'll only pay attention to frequencies
	// with magnitudes significantly above average.
	var average = magnitudes.reduce(function(a, b) { return a + b; }, 0) / magnitudes.length;
	var confidence = maximum_magnitude / average;
	var confidence_threshold = 1;

	if (confidence > confidence_threshold) {

		var dominant_frequency = test_frequencies[maximum_index];
		var note = dominant_frequency.name;
		var freq = dominant_frequency.frequency;

	    if (vol < 3) {

		    stop++;
		    // console.log('stop : ' + stop, 'started : ' + started);
			if (stop == 350) {
				createScreenshot();
        	};

	    } else {

	    	if ( started == 1 && stop > 350 ) {
	    		location.reload();
	    	}

	        // do something in here
	        var n = (note.slice(0,2)) ? note.slice(0,2) : "D" ;
	        console.log(n, notesArray[n].rightX);
            x = Math.floor(Math.random() * (notesArray[n].rightX - notesArray[n].leftX + 1)) + notesArray[n].leftX;
            y = Math.floor(Math.random() * (notesArray[n].bottomY - notesArray[n].topY + 1)) + notesArray[n].topY;

            rand1 = Math.floor(Math.random() * (notesArray[n].rightX - notesArray[n].leftX + 1)) + notesArray[n].leftX;
            rand2 = Math.floor(Math.random() * (notesArray[n].bottomY - notesArray[n].topY + 1)) + notesArray[n].topY;
            rand3 = Math.floor(Math.random() * (notesArray[n].rightX - notesArray[n].leftX + 1)) + notesArray[n].leftX;
            rand4 = Math.floor(Math.random() * (notesArray[n].bottomY - notesArray[n].topY + 1)) + notesArray[n].topY;

			// ctx.shadowColor = '#eaeaea';
			// ctx.shadowBlur = Math.floor(Math.random() * (vol - 1 + 1)) + 1;
			// ctx.shadowOffsetX = Math.floor(Math.random() * ((vol - 15) - 1 )) + 1;
			// ctx.shadowOffsetY = Math.floor(Math.random() * ((vol -15) - 1 )) + 1;
			createOpacity = ((.3 / vol) * 10);
			ctx.globalAlpha = (createOpacity);
			ctx.strokeStyle = '#000';
			ctx.lineCap = 'round';
      		ctx.lineWidth = (vol - 2); // org 10
			ctx.bezierCurveTo( rand1, rand2 , rand3, rand4, x,y);
	    	ctx.stroke();

	        x = x;
	        y = y;
	        stop = 0;
	        started = 1;
	    }
	}
}

function createScreenshot() {

	var date = new Date();
	var time = date.getTime();

    var c = document.getElementById('canvas');
    ctx = c.getContext("2d");

    var img = document.getElementById('canvas');

    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    var img = canvas.toDataURL('png');
    // window.open(img);

    var a = document.createElement('a');
    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.  Just wanted to save this here in case we needed it.
    a.href = canvas.toDataURL();
    a.download = 'image-' + time + '.png';
    a.click();
    // location.reload();
}
