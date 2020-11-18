const express = require('express');
const blogsRouter = express.Router();
const models = require('./db/models');
const jwt = require('./../jwt');

// --- Blog actions


blogsRouter.get('/:id', (req, res) => {
    let resp = {};
    models.Blog.findById(req.params.id).exec((err, post) => {
        if(err)
        {
            console.log("Error finding blog: ", err);
            resp.error = err;
            res.send(resp);
        } else {
            resp = post;
            res.send(resp);
        }
    });
});

blogsRouter.put('/likes/:id', (req, res) => {
    let tokenPayload = jwt.getTokenPayload(jwt.getJwtFromAuthHeader(req.header('Authorization')));
    let tokenUser = tokenPayload.username;
    models.User.findOne({username: tokenUser}).then((user) => {
        if(user['likes'].includes(req.params.id)) {
            console.log("Blog already liked...");
            throw new Error("Already liked...");
        }
        
        return models.User.updateOne({username: tokenUser}, {$push: {likes: req.params.id}}).exec();
    }).then(() => {
        return models.Blog.updateOne({_id: req.params.id}, {$inc: {likes: 1}}).exec();
    }).then(() => {
        console.log("Blog liked...");
        res.status(200).send({desc: 'Blog liked'});
    }).catch((err) => {
        console.log("Error liking: ", err.message);
        res.status(400).send({desc: err.message});
    });
});

blogsRouter.post('/', (req, res) => {
    // Fail if author is not same as token user
    let tokenUser = jwt.getTokenPayload(jwt.getJwtFromAuthHeader(req.header('Authorization')))['user'];
    if(req.body['author'] != tokenUser) {
        console.error("Author and token user mismatch: ", req.body['author'], ", ", tokenUser);
        res.sendStatus(401);
    } else {   
        // Create new blog entry in storage
        models.Blog.create(req.body)
        .then((doc) => {
            res.status(200).send({desc: 'Blog submitted'});
        })
        .catch((err) => {
            console.log("Error creating blog: ", err);
            res.sendStatus(404);
        });   
    }
});

blogsRouter.delete('/:id', (req, res) => {
    // Delete blog with given id
    res.send('Deleting given blog post...');
});

module.exports = blogsRouter;