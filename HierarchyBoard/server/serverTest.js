let sqlite3 = require('sqlite3');
let db = new sqlite3.Database('users.db', (error) => {
    if (error) {
        console.error(error.message)
    } else {
        console.log("Connect to the database")
    }
});

db.run(`
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text,
    email text,
    password text
)
`);

function addUser(name, email, password) {
    db.serialize(function () {
        var stmt = db.prepare("INSERT INTO users VALUES (Null, ?, ?, ?)");
        stmt.run(name, email, password, function (error) {
            if (error) {
                console.error(error.message);
            } else {
                console.log("User successfully registered with email:".concat(email));
            }
        });
        stmt.finalize();
    });
}

//addUser('user1', 'user1', 'user1');
//addUser('user2', 'user2', 'user2');
//addUser('user3', 'user3', 'user3');

//db.serialize(() => {
//    db.each("SELECT count(name) as res FROM users WHERE name='user1'", (err, row) => {
//        if (err) {
//            console.error(err.message);
//        }
//        console.log(row);
//    });
//});

process.on('SIGINT', () => {
    console.log('Close db');
    db.close();
});