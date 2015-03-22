var express = require('express'),
	sensorData = require('./sensorData.js'),
	port = 8080;

var app = express();
//var sample = sensorData.createSensorDataSample();

app.get('/ping', function(req, res) {
	res.send('OK');
});

app.post('/users/:userId/', function(req, res) {
	// TODO, validate request and push data to the db
    res.send('Post data for user: ' + req.params["userId"]);
});

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});
