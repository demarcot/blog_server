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

blogRouter.post('/', (req, res) => {
    if(!isUserAuthor(jwt.getJwtFromAuthHeader(req.header('Authorization')), req.body['author'])) {
        res.sendStatus(401);
    } else {
        persistor.createBlog(req.body)
        .then((r) => {
            if(r.ok) {
                res.status(200).send({desc: r.msg});
            } else {
                res.status(404).send({desc: r.msg});
            }
        })
        .catch((err) => {
            console.log("Error creating blog: ", err.message);
            res.status(404).send({desc: err.msg});
        });
    }
});

// UPDATE Blog
blogRouter.post('/:id', (req, res) => {
    // Fail if author is not same as token user
    if(!isUserAuthor(jwt.getJwtFromAuthHeader(req.header('Authorization')), req.body['author'])) {
        res.sendStatus(401);
    } else {
        persistor.updateBlog(req.params.id, req.body)
        .then((r) => {
            if(r.ok) {
                res.status(200).send({desc: r.msg});
            } else {
                res.status(404).send({desc: r.msg});
            } 
        })
        .catch((err) => {
            console.log("Error updating blog: ", err.message);
            res.status(404).send({desc: err.msg});
        });
    }
});

// DELETE Blog
blogRouter.delete('/:id', (req, res) => {
    persistor.deleteBlog(req.params.id, jwt.getTokenPayload(jwt.getJwtFromAuthHeader(req.header('Authorization'))).username)
    .then((r) => {
        if(r.ok) {
            res.status(200).send({desc: r.msg});
        } else {
            res.status(404).send({desc: r.msg});
        } 
    })
    .catch((err) => {
        console.log("Error deleting blog: ", err.message);
        res.status(404).send({desc: err.msg});
    });
});

function isUserAuthor(token, author) {
    let tokenUser = jwt.getTokenPayload(token)['username'];
    if(author != tokenUser) {
        console.error("Author and token user mismatch: ", author, ", ", tokenUser);
        return false;
    }
    return true;
}

module.exports = blogRouter;