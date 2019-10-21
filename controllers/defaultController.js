const httpStatus = require("http-status-codes");
const request = require('request');
const querystring = require('querystring');
const crypto = require('crypto');
const dao = require('../dao/dao');

function index(req,res) {
    dao.init();
    res.render('index');
}

function getUsers(req, res) {
    dao.getUsers((err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send(rows);
    })
}

function getUser(req, res) {
    var callerId = req.params.callerId;
    dao.getUser(callerId, (err, row) => {
        if(err) {
            console.error(err);
            return;
        }
        res.send(row);
    }) 
}

function saveUser(req, res) {
    var callerId = req.params.callerId;
    var privateKey = req.params.privateKey;
    dao.getUser(callerId, (err, row) => {
        if(err) {
            console.error(err);
            return;
        }
        console.log(row);
        if(!row) {
            dao.saveUser(callerId, privateKey, (err) => {
                if(err) console.error(err);
                console.log(`User "${callerId}" created.`)
                res.send(JSON.stringify({status: "ok"}));
            })
        }
    })
}

function callBooliApi (req, res) {
    var callerId = req.params.callerId;
    var q = req.params.q;
    var minLivingArea = req.params.minLivingArea;
    var maxLivingArea = req.params.maxLivingArea;

    dao.getUser(callerId, (err, row) => {
        if(err) {
            console.error(err);
            return;
        }
        var privateKey = row.apiKey;
        
        var shasum = crypto.createHash('sha1');
        var qp = {
            q: q,
            minLivingArea: minLivingArea,
            maxLivingArea: maxLivingArea,
            limit: 10,
            offset: 0,
            callerId: callerId,
            time: Math.round(Date.now() / 1000),
            unique: crypto.randomBytes(Math.ceil(16/2))
                .toString("hex")
                .slice(0, 16),
        }
        qp.hash = shasum.update(qp.callerId + qp.time + privateKey + qp.unique).digest("hex");
        var url = 'http://api.booli.se/listings/?' + querystring.stringify(qp);
        
        request(url, (err, resp, body) => {
            if (err) {
                console.error(err);
                return;
            }
            res.send(body);
        })   
    })
}

function saveListing(req, res) {
    const data = {
        callerId: req.params.callerId,
        listingId: req.params.listingId,
        q: req.params.q,
        minLivingArea: req.params.minLivingArea,
        maxLivingArea: req.params.maxLivingArea
    };

    dao.saveUserData(data, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send(JSON.stringify({status: "ok"}));
    });
}

function noResourceFound (req, res) {
    res.status(httpStatus.NOT_FOUND);
    res.send(`${httpStatus.NOT_FOUND} | Page not found.`)
}

function internalError (req, res) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
    res.send(`${httpStatus.INTERNAL_SERVER_ERROR} | Internal server error.`)
}

module.exports = {
    index,
    saveUser,
    getUsers,
    getUser,
    callBooliApi,
    saveListing,
    noResourceFound,
    internalError
};