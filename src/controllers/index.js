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
    
    // app.get("/chat", (req, res) => {
    //     args = {
    //         message: undefined
    //     };
    //     return res.render("pages/test/testwebsocket", args);
    // });
    
    // app.get("/msges/:id", (req, res) => {
    //     DB.query('SELECT * FROM msg WHERE id > ($1);', [req.params.id], (err, result) => {
    //         if(err){
    //             console.log(err);
    //         }else{
    //             res.send(result.rows);
    //         }
    //     });
    // });

    // app.post('/msgs', (req, res) => {
    //     DB.query('INSERT INTO msg(name, message) VALUES($1, $2);',[req.body.name, req.body.message] ,(err, result) => {
    //         if(err){
    //             console.log(err);
    //             res.sendStatus(500);
    //         }else{
    //             io.emit('message', req.body);
    //             res.sendStatus(200);
    //         }
    //     });

    // });

    app.get('/', function(req, res){
        //if user authenticated -> get details
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0];
        }
        //get latest item posts
        var itemsAndImages = DB.query('select distinct on (item_id) * from (select * from item order by date_posted desc) as items inner join item_images on items.item_id = item_images.item;', (err, result)=>{
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