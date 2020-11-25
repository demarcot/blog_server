const express = require('express');
const persistor = require('../db/persistor');
const models = require('./../type/models');
const userRouter = express.Router();

userRouter.get('/', (req, res) => {
    //TODO(Tom): Should be restricted to Admins
});

userRouter.get('/:id', (req, res) => {
    persistor.getUser(req.params.id)
    .then((r) => {
        if(r.ok) {
            res.send(r.data);
        } else {
            res.status(404).send({desc: r.msg});
        }
    })
    .catch((err) => {
        res.status(404).send({desc: err.message});
    });
});

userRouter.delete('/:id', (req, res) => {
    //TODO(Tom): Verify requestor is the one to delete or they are Admin
});

module.exports = userRouter;