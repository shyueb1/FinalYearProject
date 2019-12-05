module.exports.set = function(app) {
    const session = require('express-session');
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    const LocalStrategy = require('passport-local').Strategy;
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const validator = require('validator');
    require('dotenv').config();
    const Database = require('../models/Database');
    const Account = require('../models/Account');
    const Notification = require('../models/Notification');
    const DB = new Database();
    const account = new Account(DB);
    const notify = new Notification(DB);

    /**
     * Middleware that stores the users information in res.locals.
     * @param {Object} req 
     * @param {Object} res 
     * @param {Object} next 
     */
    function getUser(req, res, next) {
        if(req.isAuthenticated()){
            res.locals.user = req.user.rows[0];
        }else{
            res.locals.user = undefined;
        }
        next();
    }

    /**
     * Middleware that gets the chats and their messages/messager that the user is involved in and stores it in res.locals.
     * @param {Object} req 
     * @param {Object} res 
     * @param {Object} next 
     */
    function getChats(req, res, next) {
        if(req.isAuthenticated()){
            account.getUsersChats(req.user.rows[0].user_name).then((usersChats) => {
                //Creating array of the users the person has a conversation with
                var chatPersons = [];
                for(var i = 0; i < usersChats.length; i++){
                    if(usersChats[i].user_one != req.user.rows[0].user_name){
                        chatPersons.push(usersChats[i].user_one);
                    }else{
                        chatPersons.push(usersChats[i].user_two);
                    }
                }
                //Getting the chat messages
                var chatMessagePromises = [];
                var groupedChats = []
                usersChats.forEach((chat) => {
                    var chatMessages = account.getChatMessages(chat.chat_id);
                    chatMessagePromises.push(chatMessages);
                    groupedChats.push([chatMessages]);
                });
                Promise.all(chatMessagePromises).then((allChatMessages) => {
                    var allGroupedChats = [];
                    for(var i = 0; i < groupedChats.length; i++){
                        allGroupedChats.push(groupedChats[i][0]);
                    }
                    Promise.all(allGroupedChats).then((result) => {
                        res.locals.chatPersons = chatPersons;
                        res.locals.chatMessages = result;
                        next();
                    });
                });
            })
            .catch((err) => {
                console.log(err);
                next();
            });
        }else{
            res.locals.chatPersons = '';
            res.locals.chatMessages = '';
            next();
        }
    }

    /**
     * Middleware that gets the users notification and stores it in res.locals.
     * @param {Object} req 
     * @param {Object} res 
     * @param {Object} next 
     */
    function getNotifications(req, res, next){
        if(req.isAuthenticated()){
            account.getUserNotifications(req.user.rows[0].user_name)
            .then((result) => {
                res.locals.notifications = result;
                next();
            })
            .catch((err) => {
                console.log(err);
                res.locals.notifications = undefined;
                next();
            });
        }else{
            next();
        }
    }

    //expression-session setting
    app.use(session({
        secret: "secret",
        resave: false,
        saveUninitialized: false
    }));
    
    //passport settings
    app.use(passport.initialize());
    app.use(passport.session()); //Use passport to manage sessions
    
    //Adding middleware for notifications and chats
    app.use(getUser);
    app.use(getChats);
    app.use(getNotifications);

    //passport local settings
    /**
     * Passport strategy to authenticate users.
     */
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
      },
      (email, submittedPassword, done) => {
        //Checking if Hash matches the password entered
        account.getUserPassword(email)
        .then((result) => {
            if(result.rows.length != 0){
                var storedHashPassword = result.rows[0].user_pass;
                bcrypt.compare(submittedPassword, storedHashPassword, function(err, res) {
                    if(err){
                        console.log(err);
                        return done(null, false, {message:'Invalid password or username.'});
                    }else{
                        if(res){
                            account.getUserByEmailAndPassword(email, storedHashPassword)
                            .then((result)=> {
                                return done(null, result.rows[0]);
                            })
                            .catch((err) => {
                                console.log(err);
                                return done(null, false, {message:'Invalid password or username.'});
                            });
                        }else{
                            return done(null, false, {message:'Invalid password or username.'});
                        }
                    }        
                });
            } else {
                return done(null, false, {message:'Invalid password or username.'});
            }
            
        })
        .catch((err) => {
            return done(null, false, {message:'Invalid password or username.'});
        });
      }));
    
    passport.serializeUser((user, done)=>{
        done(null, user.user_id);
    });
    
    passport.deserializeUser((id, done)=>{
        account.getUserByID(id)
        .then((user)=>{
            done(null, user);
        })
        .catch((err)=>{
            done(new Error(`User with the id ${id} does not exist`));
        })
    });

    //Google login settings
    /**
     * Google OAuth2.0 strategy to authenticate users.
     */
    passport.use(new GoogleStrategy({
        clientID: "232861616267-0nfi4json4hge3ass6g0ug53lco1t9tr.apps.googleusercontent.com",
        clientSecret: "D5Yg3ot5Ck_T3s9drG7Xusqd",
        callbackURL: "http://localhost:3000/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        account.findOrCreate({ googleId: profile.id, name: profile.displayName.trim()}, function (err, user) {
             return done(err, user);
           });
      }
    ));

    /**
     * Endpoint for logging in with Google OAuth 2.0.
     */
    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile'] })
    );
    
    /**
     * Endpoint that is called after logging in with Google.
     */
    app.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
        }
    );

    /**
     * Endpoint for logging in with email and password.
     */
    app.get('/login', function(req, res){
        if(req.isAuthenticated()){
            return res.redirect("/");
        }else{
            var args = {
                message: req.flash('error'),
            };
            return res.render('pages/login', args);
        }
    });

    /**
     * Endpoint for checking if a username-password combination exists.
     */
    app.post('/login', passport.authenticate('local',{failureRedirect: '/login', failureFlash: 'Invalid username or password.'}),(req, res)=>{
        req.session.save(() => {
            res.redirect('/');
        });
    });

    /**
     * Endpoint that ends a session.
     */
    app.get('/logout', (req, res)=>{
        req.logout();
        return res.redirect('/');
    });

    /**
     * Endpoint for registering a new user account.
     */
    app.post('/register', (req, res, next) => {
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.pass;
        
        var validInfo = true;
        //Validate input 
        var info = [firstname, lastname, username];
        for(word in info){
            if(!validator.isAlphanumeric(info[word], 'en-GB')){
                req.flash('message', 'Account failed to make. Validation failed.');
                console.log("Account failed to make. Either name, lastname or username is not alphanumeric.");
                return res.redirect('/register');
            }
        }
        
        //Check if email already in use 
        account.checkEmailAndUsernameAvailability(email, username, (err, result)=>{
            if(err){
                console.log(err);
            }else{
                if(result == undefined || result.rows.length == 0){ //Email is available
                    account.addAccount(firstname, lastname, username, password, email, (result2, error) => {
                        passport.authenticate('local',(err, user)=>{ 
                            req.login(user, function(err) {
                                if (err) { return next(err); }
                                    return res.redirect('/');
                                });
                        })(req,res,next);
                    });
                } else {
                    console.log("Account failed to make.");
                    req.flash('message', 'Account failed to make. Email or username already in use.');
                    return res.redirect('/register');
                }
            }
        });
    });

    /**
     * Endpoint that serves a registration page.
     */
    app.get('/register', function(req, res){
        if(req.isAuthenticated()){
            return res.redirect('/');
        }else{
            var args = {
                message: req.flash('message') 
            };
            return res.render('pages/register', args);
        }
    });

    /**
     * Endpooint that sets all of a users notifications as read.
     */
    app.post('/notifications/readall', (req, res) => {
        if(req.isAuthenticated()){
            notify.setAllNotificationsRead(req.body.user)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.log(err);
                res.send('Not authenticated');
            });
        }else{
            res.send('Not authenticated');
        }
    });
}