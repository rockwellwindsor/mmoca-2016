
// Set the canvas to fill the screen size
$(document).on('ready', function() {
    var width = $(window).width();
    var height = $(window).height();
    $('#canvas').prop('width', width).prop('height', height);
});

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

// Activate the microphone
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
        if (buffer.length > sample_length_milliseconds * audio_context.sampleRate / 320)
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

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
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

function volumeAudioProcess( event ) {
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

// Create the grid

    // get width and height of screen
    var width = $( window ).width();
    var height = $( window ).height();

    // Need to find the middle point
    var middle_x = width / 2;
    var middle_y = height / 2;

    var width_per_section = width / 4;
    var height_per_section = height / 3;

    // Define each boxes parameters
    var column_1_x = width_per_section;
    var column_2_x = width_per_section * 2;
    var column_3_x = width_per_section * 3;
    var column_4_x = (width_per_section * 4) - 25;

    var row_1_y = height_per_section;
    var row_2_y = height_per_section * 2;
    var row_3_y = (height_per_section * 3) - 25;

    var notesArray = ["An","Bf","Bn","Cn","Cs","Dn","Ef","En","Fn","Fs","Gn","Gs"];

    notesArray["An"] = { leftX : 25,           rightX : column_1_x,  topY : 25,        bottomY : row_1_y,  color : "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Bf"] = { leftX : 25,           rightX : column_1_x,  topY : row_1_y,   bottomY : row_2_y,  color : "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Bn"] = { leftX : column_1_x,   rightX : column_2_x,  topY : 25,        bottomY : row_1_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Cn"] = { leftX : 25,           rightX : column_1_x,  topY : row_2_y,   bottomY : row_3_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Cs"] = { leftX : column_1_x,   rightX : column_2_x,  topY : row_1_y,   bottomY : row_2_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Dn"] = { leftX : column_2_x,   rightX : column_3_x,  topY : 25,        bottomY : row_1_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Ef"] = { leftX : column_1_x,   rightX : column_2_x,  topY : row_2_y,   bottomY : row_3_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["En"] = { leftX : column_2_x,   rightX : column_3_x,  topY : row_1_y,   bottomY : row_2_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Fn"] = { leftX : column_3_x,   rightX : column_4_x,  topY : 25,        bottomY : row_1_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Fs"] = { leftX : column_2_x,   rightX : column_3_x,  topY : row_2_y,   bottomY : row_3_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Gn"] = { leftX : column_3_x,   rightX : column_4_x,  topY : row_1_y,   bottomY : row_2_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};
    notesArray["Gs"] = { leftX : column_3_x,   rightX : column_4_x,  topY : row_2_y,   bottomY : row_3_y,  color: "#"+Math.floor(Math.random()*16777215).toString(16)+""};

    // we will start at the center
    // x and y coordinates
    var x = middle_x, y = middle_y;

var stop = 0;
var started = 0;

function interpret_correlation_result(event)
{

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

        if (vol < 1) {

            stop++; 

            if (stop == 350) {
             if (started == 1) {
                createScreenshot(); 
                ctx.closePath();
             } else {
                // location.reload();
             }
            };

        } else {

            // do something in here
            var n = (note.slice(0,2)) ? note.slice(0,2) : "Dn" ;
            console.log(n, notesArray[n].rightX);

            x = Math.floor(Math.random() * (notesArray[n].rightX - notesArray[n].leftX + 1)) + notesArray[n].leftX;
            y = Math.floor(Math.random() * (notesArray[n].bottomY - notesArray[n].topY + 1)) + notesArray[n].topY;

            rand1 = Math.floor(Math.random() * (notesArray[n].rightX - notesArray[n].leftX + 1)) + notesArray[n].leftX;
            rand2 = Math.floor(Math.random() * (notesArray[n].bottomY - notesArray[n].topY + 1)) + notesArray[n].topY; 
            rand3 = Math.floor(Math.random() * (notesArray[n].rightX - notesArray[n].leftX + 1)) + notesArray[n].leftX;
            rand4 = Math.floor(Math.random() * (notesArray[n].bottomY - notesArray[n].topY + 1)) + notesArray[n].topY;

            ctx.shadowColor = "#"+Math.floor(Math.random()*16777215).toString(16)+"";
            // ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = Math.floor(Math.random() * (vol + 10));
            ctx.shadowOffsetX = Math.floor(Math.random() * ((vol - 15) - 1)) + 1;
            ctx.shadowOffsetY = Math.floor(Math.random() * ((vol + 24) - 1)) + 1; // Set to 24 to stay within the padding added to grid numbers above.

            ctx.globalAlpha = ((vol - 1) / 10);
            ctx.strokeStyle = notesArray[n].color;
            ctx.lineCap = 'round';
            ctx.lineWidth = (vol - 5);

            ctx.bezierCurveTo( rand1, rand2 , rand3, rand4, x,y);

            if (stop > 1500) {

                location.reload();

            } else {

                ctx.stroke(); 

            }

            x = x;
            y = y;
            stop = 0;        
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
    var img = canvas.toDataURL('jpg');
    // window.open(img);  

    var a = document.createElement('a');
    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.  Just wanted to save this here in case we needed it.
    a.href = canvas.toDataURL();
    a.download = 'image-' + time + '.jpg';
    a.click();
    location.reload();
}