'use strict';
let path = require('path');
let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let app = express();
let server = require('http').Server(app);
let staticPath = path.join(__dirname, '../');
let fs = require('fs')
let { v4: uuidv4 } = require('uuid');

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
    if (req.body.mail.length === 0 || req.body.password.length === 0) {
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
            if (row === undefined) {
                res.send({
                    res: false,
                    message: "Unknown user, please sign up"
                });
            }
            if (req.body.password === row.password) {
                res.send({
                    res: true,
                    name: row.name
                });
                var stmt = db.prepare("UPDATE users SET sessionid = ? WHERE mail= ?");
                stmt.run(req.session.id, req.body.mail, function (error) {
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
    if (req.body.name.length === 0) {
        res.send({
            res: false,
            msg: 'Empty name'
        });
        return
    }
    if (req.body.mail.length === 0) {
        res.send({
            res: false,
            msg: 'Empty email'
        });
        return
    }
    if (req.body.password.length === 0) {
        res.send({
            res: false,
            msg: 'Empty password'
        });
        return
    }
    db.serialize(function () {
        db.each("SELECT count(name) as res FROM users WHERE name='" + req.body.name + "' or mail = '" + req.body.mail + "'",
            (err, row) => {
            if (err)
                console.error(err.message);
            if (row.res !== 0) {
                res.send({
                    res: false,
                    msg: 'User allready exists'
                });
            } else {
                let stmt = db.prepare("INSERT INTO users VALUES (Null, ?, ?, ?, ?)");
                stmt.run(req.body.name, req.body.mail, req.body.password, req.session.id, function (error) {
                    if (error) {
                        console.error(error.message);
                        res.send({
                            res: false,
                            msg: 'Unexpected error (0x1)'
                        });
                    } else {
                        res.send({ res: true, message: "User successfully registered" });
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
            res.send({
                res: false,
                msg: 'Unexpected error (0x2)'
            });
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

app.get('/getlist', function (req, res) {
    db.get("SELECT * FROM users WHERE sessionid= ?", req.session.id,
        (err, row) => {
            if (err) {
                console.error(err.message);
            }
            if (row === undefined) {
                res.send({
                    res: false,
                    message: "Your session has expired, please login again"
                })
                return
            }
            db.all("SELECT fileid FROM owners WHERE ownerid= ?", row.id, function (err, rows) {
                if (err) {
                    console.error(err.message);
                }
                if (rows.length === 0) {
                    res.send({
                        res: false,
                        message: "The list is empty"
                    })
                    return
                }
                let ids = rows.map(row => row.fileid)
                console.log(ids)
                db.all("SELECT id, name FROM files WHERE id in (" + rows.map(function () {return '?'}).join(',') + ")", ids, function (err, rows) {
                    if (err) {
                        console.error(err.message);
                        res.send({
                            res: false,
                            message: "Unexpected error(0x3)"
                        })
                        return
                    }
                    let files = rows.map(function (row) {
                        let dict = {}
                        dict["id"] = row.id;
                        dict["name"] = row.name;

                        return dict
                    })
                    res.send({
                        res: true,
                        files: files
                    })
                })
            })
        });
});

app.get('/getfile', function (req, res) {
    if (req.query["fileid"] === undefined) {
        res.send({
            res: false,
            message: "File id is missing"
        })
        return
    }
    db.get("SELECT * FROM files WHERE id= ?", req.query["fileid"],
        (err, row) => {
            if (err) {
                console.log(err.message)
            }
            if (row === undefined) {
                res.send({
                    res: false,
                    message: "Unknown file id"
                })
            }
            let file = row
            db.get("SELECT * FROM owners WHERE fileid= ?", file.id, function (err, row) {
                if (err) {
                    console.log(err.message)
                }
                db.get("SELECT * FROM users WHERE id = ?", row.ownerid, function (err, row) {
                    if (row.sessionid === req.session.id) {
                        fs.readFile("./" + file.path, 'utf8', (err, jsonString) => {
                            if (err) {
                                console.log("Error reading file from disk:", err)
                                res.send({
                                    res: false,
                                    message: "File not found"
                                })
                                return
                            }
                            try {
                                const file = JSON.parse(jsonString)
                                res.send({
                                    res: true,
                                    file: file
                                })

                            } catch(err) {
                                console.log('Error parsing JSON string:', err)
                                res.send({
                                    res: false,
                                    message: "File corrupted"
                                })
                            }
                        })
                    } else {
                        res.send({
                            res: false,
                            message: "This file doesnt belong to you"
                        })
                    }
                })
            })
        })
});

app.post("/savefile", function(req, res) {
    db.get("SELECT * FROM users WHERE sessionid= ?", req.session.id,
        (err, row) => {
            if (err) {
                console.error(err.message);
            }
            if (row === undefined) {
                res.send({
                    res: false,
                    msg: 'Your session has expired, please re-login'
                });
                return
            }
            let filename = "./files/" + uuidv4() + ".hb"
            let ownerid = row.id;
            var stmt = db.prepare("INSERT INTO files VALUES (Null, ?, ?)");
            stmt.run(filename, req.body.name, function (error, row) {
                if (error) {
                    console.error(error.message);
                    res.send({
                        res: false,
                        msg: 'Unexpected error(0x4)'
                    });
                } else {
                    db.get("SELECT id FROM files WHERE path= ?", filename, function (err, row) {
                        if (err) {
                            console.log(err.message)
                            res.send({
                                res: false,
                                msg: 'Unexpected error(0x5)'
                            });
                            return
                        }
                        let stmt = db.prepare("INSERT INTO owners VALUES (?, ?)");
                        stmt.run(ownerid, row.id, function (error) {
                            if (error) {
                                console.error(error.message);
                                res.send({
                                    res: false,
                                    msg: 'Unexpected error(0x6)'
                                });
                            } else {
                                fs.writeFile(filename, JSON.stringify(req.body.file, null, 2), function(error) {
                                    if (error) {
                                        console.log(error.message)
                                        res.send({
                                            res: false,
                                            msg: 'Unexpected error(0x6)'
                                        });
                                    }
                                    res.send({
                                        res: true,
                                        msg: 'File successfully saved'
                                    });
                                })
                            }
                        });
                        stmt.finalize();
                    })
                }
            });
            stmt.finalize();
        });
})

server.listen(port, function () {
    console.log('server running on port ' + port);
});