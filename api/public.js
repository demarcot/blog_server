const express = require('express');
const publicRouter = express.Router();
const models = require('./db/models');
const crypto = require('crypto');
const roles = require('./roles');

publicRouter.post('/login', (req, res) => {
    // TODO(Tom): Limit login attempts for IP and username to 3 per hour, 100 per day
    // TODO(Tom): Using req data, verify user account and create signed JWT, have client store JWT in local storage
    // req.body.username;
    // req.body.password;
    //jwt.sign();

    models.User.find({username: req.body.username})
    .then((docs) => {
        if(docs.length === 1)
        {
            let h = createHash(req.body.password, docs[0].salt);
            if(h === docs[0].hash)
            {
                console.log('User credentials matched.');
                //TODO(Tom): Create JWT and return to user
                res.send(docs);
            } else 
            {
                console.log('User credentials not matched.');
                res.sendStatus(404);
            }
        } else if(docs.length > 1)
        {
            console.log('Duplicates of user exist.');
            res.sendStatus(404);
        } else 
        {
            console.log('User not found.');
            res.sendStatus(404);
        }
    })
    .catch((err) => {
        console.log('Error checking for existing user: ', err);
        res.sendStatus(404);
    });
});

publicRouter.post('/create-user', (req, res) => {
    // What limitations are needed to avoid abuse?
    models.User.find({username: req.body.username})
    .then((docs) => {
        if(docs.length != 0)
        {
            console.log('User already present.');
            res.sendStatus(404);
        } else 
        {
            let u = createUser(req);
            models.User.create(u)
            .then((doc) => {
                res.send('User created');
            })
            .catch((err) => {
                console.log("Error creating user: ", err);
                res.sendStatus(404);
            });
        }
    })
    .catch((err) => {
        console.log('Error checking for existing user: ', err);
        res.sendStatus(404);
    });
});

function createUser(req)
{
    let u = {};
    u.username = req.body.username;
    u.salt = createSalt();
    u.hash = createHash(req.body.password, u.salt);
    u.role = req.body.role === 'author' ? roles.AUTHOR : roles.READER;

    return u;
    
}

function createSalt(){
    // Arbitrary salt length of 16
    return crypto.randomBytes(16)
    .toString('hex')
};

function createHash(password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return value;
};

module.exports = publicRouter;