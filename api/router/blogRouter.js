const express = require('express');
const blogRouter = express.Router();
const models = require('../type/models');
const jwt = require('../../jwt');
const persistor = require('../db/persistor');

blogRouter.get('/:id', (req, res) => {

    persistor.getBlog(req.params.id)
    .then((r) => {
        if(r.ok) {
            res.status(200).send(r.data);
        } else {
            res.status(404).send({desc: r.msg});
        }
    })
    .catch((err) => {
        res.status(404).send({desc: err.message});
    });
});

blogRouter.put('/likes/:id', (req, res) => {
    let tokenPayload = jwt.getTokenPayload(jwt.getJwtFromAuthHeader(req.header('Authorization')));
    let tokenUser = tokenPayload.username;

    persistor.likeBlog(tokenUser, req.params.id)
    .then((r) => {
        if(!r.ok) {
            console.log("Blog not liked: ", r.msg);
            res.status(401).send({desc: r.msg});
        } else {
            res.status(200).send({desc: 'Blog liked'});
        }
    })
    .catch((err) => {
        console.log("Error liking: ", err.message);
        res.status(400).send({desc: err.message});
    });
});

// CREATE Blog
blogRouter.post('/', (req, res) => {
    // Fail if author is not same as token user
    if(isUserAuthor(jwt.getJwtFromAuthHeader(req.header('Authorization')), req.body['author'])) {
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

// UPDATE Blog
blogRouter.post('/:id', (req, res) => {
    // Fail if author is not same as token user
    if(isUserAuthor(jwt.getJwtFromAuthHeader(req.header('Authorization')), req.body['author'])) {
        res.sendStatus(401);
    } else {
        // Create new blog entry in storage
        models.Blog.updateOne({_id: req.params.id}, req.body)
        .then((doc) => {
            res.status(200).send({desc: 'Blog updated'});
        })
        .catch((err) => {
            console.log("Error updating blog: ", err);
            res.sendStatus(404);
        });
    }
});

// DELETE Blog
blogRouter.delete('/:id', (req, res) => {
    // Delete blog with given id
    res.send('Deleting given blog post...');
});

function isUserAuthor(token, author) {
    let tokenUser = jwt.getTokenPayload(token)['user'];
    if(author != tokenUser) {
        console.error("Author and token user mismatch: ", author, ", ", tokenUser);
        return false;
    }
    return true;
}

module.exports = blogRouter;