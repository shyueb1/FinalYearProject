const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Database = require('../models/Database');
const DB = new Database();
const user = new Account(DB);

const auth = (req, res, next) => {
    //verify token
    const token = req.headers.authorization;
    try {
        let decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.isAuthenticated = true; 
        user.getUserByEmail(decoded.email)
        .then((user) => {
            req.user = {
                'username': user.user_name,
                'email': decoded.email,
                'id': user.user_id
            }
            next();
        })
        .catch((err) => {
            console.log(err);
            req.isAuthenticated = false;
            req.user = null;
            next();
        })
    } catch(err) {
        //token invalid
        req.isAuthenticated = false;
        req.user = null;
        next();
    }  
}

module.exports = auth;