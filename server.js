const https = require('https');
const express = require('express');
const jwt = require('./jwt');
const helmet = require('helmet');
const cors = require('cors');

const publicRouter = require('./api/router/publicRouter');
const blogRouter = require('./api/router/blogRouter');
const userRouter = require('./api/router/userRouter');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
// Redirects remain HTTPS
app.use(helmet());
app.use(errHandler);

// -- Protected routes --
app.use('/api/blogs', verifier, blogRouter);
app.use('/api/users', verifier, userRouter);

// -- Public facing routes --
app.use('/api/public', publicRouter);
app.get('*', (req, res) => {
    res.sendStatus(404);
});

// Verification middleware
function verifier(req, res, next) {
    let token = jwt.getJwtFromAuthHeader(req.header('Authorization'));
    if(!token) {
        res.sendStatus(401);
    } else {
        if(jwt.verifyUser(token)) {
            next();
        } else {
            res.sendStatus(401);
        }
    }
}

// Error Handler
function errHandler(err, req, res, next) {
    console.log("Handling err: ", err.message);
    res.status(400).send(err.message);
}

// Server startup
let server = app.listen(8001, () => {        
    console.log('Listening on 8001...');
});

// Process termination handler
process.on('SIGTERM', () => {
    if(server.listening) {
        server.close((err) => {
            if(err) {
                console.log("Error shutting down on SIGTERM: ", err.message);
                process.exit(1);
            } else {
                console.log("Server stopped successfully.");
                process.exit();
            }
        })
    }
});

// Process termination handler
process.on('SIGINT', () => {
    if(server.listening) {
        server.close((err) => {
            if(err) {
                console.log("Error shutting down on SIGINT: ", err.message);
                process.exit(1);
            } else {
                console.log("Server stopped successfully.");
                process.exit();
            }
        })
    }
});

// TODO(Tom): Create signed cert
/*
const options = {
    key: fs.readFileSync("/srv/www/keys/my-site-key.pem"),
    cert: fs.readFileSync("/srv/www/keys/chain.pem")
};

https.createServer(options, app).listen(8080);
*/

/*
    // Playing around with kafka
    let client = new kafka.KafkaClient();
    let consumer = new kafka.Consumer(client, [{topic: 'quickstart-events'}], {autoCommit: false});
    consumer.on("message", (m) => {console.log(m.key + " - " + m.value);});
*/