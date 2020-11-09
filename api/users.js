const express = require('express');
const mongoose = require('mongoose');
const models = require('./db/models');
const usersRouter = express.Router();

// --- User actions
usersRouter.get('/', (req, res) => {
    //TODO(Tom): Should be restricted to Admins
    models.User.find()
    .then((docs) => {
        res.send(docs);
    })
    .catch((err) => {
        console.err("Problem getting users: ", err.reason);
        res.sendStatus(404);
    });
});

usersRouter.get('/:id', (req, res) => {
    models.User.find({username: req.params.id})
    .then((docs) => {
        // >1, fail
        // 0, fail
        // 1, return
        if(docs.length > 1 || docs.length === 0)
        {
            res.sendStatus(404);
        } else {
            res.send(docs);
        }
    })
    .catch((err) => {
        console.log("user err: ", err);
        res.sendStatus(404);
    });
});

usersRouter.delete('/:id', (req, res) => {
    //TODO(Tom): Verify requestor is the one to delete or they are Admin
});

module.exports = usersRouter;