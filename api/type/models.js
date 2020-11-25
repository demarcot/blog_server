const mongoose = require('mongoose');
const mongoUrl = require('../../assets/private/endpoints').mongoUrl;


const blogSchema = new mongoose.Schema({
    o_id: mongoose.Schema.Types.ObjectId,
    title: String,
    body: String,
    author: String,
    likes: Number
});

// Adds a virtual field on output for _id to be id
blogSchema.set('toJSON', {
    virtuals: true
});

const userSchema = new mongoose.Schema({
    username: String,
    role: String,
    likes: Array,
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