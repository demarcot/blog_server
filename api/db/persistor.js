const mongoose = require('mongoose');
const models = require('../type/models');

async function getUser(id) {
    const s = await mongoose.startSession();
    let r = {
        ok: false,
        msg: "Unknown",
        data: null
    };

    try {
        const txnResults = await s.withTransaction(async () => {
            let u = await models.User.find({username: id});
            if(u.length > 1 || u.length === 0) {
                r.msg = "Duplicate or nonexistant user."
                r.ok = false;
                return;
            } else {
                r.msg = "User found."
                r.data = u; // Do I need to say u[0]?
                r.ok = true;
            }
            return true;
        });

        if(txnResults) {
        } else {
            console.log("User GET blocked: ", r.msg);
        }
    } catch (err) {
        r.msg = err.message;
    } finally {
        s.endSession();
    }
    return r;
}

async function getBlog(id) {
    const s = await mongoose.startSession();
    let r = {
        ok: false,
        msg: "Unknown",
        data: null
    };

    try {
        const txnResults = await s.withTransaction(async () => {
            let b = await models.Blog.find({_id: id});
            if(b.length > 1 || b.length === 0) {
                r.msg = "Duplicate or nonexistant blog."
                r.ok = false;
                return;
            } else {
                r.msg = "Blog found."
                r.data = b; // Do I need to say b[0]?
                r.ok = true;
            }
            return true;
        });

        if(txnResults) {
        } else {
            console.log("Blog GET blocked: ", r.msg);
        }
    } catch (err) {
        r.msg = err.message;
    } finally {
        s.endSession();
    }
    return r;
}

async function likeBlog(user, blogId) {
    //Start session/Start session
    const s = await mongoose.startSession();
    let r = {
        ok: false,
        msg: "Unknown"
    };

    try {
        const txnResults = await s.withTransaction(async () => {
            // If user hasn't liked blogId, add blogId to user's likes
            const u = await models.User.findOne({username: user, likes: blogId}, null, {session: s}); 
            if(u) {
                await s.abortTransaction();
                r.ok = false;
                r.msg = "Aborted, blog already liked.";
                return;
            }
            await models.User.updateOne({username: user}, {$push: {likes: blogId}}, {session: s});
            await models.Blog.updateOne({_id: blogId}, {$inc: {likes: 1}}, {session: s});
            return true;
        });

        if(txnResults) {
            r.ok = true;
            r.msg = "Blog liked successfully.";
        } else {
            console.log("Blog blocked from liking: ", r.msg);
        }
    } catch(err) {
        console.log("Error stopped blog liking: ", err.message);
        r.ok = false;
        r.msg = err.message;
    } finally {
        s.endSession();
    }
    return r;
}

async function createBlog(blog) {
    const s = await mongoose.startSession();
    let r = {
        ok: false,
        msg: "Unknown"
    };

    try {
        const txnResults = await s.withTransaction(async () => {
            await models.Blog.create([blog], {session: s});
            return true;
        });

        if(txnResults) {
            r.ok = true;
            r.msg = "Blog created.";
        } else {
            r.msg = "Blog blocked from Create."
        }
    } catch (err) {
        r.msg = "Blog Create failed: " + err.message;
    } finally {
        s.endSession();
    }

    return r;
}

async function updateBlog(id, blog) {
    const s = await mongoose.startSession();
    let r = {
        ok: false,
        msg: "Unknown"
    };

    try {
        const txnResults = await s.withTransaction(async () => {
            await models.Blog.updateOne({_id: id}, blog, {session: s});
            return true;
        });

        if(txnResults) {
            r.ok = true;
            r.msg = "Blog updated successfully.";
        } else {
            r.msg = "Blog not updated.";
        }
    } catch (err) {
        console.log("Error updating blog: ", err.message);
        r.msg = "Blog Update failed: " + err.message;
    } finally {
        s.endSession();
    }

    return r;
}

async function deleteBlog(id, username) {
    const s = await mongoose.startSession();
    let r = {
        ok: false,
        msg: "Unknown"
    };

    try {
        const txnResults = await s.withTransaction(async () => {
            await models.Blog.deleteOne({_id: id, author: username}, {session: s});
            return true;
        });

        if(txnResults) {
            r.ok = true;
            r.msg = "Blog deleted successfully."
        } else {
            r.msg = "Blog not deleted";
        }
    } catch (err) {
        console.log("Error deleting blog: ", err.message);
        r.msg = "Blog Delete failed: " + err.message;
    } finally {
        s.endSession();
    }

    return r;
}

const persistor = {
    getUser,

    getBlog,
    likeBlog,
    createBlog,
    updateBlog,
    deleteBlog,
};

module.exports = persistor;