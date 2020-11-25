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
    // TODO(Tom): If logged in go to home, else go to login page
    res.sendStatus(404);
});
// -- END Public facing routes --

// Verification middleware
//TODO(Tom): Stick user and role in req after verification?
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

function errHandler(err, req, res, next) {
    console.log("Handling err: ", err.message);
    res.status(400).send(err.message);
}

// TODO(Tom): Listen for SIGTERM and gracefully kill server
app.listen(8001, () => {        
    console.log('Listening on 8001...');
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