const jwt = require('jsonwebtoken');
const fs = require('fs');
const pubCert = fs.readFileSync(__dirname + '/assets/private/public_key.pem');

function verifyUser(token) {
    let verified = false;
    jwt.verify(token, pubCert, {algorithms: ['RS256']}, (err, decodedTkn) => {
        if(err) {
            console.log("Error in user verification: ", err.message);
        } else {
            verified = true;
        }
    });
    return verified;
}

function getTokenPayload(token) {
    return jwt.decode(token, {json: true});
}

function getJwtFromAuthHeader(header) {
    if(!header || !header.toLowerCase().includes('bearer ')) {
        console.error("Authorization header is not properly formatted.");
        return undefined;
    } else {
        return header.split(' ')[1];
    }
}

module.exports = {getTokenPayload, verifyUser, getJwtFromAuthHeader}