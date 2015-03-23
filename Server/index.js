var express = require('express'), port = 8080;
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var url = require('url');
var db = monk('localhost:27017/als');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


app.get('/ping', function (req, res) {
    res.send('OK');
});

app.get('/signals/:userid', function (req, res) {
    var collection = db.get('signals');
    var userid = req.params.userid;
    if (!userid) {
        return res.sendStatus(400);
    }

    console.log('get signals for user ' + userid);

    collection.find({ 'userid': userid }, {}, function (e, data) {
        //console.log(data);
        res.send(data);
    });
});

app.get('/signals/:userid/:from/:to', function (req, res) {
    var collection = db.get('signals');
    var userid = req.params.userid;
    if (!userid) return res.sendStatus(400);

    var from = req.params.from;
    var to = req.params.to;

    if (!from || !to) return res.sendStatus(400);


    collection.find({ 'userid': userid, 'timestamp': { $gt: from, $lt: to } }, {}, function (e, data) {
        res.send(data);
    });
});

app.post('/signals/:userid/', function (req, res) {
    if (!req.body) return res.sendStatus(400);

    var collection = db.get('signals');
    var id = req.params.userid;
    var data = req.body.signals;

    for (i = 0; i < data.length; i++) {
        data[i].userid = id;
        data[i].timestamp = req.body.timestamp;
    }

    collection.insert(data, function (err, result) {
        console.log("Signals saved successfully!");
        res.send('OK');
    });
});

app.delete('/signals/:userid/', function (req, res) {
    var collection = db.get('signals');
    var id = req.params.userid;

    collection.remove({ 'userid': id }, function (err, result) {
        res.send('OK');
    });
});

app.get('/user/:id', function (req, res) {
    var userid = req.params.id;
    if (!userid) {
        return res.sendStatus(400);
    }

    var collection = db.get('users');
    console.log('get user ' + userid);

    collection.findOne({ 'username': userid }, {}, function (e, data) {
        console.log(data);
        if (!data) {
            return res.status(404).json({ error: 'user does not exist' }).send();
        }

        delete data.password;

        res.send(data);
    });
});

app.post('/user/:id', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var userid = req.params.id;
    if (!userid) {
        return res.status(400).json({ error: 'user id is not valid' }).send();
    }

    var collection = db.get('users');
    console.log('adding user ' + userid + ' \n' + req.body);
    collection.insert(req.body, function (err, result) {
        console.log("Signals saved successfully!\n" + result);
        res.send('OK');
    });
});

app.post('/validate/:id', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var userid = req.params.id;
    if (!userid) {
        return res.status(400).json({ error: 'user id is not valid' }).send();
    }

    if (!req.body.password) {
        return res.status(400).json({ error: 'password was not specified' }).send();
    }

    var collection = db.get('users');
    collection.findOne({ 'username': userid }, {}, function (e, data) {
        console.log('validating user ' + userid + ' pass:' + req.body.password + ' server data:' + data);
        if (!data) {
            return res.status(404).json({ error: 'user does not exist' }).send();
        }

        if (data.password != req.body.password) {
            return res.status(404).json({ error: 'password is not correct' }).send();
        }

        res.send('OK');
    });
});



var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
});
