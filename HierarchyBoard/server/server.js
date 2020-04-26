'use strict';
let path = require('path');
let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let app = express();
let server = require('http').Server(app);
let staticPath = path.join(__dirname, '../');

app.use(express.static(staticPath));
app.use(session({ secret: 'topsecret' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let sqlite3 = require('sqlite3');
let db = new sqlite3.Database('main.db', (error) => {
    if (error) {
        console.error(error.message)
    } else {
        console.log("Connect to the database")
    }
});

let port = 8080;

app.set('port', port);

app.post('/login', function (req, res) {
    if (req.body.mail.length == 0 || req.body.password.length == 0) {
        res.send({
            res: false,
            msg: 'wrong email or password'
        });
        return;
    }
    db.serialize(() => {
        db.each("SELECT * FROM users WHERE mail='" + req.body.mail + "'", (err, row) => {
            if (err)
                console.error(err.message);
            if (req.body.password == row.password) {
                res.send({
                    res: true,
                    name: row.name
                });
                var stmt = db.prepare("UPDATE users SET sessionid = ?");
                stmt.run(req.session.id, function (error) {
                    if (error) {
                        console.error(error.message);
                        console.log('Fail to save session for user '.concat(req.body.mail));
                    } else {
                        console.log("Successfully save session:".concat(req.body.mail));
                    }
                });
                stmt.finalize();
            } 
            else
                res.send({
                    res: false,
                    msg: 'wrong login or password'
                });
        });
    });
});

app.post('/registration', function (req, res) {
    if (req.body.name.length == 0
        || req.body.mail.length == 0
        || req.body.password.length == 0)
    {
        res.send({
            res: false,
            msg: 'wrong login or email or password'
        });
        return;
    }
    db.serialize(function () {
        db.each("SELECT count(name) as res FROM users WHERE name='" + req.body.name + "' or email = '" + req.body.mail + "'",
            (err, row) => {
            if (err)
                console.error(err.message);
            if (row.res != 0) {
                res.send({
                    res: false,
                    msg: 'wrong login or email'
                });
            }
            else {
                var stmt = db.prepare("INSERT INTO users VALUES (Null, ?, ?, ?, 0, 0)");
                stmt.run(req.body.name, req.body.mail, req.body.password, function (error) {
                    if (error) {
                        console.error(error.message);
                        res.send({
                            res: false,
                            msg: 'wrong login or email'
                        });
                    } else {
                        res.send({ res: true });
                        console.log("User successfully registered with email:".concat(req.body.mail));
                    }
                });
                stmt.finalize();
            }
        });
    });
});

app.get('/logout', function (req, res) {
    var sessionId = req.session.id
    console.log('logout ' + sessionId);
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            var stmt = db.prepare("UPDATE users SET sessionid = null");
            stmt.run(function (error) {
                if (error) {
                    console.error(error.message);
                    console.log('Fail to remove session for user: '.concat(sessionId));
                } else {
                    console.log("Successfully remove session: ".concat(sessionId));
                }
            });
            stmt.finalize();
            res.redirect('/');
        }
    });
});

server.listen(port, function () {
    console.log('server running on port ' + port);
});