module.exports.set = function(app) {
    var DB = require('./db');
    const session = require('express-session');
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const validator = require('validator');

    //In the future use this so I don't need to pass in user in args everytime
    // function userView(req, res, next) {
    //     res.locals.user = req.user;
    //     next();
    // }

    //expression-session setting
    app.use(session({
        secret: "secret",
        resave: false,
        saveUninitialized: false
    }));
    
    //passport settings
    app.use(passport.initialize());
    app.use(passport.session()); //Use passport to manage sessions
    // app.use(userView); Use in future so no need to pass user in args to render

    //passport local settings
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
      },
      (username, password, done) => {
        //Login: compare db hash to password
        hashe = DB.query("SELECT user_pass FROM users WHERE user_email= $1;", [username]);
        hashe.then((result) => {
            if(result.rows.length != 0){
                bcrypt.compare(password, result.rows[0].user_pass, function(err, res) {
                    if(err){
                        console.log(err);
                    }else{
                        if(res){
                            return DB.query("SELECT user_id, user_name, user_email, user_role " +
                            "FROM users " +
                            "WHERE user_email=$1 AND user_pass=$2", [username, result.rows[0].user_pass])
                            .then((result)=> {
                            return done(null, result.rows[0]);
                            });
                        }else{
                            return done(null, false, {message:'Wrong user name or password'});
                        }
                    }        
                });
            } else {
                return done(null, false, {message:'Wrong user name or password'});
            }
            
        });
      }));
    
    passport.serializeUser((user, done)=>{
        done(null, user.user_id);
    });
    
    passport.deserializeUser((id, done)=>{
        DB.query("SELECT user_id, user_name, user_email, user_role FROM users " +
                "WHERE user_id = $1", [id])
        .then((user)=>{
            done(null, user);
        })
        .catch((err)=>{
            done(new Error(`User with the id ${id} does not exist`));
        })
    });

    app.get('/login', function(req, res){
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            return res.redirect("/");
        }
        var args = {
            message: req.flash('error')
        };
        return res.render('pages/login', args);
    });

    app.post('/login', passport.authenticate('local',{failureRedirect: '/login', failureFlash: 'Invalid username or password.'}),(req, res)=>{
        req.session.save(() => {
            res.redirect('/');
        });
    });

    app.get('/logout', (req, res)=>{
        req.logout();
        return res.redirect('/');
    });

    app.post('/register', (req, res, next) => {
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.pass;
        
        var validInfo = true;
        //Validate input 
        var info = [firstname, lastname, username, password];
        for(word in info){
            if(!validator.isAlphanumeric(info[word], 'en-GB')){
                req.flash('message', 'Account failed to make. Validation failed.');
                return console.log("Account failed to make. Validation failed.");
            }
        }
        
        //Check if email already in use 
        checkEmailAvailability(email, (result)=>{
            // console.log(result);
            if(result == undefined || result.rows.length == 0){ //Email is available
                addAccount(firstname, lastname, username, password, email, (result2, error) => {
                    passport.authenticate('local',(err, user)=>{ 
                        req.login(user, function(err) {
                            if (err) { return next(err); }
                            return res.redirect('/');
                            });
                    })(req,res,next);
                });
            } else {
                return console.log("account failed to make");
            }
        });
        
    });
    

    function checkEmailAvailability( email, callback){
        var result = DB.query("select * from users where user_email=$1", [email], (err, result) => {
            if(err){
                console.log(err);
            }else{
                callback(result);
            }
        });
    }

    function addAccount(firstname, lastname, username, password, email, callback){
        //Create hash and store in db
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    DB.query("insert into users(first_name, last_name, user_name, user_pass, user_email, user_role) values ($1, $2, $3, $4, $5, $6);",[firstname, lastname, username, hash, email, 'customer'], (err, result) => {
                        if(err){
                            console.log(err);
                            callback(err);
                        }else{
                            console.log("Inserted account into users table.");
                            callback(undefined);
                        } 
                    });
                });
            });
    }

    app.get('/register', function(req, res){
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        var args = {
            'user':userLoggedIn,
            message: req.flash('info')+" "+req.flash('message') 
        };
        return res.render('pages/register', args);
    });
}