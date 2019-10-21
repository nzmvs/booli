const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const absPath = path.resolve('./app.db');

function init() {
    let db = new sqlite3.Database(absPath, sqlite3.OPEN_READWRITE);
    const userSql = `CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        callerId TEXT NOT NULL UNIQUE,
        apiKey TEXT NOT NULL)`;
    const userDataSql = `CREATE TABLE IF NOT EXISTS userData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        callerId TEXT NOT NULL,
        listingId TEXT NOT NULL,
        q TEXT NOT NULL,
        minLivingArea TEXT NOT NULL,
        maxLivingArea TEXT NOT NULL,
        CONSTRAINT userData_fk_callerId FOREIGN KEY (callerId)
        REFERENCES user(callerId) ON UPDATE CASCADE ON DELETE CASCADE)`;
    db.serialize(() => { db
        .run(userSql)
        .run(userDataSql);
    });
    db.close();
}

function getUsers(callback) {
    let db = new sqlite3.Database(absPath, sqlite3.OPEN_READWRITE);
    const sql = `SELECT id, callerId, apiKey 
                FROM user`;
    db.serialize(() => { 
        db.all(sql, callback)
    });
    db.close();
}

function getUser(callerId, callback) {
    let db = new sqlite3.Database(absPath, sqlite3.OPEN_READWRITE);
    const sql = `SELECT id, callerId, apiKey 
                FROM user
                WHERE callerId = ?`;
    db.serialize(() => { 
        db.get(sql, [callerId], callback)
    });
    db.close();
}

function saveUser(callerId, apiKey, callback) {
    let db = new sqlite3.Database(absPath, sqlite3.OPEN_READWRITE);
    const sql = `INSERT OR IGNORE INTO user (callerId, apiKey) VALUES (?, ?)`;
    db.serialize(() => { db
        .run(sql, [callerId, apiKey], callback)
    })
    db.close();
}

function getUserData(callerId) {
    let db = new sqlite3.Database(absPath, sqlite3.OPEN_READWRITE);
    const sql = `SELECT q, minLivingArea, maxLivingArea 
                FROM userData
                INNER JOIN user
                    ON userData.userId = user.Id
                WHERE callerId = ?`;
    db.serialize(() => { db
        .all(sql, [callerId], (err, rows) => {
            if (err) console.error(err);
            return rows;
        })
    })
    db.close();
}

function saveUserData(data, callback) {
    let db = new sqlite3.Database(absPath, sqlite3.OPEN_READWRITE); 
    const sql = `INSERT INTO userData (callerId, listingId, q, minLivingArea, maxLivingArea) 
                       VALUES (?, ?, ?, ?, ?)`;
    const params = [
        data.callerId,
        data.listingId,
        data.q, 
        data.minLivingArea, 
        data.maxLivingArea];

    db.serialize(() => { 
        db.run(sql, params, callback)
    })
    db.close();
}

function deleteUserData(callerId, dataId) {
    let db = new sqlite3.Database(absPath, sqlite3.OPEN_READWRITE);
    const caller = getUser(callerId);    
    const sql = `DELETE FROM userData WHERE id = ? and userId = ?`;
    const params = [dataId, caller.userId];
    db.serialize(() => { db
        .run(sql, params, (err) => {
            if (err) console.error(err);
            console.log(`User '${callerId}' deleted some data`);
        })
    })
    db.close();
}

module.exports = {
    init,
    getUsers,
    getUser,
    saveUser,
    getUserData,
    saveUserData,
    deleteUserData
}
