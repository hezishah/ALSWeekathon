var express = require('express'),	port = 8080;
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var url = require('url');
var db = monk('localhost:27017/als');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


app.get('/ping', function(req, res) {
	res.send('OK');
});

app.get('/signals/:userid', function(req, res){
    var collection = db.get('signals');
	var userid = req.params.userid;
    collection.find({'userid' : userid },{},function(e, data){
        res.send(data);
    });	
});

app.post('/signals/:userid/',function(req, res){
	if (!req.body) return res.sendStatus(400);
	
	var collection = db.get('signals');
	var id = req.params.userid;
	var data = req.body.signals;
	
	for(i=0;i<data.length;i++)
	{
		data[i].userid = id;
		data[i].timestamp = new Date().getTime();	
	}
	
	collection.insert(data, function(err, result) {
		console.log("Signals saved successfully!");
		res.send('OK');
	});
});

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});
