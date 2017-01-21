module.exports = function(req, res, next) {
	// the plus sign before the word "new" give the number of milliseconds that have elapsed since jan 1st 1970 for the start of this function
	var start = +new Date();
	var stream = process.stdout;
	var url = req.url;
	var method = req.method;
	res.on('finish', function() {
		var duration = +new Date() - start;
		var message = method + ' to ' + url + '\ntook ' + duration + ' ms \n\n';
		// stream.write(message);
		console.log(message);
	});

	next();
};