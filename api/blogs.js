const express = require('express');
const blogsRouter = express.Router();
const models = require('./db/models');

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

blogsRouter.post('/', (req, res) => {
    // Create new blog entry in storage
    models.Blog.create(req.body)
    .then((doc) => {
        res.send('Blog submitted');
    })
    .catch((err) => {
        console.log("Error creating blog: ", err);
        res.sendStatus(404);
    });
    
    
});

blogsRouter.delete('/:id', (req, res) => {
    // Delete blog with given id
    res.send('Deleting given blog post...');
});

module.exports = blogsRouter;