const fs = require('fs');
const express = require('express');
const publicRouter = express.Router();
const models = require('../type/models');
const crypto = require('crypto');
const roles = require('../type/roles');
const jwt = require('jsonwebtoken');
const pubCert = fs.readFileSync(__dirname + '/../../assets/private/public_key.pem');
const priKey = fs.readFileSync(__dirname + '/../../assets/private/private_key.pem');
const pPhrase = require('./../../assets/private/secrets').key;

publicRouter.get('/blogs', (req, res) => {
    // Retrieve blogs
    models.Blog.find()
    .then((docs) => {
        res.send(docs);
    })
    .catch((err) => {
        console.err("Error finding blogs: ", err.reason);
        res.sendStatus(404);
    });
});

publicRouter.get('/verify', (req, res) => {
    let auth = req.header('Authorization');
    if(!auth || !auth.toLowerCase().includes('bearer ')) {
        res.sendStatus(401);
    } else {
        tkn = auth.split(' ')[1];
        jwt.verify(tkn, pubCert, {algorithms: ['RS256']}, (err, decodedTkn) => {
            if(err)
            {
                console.log("Error while authorizing:", err);
                res.sendStatus(401);
            } else 
            {
                res.sendStatus(200);
            }
        });
    }
});

publicRouter.post('/login', (req, res) => {
    // TODO(Tom): Limit login attempts for IP and username to 3 per hour, 100 per day

    models.User.find({username: req.body.username})
    .then((docs) => {
        if(docs.length === 1)
        {
            let user = docs[0];
            let h = createHash(req.body.password, user.salt);
            if(h === user.hash)
            {
                console.log('User credentials matched.');
                let token = jwt.sign({username: user.username, role: user.role}, {key: crypto.createPrivateKey({key: priKey, passphrase: pPhrase}), passphrase: pPhrase}, {algorithm: 'RS256'}, {expiresIn: '1h'});
                res.send({"jwt": token});
                //response.writeHead(200, {'Authorization': token});
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

//TODO(Tom): Limit based on email, IP, max allowed users, captcha?
publicRouter.post('/register', (req, res) => {
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
                res.status(200).send({desc: 'Blog submitted'});
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
    var hash = crypto.createHash('sha512');
    hash.update(salt+password);
    var value = hash.digest('hex');
    return value;
};

module.exports = publicRouter;