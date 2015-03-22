var express = require('express'),
	port = 8080;

var app = express();

app.get('/ping', function(req, res) {
	res.send('OK');
});

app.post('/users/:userid/', function(req, res) {
	// TODO: save data in database
    res.send('Post data for user: ' + req.body.username);
});

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});
