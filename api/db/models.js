const mongoose = require('mongoose');
const roles = require('./../roles');
const mongoUrl = require('./../../assets/private/endpoints').mongoUrl;

const blogSchema = new mongoose.Schema({
    title: String,
    post: String,
    author: String,
    likes: Number
});

const userSchema = new mongoose.Schema({
    username: String,
    role: String,
    hash: String,
    salt: String
});

const blogModel = mongoose.model('Blogs', blogSchema, 'blogs');
const userModel = mongoose.model('Users', userSchema, 'users');

mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true})
.catch((error) => {
    console.error("There was a problem connecting to the DB: ", error);
});

module.exports = {Blog: blogModel, User: userModel};