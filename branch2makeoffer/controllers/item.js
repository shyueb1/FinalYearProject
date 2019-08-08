module.exports.set = function(app) {
    const DB = require('./db');
    const imagestore = require('../services/imagestore').upload;
    const s3 = require('../services/imagestore').s3;
    const awsURL = 'https://test123-njs.s3.eu-west-2.amazonaws.com/';

    app.get('/listitem', (req, res) => {
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0];
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

    app.post("/search", (req, res) => {
        var query = req.body.search;
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0];
        }
        console.log(query);
        getItemWithSimilarName(query).then((result) => {
            console.log(result);
            var items = result.rows;
            var args = {
                'user':userLoggedIn,
                'items': items,
                'message':req.flash('message')
            };
            return res.render('pages/homepage', args);
        });
    });

    function getItemWithSimilarName(itemName){
        var promise = new Promise((resolve, reject) => {
            DB.query(`SELECT * FROM (SELECT distinct on (item_id) * FROM item where LOWER(item_name) ~ ($1)) as x inner join item_images on item_id=item;`, [itemName.toLowerCase()], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

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
            userLoggedIn = req.user.rows[0];
            //get latest item posts
            var items = DB.query('SELECT * FROM item WHERE user_posted=($1) ORDER BY date_posted DESC LIMIT 8;',[userLoggedIn.user_name], (err, result)=>{
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
        }
    });
    
    app.get('/edit/:id', (req, res) => {
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0];
        }
        //Get item details to prefill form
        DB.query('SELECT * FROM item WHERE item_id=($1);', [req.params.id], (err, result)=>{
            // console.log(result.rows[0]);
            args = {
                item:result.rows[0],
                user : userLoggedIn,
                'message':req.flash('message')
            };
            return res.render("pages/edititem", args);
        });
    });

    app.post('/edit/:id', (req, res) => {
        var itemID = req.params.id;
        var itemname = req.body.itemname;
        var category = req.body.category;
        var description = req.body.description;
        var location = req.body.location;
        var value = req.body.value;
        var userListing = req.user.rows[0].user_name;
    
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
            DB.query(`UPDATE item
                      SET 
                        item_name = ($2),
                        category = ($3),
                        description = ($4),
                        item_location = ($5),
                        est_cost = ($6),
                        user_posted = ($7)
                      WHERE item_id = ($1)`, [itemID, itemname, category, description, location, value, userListing], (err, result) => {
                        if(err){
                            console.log(err);
                            req.flash('message', 'Item has been failed to update.');
                            return res.redirect("/youritemposts");
                        }else{
                            console.log(result);
                            req.flash('message', 'Item has been updated.');
                            return res.redirect("/youritemposts");
                        }
                      });
        }
    });

    app.get('/delete/:id', (req, res) => {
        var userLoggedIn = undefined;
        if(req.isAuthenticated()){
            userLoggedIn = req.user.rows[0].user_name;
            DB.query("DELETE FROM item where item_id=($1);", [req.params.id], (err, result)=>{ 
                if(err){
                    console.log(err);
                    req.flash('message', "Couldn't find item.");
                    return res.redirect('/youritemposts');
                }else{
                    req.flash('message', "Item successfully deleted.");
                    return res.redirect('/youritemposts');
                }
            });
        }
    });

    app.get('/makeoffer/:id', (req, res) => {
        //Get item info for item user is buying
        DB.query("SELECT * FROM item where item_id=($1);", [req.params.id], (err1, result1)=>{ 
            if(err1){
                console.log(err1);
                req.flash('message', "Couldn't find item.");
                return res.redirect('/', );
            }else{
                //get images for item user is buying
                getImg(req.params.id, (err2, result2) => {
                    if(err2){
                        console.log(err2);
                        req.flash('message', "Item has no images.");
                        return res.redirect('/', );
                    }else{
                        
                        if(req.isAuthenticated()){
                            //Get users items and associated images
                            userLoggedInUsername = req.user.rows[0].user_name;
                            userLoggedIn = req.user.rows[0];
                            DB.query("SELECT * FROM item WHERE user_posted=($1);", [userLoggedInUsername], (err3, result3) => {
                                if(err3){
                                    console.log(err);
                                    req.flash('message', "User has no items to offer.");
                                    return res.redirect("/");
                                }else{
                                    var userLoggedInItemsImages = [];
                                    var userLoggedInItems = result3.rows;
                                    var imagePromises = [];
                                    userLoggedInItems.forEach((item) => {
                                        var itemID = item.item_id;
                                        var p = new Promise((resolve, reject) => {
                                            getImg(itemID, (err4, result4) => {
                                                if(err4){
                                                    console.log(err4);
                                                    reject();
                                                }else{
                                                    userLoggedInItemsImages.push(result4.rows[0]);
                                                    resolve(result4.rows[0]);
                                                }
                                            });     
                                        }); 
                                        imagePromises.push(p);
                                    });
                                    Promise.all(imagePromises).then((userLoggedInItemsImages) => {
                                        args = {
                                            'user': userLoggedIn,
                                            'message': req.flash('message'),
                                            'images': result2.rows,
                                            'item': result1.rows[0],
                                            'userLoggedInItems': userLoggedInItems,
                                            'userLoggedInItemsImages': userLoggedInItemsImages
                                        };
                                        return res.render("pages/itempage", args);
                                    });
                                    
                                }
                            });
                        }else{
                            args = {
                                'user': undefined,
                                'message': req.flash('message'),
                                'images': result2.rows,
                                'item': result1.rows[0],
                            };
                            return res.render("pages/itempage", args);
                        }
                    }
                });
            }
        });
    });

    app.post('/makeoffer/:id', (req, res) => {
        console.log(req.body+ "\n "+req.user.rows[0].user_name);
        var moneyOffered = req.body.moneyOffered;
        var itemsOffered = req.body.itemsOffered;
        var offerMessage = req.body.offerMessage;
        var itemTradingFor = req.params.id;
        var userPostedOffer = req.user.rows[0].user_id;
        var dateOfOffer = getTimestamp();
        //create tradeoffer returning tradeofferID
        DB.query("INSERT INTO tradeoffer(item_trading_for, money_offered, offer_message, date_of_offer, user_posted_trade) VALUES ($1, $2, $3, $4, $5) RETURNING tradeoffer_id;",[itemTradingFor, moneyOffered, offerMessage, dateOfOffer, userPostedOffer] , (err, result) => {
            if(err){
                console.log(err);
                req.flash('message', 'Failed to add tradeoffer.');
                return res.redirect("/makeoffer/"+req.params.id);
            }else{
                var tradeofferID = result.rows[0].tradeoffer_id;
                //add each users items to item in trade
                var addingOffer = new Promise((resolve, reject) => {
                    if(typeof itemsOffered == "string" && itemsOffered != undefined){
                        DB.query("INSERT INTO item_in_trade(item_being_traded, part_of_offer) VALUES ($1, $2);", [itemsOffered, tradeofferID ], (err2, result2) => {
                            if(err2){
                                console.log(err2);
                                req.flash('message', 'Failed to add items to offer.');
                                reject();
                            }else{
                                resolve();
                            }
                        });
                    }else if(itemsOffered != undefined){
                        itemsOffered.forEach((item, index, array) => {
                            if (index === array.length - 1){
                                resolve();
                            }
                            DB.query("INSERT INTO item_in_trade(item_being_traded, part_of_offer) VALUES ($1, $2);", [item, tradeofferID ], (err2, result2) => {
                                if(err2){
                                    console.log(err2);
                                    req.flash('message', 'Failed to add items to offer.');
                                    reject();
                                }
                            });
                        });
                    }else{
                        resolve();
                    }
                });
                addingOffer.then(() => {
                    req.flash('message', 'Successfully added your offer.');
                    return res.redirect("/makeoffer/"+req.params.id);
                });
            }
        });
    });

    function storeImg(keys, itemID){
        keys.forEach(element => {
            DB.query('INSERT INTO item_images(key, item) VALUES ($1, $2);', [element.key, itemID], (err, result) => {
                if(err){
                    console.log(err);
                    return;
                } else {
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

    app.get("/viewoffers/:id", (req, res) => {
        //Get offers for item with id = req.params.id
        var itemID = req.params.id;
        getItemsGroupedByTradeOffer(itemID, (err, result) => {
            if(err){
                console.log(err);
            }else{
                //For each item in trade offer get the image and push to array
                // once all items done, push array to collective array
                
                var imagesPromiseArr = [];
                result.forEach(tradeOffer => {
                    tradeOffer.forEach(item => {
                        var p = new Promise((resolve, reject) => {
                            getImg(item.item, (err2, result2) => {
                                if(err2){
                                    console.log(err2);
                                    reject(err2);
                                }else{
                                    resolve([result2.rows,item.item]);
                                }
                            });
                        });
                        imagesPromiseArr.push(p);
                    });
                });
                Promise.all(imagesPromiseArr).then((values) => {
                    getItem(itemID, (err3, result1) => {
                        if(err3){
                            console.log(err3);
                            req.flash("message", "Failed to get item info.");
                            return res.redirect("/");
                        }else{
                            args = {
                                message: req.flash("message"),
                                user: req.user.rows[0],
                                tradeOffers: result,
                                "images": values,
                                "item":result1.rows[0]
                            }
                            res.render("pages/viewtradeoffers", args);
                        }
                    });
                });
            }
        });
    });

    app.get("/declineoffer/:id", (req, res) => {
        var offerID = req.params.id;
        if(req.isAuthenticated()){
            DB.query('UPDATE tradeoffer SET accepted_offer = false WHERE tradeoffer_id = ($1) RETURNING item_trading_for;', [offerID], (err, result) => {
                if(err){
                    console.log(err);
                }else{
                    var itemTradingFor = result.rows[0].item_trading_for;
                    console.log(itemTradingFor);
                    req.flash("message", "Offer has been declined.");
                    return res.redirect("/viewoffers/"+itemTradingFor);
                }
            });
        }
    });

    app.get("/acceptoffer/:id", (req, res) => {
        var offerID = req.params.id;
        if(req.isAuthenticated()){
            DB.query('UPDATE tradeoffer SET accepted_offer = true WHERE tradeoffer_id = ($1) RETURNING item_trading_for;', [offerID], (err, result) => {
                if(err){
                    console.log(err);
                    req.flash("message", "An error has occured, item not accepted.");
                    return res.redirect("/viewoffers");
                }else{
                    var itemTradingFor = result.rows[0].item_trading_for;
                    // setItemsAsSold(offerID);
                    req.flash("message", "Offer has been accepted.");
                    return res.redirect("/viewoffers/"+itemTradingFor);
                }
            });
        }else{

        }
    });

    app.get("/youroffers", (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_id;
            var offerTypes = [];
            var gettingTradeOffers = getUsersTradeOffer(user);
            gettingTradeOffers.then((tradeOffers)=>{
                tradeOffers.forEach(offer => {
                    //Check if cash only get cash offered
                    var getOfferType = isCashOfferOnly(offer.tradeoffer_id);
                    offerTypes.push(getOfferType);
                });
                Promise.all(offerTypes).then((result) => {
                    var complete = [];
                    // console.log(result);
        
                    result.forEach(offer => {
                        // console.log(offer);
                            // complete.push(retrieveItemOffer(offer.part_of_offer));
                            // console.log(offer)
                        var p = new Promise((resolve, reject)=>{
                            if(offer.length == 0){
                                //is a cash only deal
                                resolve('cashOnly');
                            }else{
                                retrieveItemOffer(offer[0].part_of_offer).then(result => {
                                    resolve(result);
                                });
                            }
                        })
                        complete.push(p);
                    });
                    Promise.all(complete).then((result)=>{
                        var yourOffersFormatted = [];
                        for(var i = 0; i < result.length; i++){
                            if(result[i] == 'cashOnly'){
                                yourOffersFormatted.push([result[i], tradeOffers[i]]);
                            }else{
                                var arr = [];
                                arr.push('cashAndItems');
                                arr.push(tradeOffers[i]);
                                result[i].rows.forEach(row => {
                                    arr.push(row);
                                });
                                yourOffersFormatted.push(arr);
                            }
                        }
                        args = {
                            'user': req.user.rows[0],
                            'message': req.flash('message'),
                            'yourOffers': yourOffersFormatted
                        }
                        return res.render("pages/youroffers", args);
                    });
                            
                });
            });
        }
    });

    app.get("/deleteoffer/:id", (req, res) => {
        var offerID = req.params.id;
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            var deletingOffer = deleteOffer(offerID);
            deletingOffer.then(() => {
                req.flash('message', 'Your offer has been successfully removed.');
                res.redirect("/youroffers");
            }).catch((err)=>{
                req.flash('message', 'Your offer has failed to be deleted.');
                res.redirect("/youroffers");
            });
            
        }
    });
    
    function deleteOffer(offerID){
        var promise = new Promise((resolve, reject) => {
            DB.query(`DELETE FROM tradeoffer where tradeoffer_id=($1);`, [offerID], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    function retrieveItemOffer(tradeoffer){
        // console.log(tradeoffer);
        var promise = new Promise((resolve, reject) => {
            DB.query(`SELECT distinct on (item_being_traded) item_being_traded, key FROM item_in_trade inner join item_images on item_being_traded = item WHERE part_of_offer=($1);`, [tradeoffer], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    // console.log(result);
                    resolve(result);
                }
            });
        });
        return promise;
    }

    function isCashOfferOnly(tradeoffer){
        var promise = new Promise((resolve, reject) => {
            DB.query(`SELECT * FROM item_in_trade WHERE part_of_offer = ($1);`, [tradeoffer], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    function getUsersTradeOffer(user){
        var promise = new Promise((resolve, reject) => {
            DB.query(`select distinct on (tradeoffer_id) tradeoffer_id, item_name, money_offered, item_id, est_cost, description, key
                    from (select * from tradeoffer 
                    inner join item on item_trading_for = item_id where user_posted_trade=($1)) as x 
                    inner join item_images on item_id=item;`, [user], (err, result) => {
                        if(err){
                            reject(err);
                        }else{
                            resolve(result.rows);
                        }
                    });
        });
        return promise;
    }

    function getTimestamp(){
        var date =  new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        return timestamp;
    }

    function getItemsGroupedByTradeOffer(itemID, callback){
        DB.query(`Select item_trading_for, user_posted, money_offered, offer_message, date_of_offer, part_of_offer, accepted_offer, sold_status
        FROM (select * from tradeoffer inner join item_in_trade on tradeoffer.tradeoffer_id = item_in_trade.part_of_offer
        WHERE item_trading_for=($1)) as allrows
        INNER JOIN item on item.item_id = item_being_traded  
        ORDER BY part_of_offer;`, [itemID], (err, result) => {
            if(err){
                console.log(err);
                return err;
            }else{
                //Now have the columns: item | user_posted | money_offered |     offer_message      |      date_of_offer      | part_of_offer 
                var allItemsGroupedByTradeOffer = [];
                var itemsGroupedByTradeOffer = [];
                for(var i = 0; i < result.rows.length; i++){
                    if(i == 0){
                        if(result.rows.length == 1){
                            itemsGroupedByTradeOffer.push(result.rows[i]);
                            allItemsGroupedByTradeOffer.push(itemsGroupedByTradeOffer);
                            itemsGroupedByTradeOffer = [];
                        }else{
                            itemsGroupedByTradeOffer.push(result.rows[i]);
                        }
                    }else if(result.rows[i].part_of_offer == groupByTradeOffer){
                        itemsGroupedByTradeOffer.push(result.rows[i]);
                    }else{
                        allItemsGroupedByTradeOffer.push(itemsGroupedByTradeOffer);
                        itemsGroupedByTradeOffer = [];
                        itemsGroupedByTradeOffer.push(result.rows[i]);
                        groupByTradeOffer = result.rows[i].part_of_offer;
                    }
                }
                return callback(err, allItemsGroupedByTradeOffer);
            }
        });
    }
}
