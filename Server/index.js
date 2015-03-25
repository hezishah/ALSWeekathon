var express = require('express'), port = 8080;
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var url = require('url');
var db = monk('localhost:27017/als');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
var analysis = require('./analysis.js');

app.get('/ping', function (req, res) {
    res.send('OK');
});

app.get('/signals/batches/:userid', function (req, res) {
    var collection = db.get('signals');
    var userid = req.params.userid;
    if (!userid) {
        return res.sendStatus(400);
    }

    console.log('get signals batches for user ' + userid);

    collection.distinct('uploadtime', { 'userid': userid }, function (e, data) {
        console.log('sending back ' + data.length + ' items');

        var batches = [];

        for (var i = 0; i < data.length; i++) {
            var batch = data[i];
            batches.push({ 'time': batch, userid: userid });
        }

        res.send({ 'batches': batches });
    });
});

app.get('/signals/:userid', function (req, res) {
    var collection = db.get('signals');
    var userid = req.params.userid;
    if (!userid) {
        return res.sendStatus(400);
    }

    console.log('get signals for user ' + userid);

    collection.find({ 'userid': userid }, { "limit": 100 }, function (e, data) {
        var resData = {
            signals: data
        };
        console.log('sending back ' + data.length + ' items');
        res.send(resData);
    });
});

app.get('/signals/:userid/:sensor/:from/:to', function (req, res) {
    var collection = db.get('signals');
    var userid = req.params.userid;
    if (!userid) return res.sendStatus(400);

    var from = req.params.from;
    var to = req.params.to;
    var sensor = req.params.sensor;

    if (!from || !to || !sensor) return res.sendStatus(400);

    collection.find({ 'userid': userid, 'sensorname': sensor, 'uploadtime': { $gte: parseInt(from), $lte: parseInt(to) } }, {}, function (e, data) {
        if (data) {
            console.log('received ' + data.length + ' items back');
        }

        res.send(data);
    });
});

app.post('/signals/:userid/', function (req, res) {
    if (!req.body) return res.sendStatus(400);

    var signalscollection = db.get('signals');
    var userscollection = db.get('users');
    var id = req.params.userid;

    if (!id) {
        console.log('post signals - user id is missing');
        return res.status(400).json({ error: 'user id is missing' }).send();
    }

    // check if user exist
    userscollection.findOne({ '_id': id }, {}, function (e, data) {
        if (!data) {
            console.log('user does not exist')
            return res.status(404).json({ error: 'user does not exist' }).send();
        }
    });

    var uploadTime = req.body.timestamp;

    if (!req.body.sensors) {
        console.log('post signals - sensors json is missing or invalid');
        return res.status(400).json({ error: 'sensors json is missing or invalid' }).send();
    }

    var sensorsArr = req.body.sensors;

    if (!sensorsArr || sensorsArr.length == 0) {
        console.log('post signals - sensors array is missing or invalid');
        return res.status(400).json({ error: 'sensors data is missing or invalid' }).send();
    }

    if (!uploadTime) {
        console.log('post signals - upload timestamp is missing or invalid');
        return res.status(400).json({ error: 'upload timestamp is missing or invalid' }).send();
    }

    var data = [];

    for (var i = 0; i < sensorsArr.length; i++) {
        for (var j = 0; j < sensorsArr[i].data.length; j++) {

            var item = sensorsArr[i].data[j];

            item.userid = id;
            item.uploadtime = uploadTime;
            item.sensorname = sensorsArr[i].name;

            data.push(item);
        }
    }

    console.log(data.length);

    signalscollection.insert(data, function (err, result) {
        console.log("Signals saved successfully!");
        res.send('OK - ' + data.length + ' were saved');
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
    console.log('adding user ' + req.body);
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
            return res.status(400).json({ error: 'password is not correct' }).send();
        }

        delete data.password;
        res.send(data);
    });
});

app.get('/analysis/:userid/:timestamp', function (req, res) {
    var collection = db.get('signals');
    var userid = req.params.userid;
    if (!userid) {
        console.log('user id is missing')
        return res.sendStatus(400);
        return res.status(400).json({ error: 'user id is missing or invalid' }).send();
    }

    var timestamp = req.params.timestamp;

    if (!timestamp) {
        console.log('timestamp is missing')
        return res.status(400).json({ error: 'timestamp is missing or invalid' }).send();
    }

    collection.find({ 'userid': userid, 'sensorname': 'right', 'uploadtime': parseInt(timestamp) }, {}, function (e, data) {
        if (data) {
            console.log('received ' + data.length + ' items back');
        }

        var rightResult = analysis.process(data);

        collection.find({ 'userid': userid, 'sensorname': 'left', 'uploadtime': parseInt(timestamp) }, {}, function (e, data) {
            if (data) {
                console.log('received ' + data.length + ' items back');
            }

            var leftResult = analysis.process(data);

            return res.send({ right: rightResult, left: leftResult });
        });
    });
});


var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
});
