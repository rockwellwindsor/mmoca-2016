var express = require('express');

// env variable to help determine what environment we are in
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

app.set('port', (process.env.PORT || 3030));

app.use(express.static('public'));

// app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);

// adds route to deliver index page
app.get('/', function(req, res) {
	res.render(__dirname + '/server/views/color.html');
});
   
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
 






