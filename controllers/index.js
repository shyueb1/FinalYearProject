const account = require('./account');
const message = require('./message');
const item = require('./item');
const DB = require('./db');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

module.exports.set = function(app) {
    app.use(flash());
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    account.set(app);
    message.set(app);
    item.set(app);

    app.get('/', function(req, res){
        //if user authenticated -> get details
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        //get latest item posts
        var items = DB.query('select * from item order by date_posted desc limit 8;', (err, result)=>{
            if(err){
                console.log(err);
                var args = {
                    'user':userLoggedIn
                };
                return res.render('pages/homepage', args);
            }else{
                var items = result.rows;
                var args = {
                    'user':userLoggedIn,
                    'items': items,
                    'message':req.flash('message')
                };
                return res.render('pages/homepage', args);
            }
        });    
    });
 };