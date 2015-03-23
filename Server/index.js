var express = require('express'), port = 8080;
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var url = require('url');
var db = monk('localhost:27017/als');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});


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

    collection.findOne({ '_id': userid }, {}, function (e, data) {
        console.log(data);
        if (!data) {
            return res.status(404).json({ error: 'user does not exist' }).send();
        }

        delete data.password;

        res.send(data);
    });
});

app.post('/user/', function (req, res) {
    if (!req.body) return res.sendStatus(400);


    //TODO: improve fields validation

    if (!req.body.firstName || req.body.firstName.length < 2) {
        return res.status(400).json({ error: 'First name is missing or not valid' }).send();
    }

    if (!req.body.lastName || req.body.lastName.length < 2) {
        return res.status(400).json({ error: 'Last name is missing or not valid' }).send();
    }

    if (!req.body.email || req.body.email.length < 6) {
        return res.status(400).json({ error: 'Email is missing or not valid' }).send();
    }

    if (!req.body.password || req.body.password.length < 2) {
        return res.status(400).json({ error: 'Password is missing or not valid' }).send();
    }

    var collection = db.get('users');
    console.log('adding user '+ req.body);
    collection.insert(req.body, function (err, result) {
        console.log("User added successfully!\n" + result);
		
		delete result.password;
        res.send(result);
    });
});

app.post('/validate/', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (!req.body.email) {
        return res.status(400).json({ error: 'email is not valid' }).send();
    }

    if (!req.body.password) {
        return res.status(400).json({ error: 'password was not specified' }).send();
    }

    var collection = db.get('users');
    collection.findOne({ 'email': req.body.email }, {}, function (e, data) {
        console.log('validating user ' + req.body.email + ' pass:' + req.body.password + ' server data:' + data);
        if (!data) {
            return res.status(404).json({ error: 'user does not exist' }).send();
        }

        if (data.password != req.body.password) {
            return res.status(404).json({ error: 'password is not correct' }).send();
        }

		delete data.password;
        res.send(data);
    });
});



var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
});
