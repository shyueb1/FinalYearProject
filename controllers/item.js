module.exports.set = function(app) {
    const DB = require('./db');
    const imagestore = require('../services/imagestore').upload;
    const s3 = require('../services/imagestore').s3;
    const awsURL = 'https://test123-njs.s3.eu-west-2.amazonaws.com/';

    app.get('/listitem', (req, res) => {
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        var args = {
            'user': userLoggedIn,
            'message': req.flash('message')
        };
        return res.render('pages/listitem', args);
    });
    
    app.post('/listitem', imagestore.array('image', 3), (req, res) => {
        var itemname = req.body.itemname;
        var category = req.body.category;
        var images = req.files;
        var description = req.body.description;
        var location = req.body.location;
        var value = req.body.value;
        var userListing = req.user.rows[0].user_name;
        console.log(images);
        storeItem(userListing, itemname, location, value, description, category, images, (err, result)=>{
            if(err){
                console.log(err);
                req.flash('message', 'Failed to post item.');
                return res.redirect("/listitem");
            }else{
                req.flash('message', 'Item has been posted.');
                return res.redirect("/listitem");
            }
        });
    });

    function storeItem(user, itemname, location, value, description, category, images, callback){
        var date =  new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        DB.query("INSERT INTO item(user_posted, item_name, item_location, est_cost, description, category, date_posted, sold_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING item_id;",[user, itemname, location, value, description, category, timestamp, 'false'], (err, result) => {
            if(err){
               console.log(err);
               return;
            }else{
                var itemID = result.rows[0].item_id;
                storeImg(images, itemID);
                callback(err, result);
                console.log("Inserted item into item table.");
                return;
            } 
        });
    };

    function getItem(itemID, callback){
        DB.query("SELECT * FROM item where item_id=($1);", [itemID], (err, result)=>{ 
            return callback(err, result);
        });
    };

    app.get('/youritemposts', (req, res) => {
        //if user authenticated -> get details
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        //get latest item posts
        var items = DB.query('SELECT * FROM item WHERE user_posted=($1) ORDER BY date_posted DESC LIMIT 8;',[userLoggedIn], (err, result)=>{
            if(err){
                console.log(err);
                var args = {
                    'user':userLoggedIn,
                    'items': ''
                };
                return res.render('pages/youritems', args);
            }else{
                var items = result.rows;
                var args = {
                    'user':userLoggedIn,
                    'items': items,
                    'message':req.flash('message')
                };
                return res.render('pages/youritems', args);
            }
        }); 
    });

    app.get('/edit/:id', (req, res) => {
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        //Get item details to prefill form
        DB.query('SELECT * FROM item WHERE item_id=($1);', [req.params.id], (err, result)=>{
            console.log(result.rows[0]);
            args = {
                item:result.rows[0],
                user : userLoggedIn,
                'message':req.flash('message')
            };
            return res.render("pages/edititem", args);
        });
    });

    app.post('/edit/:id', (req, res) => {
        var itemname = req.body.itemname;
        var category = req.body.category;
        var image = req.body.image;
        var description = req.body.description;
        var location = req.body.location;
        var value = req.body.value;
        var userListing = req.user.rows[0].user_name;
    
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        //Delete old item
        DB.query('DELETE FROM item WHERE item_id=($1);', [req.params.id], (err, result)=>{
            if(err){
                console.log(err);
            }else{
                storeItem(userListing, itemname, location, value, description, category, image, (err, result)=>{
                    req.flash('message', 'Item has been updated.');
                    return res.redirect("/youritemposts");
                });
            }
        });
    });

    app.get('/delete/:id', (req, res) => {
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        DB.query("DELETE FROM item where item_id=($1);", [req.params.id], (err, result)=>{ 
            if(err){
                console.log(err);
                req.flash('message', "Couldn't find item.");
                return res.redirect('/youritemposts');
            }else{
                return res.redirect('/youritemposts');
            }
        });
    });

    app.get('/makeoffer/:id', (req, res) => {
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
        }
        DB.query("SELECT * FROM item where user_posted=$1;", [userLoggedIn], (err1, result1) => {
            if(err1){
                console.log(err1);
                res.redirect("/");
            } else {
                DB.query("SELECT * FROM item where item_id=($1);", [req.params.id], (err2, result2)=>{ 
                    if(err2){
                        console.log(err2);
                        req.flash('message', "Couldn't find item.");
                        return res.redirect('/', );
                    }else{
                        getImg(req.params.id, (err, result) => {
                            if(err){
                                console.log(err);
                                args = {
                                    item: result2.rows[0],
                                    youritem: result1.rows,
                                    user : userLoggedIn,
                                    images : result.rows,
                                    'message':req.flash('message')
                                };
                                return res.render('pages/itempage', args);
                            }else{
                                console.log(result);
                                args = {
                                    item: result2.rows[0],
                                    youritem: result1.rows,
                                    user : userLoggedIn,
                                    images : result.rows,
                                    'message':req.flash('message')
                                };
                                return res.render('pages/itempage', args);
                            }
                        });
                    }
                });
            }
        });
    });

    app.post('/makeoffer/:id', (req, res) => {
        
    });

        
    app.get('/test/imgupload', (req, res) => {
        var args = {message: ''};
        return res.render('pages/test/imgupload', args);
    });
    
    app.post('/test/imgupload', imagestore.array('image', 3), (req, res) => {
        // console.log(req.files);
        storeImg(req.files, 1);
        res.redirect('/test/imgupload');
    });

    function storeImg(keys, itemID){
        keys.forEach(element => {
            DB.query('INSERT INTO item_images(key, item) VALUES ($1, $2);', [element.key, itemID], (err, result) => {
                if(err){
                    console.log(err);
                    return;
                } else {
                    console.log(result);
                    return;
                }
            });
        });
    }

    function getImg(itemID, callback){
        DB.query('SELECT key FROM item_images WHERE item=($1);', [itemID], (err, result) => {
            callback(err, result);
        });
    }
    // (()=>{
    //     getImg(24, (err, result) =>{
            
    //         console.log(result);
    //     });
    // })();
}