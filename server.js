const https = require('https');
const fs = require('fs');
const path = require('path');

const kafka = require('kafka-node');

const express = require('express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const publicApi = require('./api/public');
const blogsApi = require('./api/blogs');
const usersApi = require('./api/users');

const pubCert = fs.readFileSync('./assets/private/public_key.pem');

// TODO(Tom): Create signed cert
/*
const options = {
    key: fs.readFileSync("/srv/www/keys/my-site-key.pem"),
    cert: fs.readFileSync("/srv/www/keys/chain.pem")
};
*/

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors());

// Redirects remain HTTPS
app.use(helmet());

// -- Protected routes --
app.use('/api/blogs', verifyUser, blogsApi);
app.use('/api/users', verifyUser, usersApi);

// -- Public facing routes --
app.use('/api/public', publicApi);


app.get('*', (req, res) => {
    // TODO(Tom): If logged in go to home, else go to login page
    res.sendStatus(404);
});
// -- END Public facing routes --



// Verification middleware
function verifyUser(req, res, next) {
    // TODO(Tom): Have client send JWT in Authorization header and verify
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
                next();
            }
        });
    }
}

// TODO(Tom): Listen for SIGTERM and gracefully kill server
app.listen(8001, () => {
    /*
    // Playing around with kafka
    let client = new kafka.KafkaClient();
    let consumer = new kafka.Consumer(client, [{topic: 'quickstart-events'}], {autoCommit: false});
    consumer.on("message", (m) => {console.log(m.key + " - " + m.value);});
    */    
    console.log('Listening on 8001...');

});
//https.createServer(options, app).listen(8080);