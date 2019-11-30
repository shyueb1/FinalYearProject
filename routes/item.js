const imagestore = require('../services/imagestore').upload;
const Database = require('../models/Database');
const Item = require('../models/Item');
const Account = require('../models/Account');
const Tradeoffer = require('../models/Tradeoffer');
const DB = new Database();
const item = new Item(DB);
const account = new Account(DB);
const tradeoffer = new Tradeoffer(DB);

module.exports.set = function(app) {
    /**
     * Endpoint that serves the homepage.
     */
    app.get('/', (req, res) => {
        //if user authenticated -> get details
        if(req.isAuthenticated()){
            item.getItemsWithImages().then((itemsAndImages) => {
                var args = {
                    'items': itemsAndImages,
                    'message':req.flash('message'),
                }
                return res.render('pages/homepage', args);
            });
        }else{
            item.getItemsWithImages().then((result) => {
                var items = result;
                var args = {
                    'items': items,
                    'message':req.flash('message')
                };
                return res.render('pages/homepage', args);
            });
        }  
    });

    /**
     * Endpoint that serves the item listing form.
     */
    app.get('/listitem', (req, res) => {
        if(req.isAuthenticated()){
            var args = {
                'message': req.flash('message')
            };
            return res.render('pages/listitem', args);
        }else{
            req.flash('message', 'Create a free account or login to post an item.');
            var args = {
                'message': req.flash('message')
            }
            return res.render('pages/listitem', args);
        }
        
    });
    
    /**
     * Endpoint that stores images sent by the item listing form.
     */
    app.post('/listitem', imagestore.array('image', 3), (req, res) => {
        var itemname = req.body.itemname;
        var category = req.body.category;
        var images = req.files;
        var description = req.body.description;
        var location = req.body.location;
        var value = req.body.value;
        var userListing = req.user.rows[0].user_name;
        item.storeItem(userListing, itemname, location, value, description, category, images, (err, result)=>{
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

    /**
     * Endpoint that gets items with a similar name to the given search term.
     */
    app.post("/search", (req, res) => {
        var query = req.body.search;
        item.getItemWithSimilarName(query).then((result) => {
            var items = result.rows;
            var args = {
                'items': items,
                'message':req.flash('message')
            };
            return res.render('pages/homepage', args);
        });
    });

    /**
     * Endpoint that retrieves a users item postings.
     */
    app.get('/youritemposts', (req, res) => {
        if(req.isAuthenticated()){
            //get latest item posts
            item.getLatestItemPosts(req.user.rows[0].user_name).then((result) => {
                console.log(result);
                var args = {
                    'items': result,
                    'message':req.flash('message')
                };
                return res.render('pages/youritems', args);
            }).catch((err) => {
                console.log("error at item post");
                var args = {
                    'items': '',
                    'message':req.flash('message')
                };
                return res.render('pages/youritems', args);
            });
        }else{
            req.flash('message', 'You must be logged in to see your items.');
            return res.redirect('/login');
        }
    });
    
    /**
     * Endpoint that serves the item editting page.
     */
    app.get('/edit/:id', (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            var itemID = req.params.id;
            item.isItemOwner(user, itemID).then((youOwnItem) => {
                if(youOwnItem){
                    item.getItemByID(itemID).then((item) => {
                        args = {
                            item: item[0],
                            'message':req.flash('message')
                        };
                        return res.render("pages/edititem", args);
                    });
                }else{
                    req.flash('message', 'You can only edit items you own.');
                    return res.redirect('/youritemposts');
                }
            });
        }else{
            req.flash('message', 'You must be authenticated to edit this item.');
            return res.redirect('/login');
        }
       
    });

    /**
     * Endpoint that lets you post changes to an item you own.
     */
    app.post('/edit/:id', (req, res) => {
        var itemID = req.params.id;
        var itemname = req.body.itemname;
        var category = req.body.category;
        var description = req.body.description;
        var location = req.body.location;
        var value = req.body.value;
        var userListing = req.user.rows[0].user_name;
    
        if(req.isAuthenticated()){
            item.setItem(itemID, itemname, category, description, location, value, userListing).then((result) => {
                req.flash('message', 'Item has been updated.');
                return res.redirect("/youritemposts");
            }).catch((err) => {
                req.flash('message', 'Item failed to update.');
                return res.redirect("/youritemposts");
            });
        }else{
            req.flash('message', 'You are must be logged in to edit an item.');
            return res.redirect("/login");
        }
    });

    /**
     * Endpoint that lets an owner of an item delete it.
     */
    app.get('/delete/:id', (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            var itemID = req.params.id;
            item.isItemOwner(user, itemID).then((youOwnItem) => {
                if(youOwnItem){
                    item.deleteItem(itemID).then(() => {
                        req.flash('message', "Item successfully deleted.");
                        return res.redirect('/youritemposts');
                    });
                }else{
                    req.flash('message', "You cannot delete this item as you are not the owner.");
                    return res.redirect('/youritemposts');
                }
            });
        }else{
            req.flash('message', "You must be logged in to delete an item.");
            return res.redirect('/login');
        }
    });

    /**
     * Endpoint that lets a user make an offer for an item.
     */
    app.get('/makeoffer/:id', (req, res) => {
        //Get item info for item user is buying
        item.getItemByID(req.params.id).then((result1) => {
            item.getImg(req.params.id, (err, result2) => {
                if(req.isAuthenticated()){
                    //Get users items and associated images
                    userLoggedInUsername = req.user.rows[0].user_name;
                    userLoggedIn = req.user.rows[0];
                    item.getUsersItems(userLoggedInUsername).then((result3) => {
                        var userLoggedInItemsImages = [];
                        var userLoggedInItems = result3.rows;
                        var imagePromises = [];
                        userLoggedInItems.forEach((item) => {
                            var itemID = item.item_id;
                            var p = new Promise((resolve, reject) => {
                                item.getImg(itemID, (err4, result4) => {
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
                                'message': req.flash('message'),
                                'images': result2.rows,
                                'item': result1.rows[0],
                                'userLoggedInItems': userLoggedInItems,
                                'userLoggedInItemsImages': userLoggedInItemsImages
                            };
                            return res.render("pages/itempage", args);
                        }).catch((err) => {
                            req.flash('message', "User has no items to offer.");
                            return res.redirect("/");
                        });
                    });
                }else{
                    args = {                            
                        'message': req.flash('message'),
                        'images': result2.rows,
                        'item': result1.rows[0],
                    };
                    return res.render("pages/itempage", args);
                }
            });
        }).catch((err) => {
            req.flash('message', "Couldn't find item.");
            return res.redirect('/', );
        });
    });

    /**
     * Endpoint that creates a trade offer for the item with the given ID.
     */
    app.post('/makeoffer/:id', (req, res) => {
        var moneyOffered = req.body.moneyOffered;
        var itemsOffered = req.body.itemsOffered;
        var offerMessage = req.body.offerMessage;
        var itemTradingFor = req.params.id;
        var userPostedOffer = req.user.rows[0].user_id;
        var dateOfOffer = getTimestamp();
        //create tradeoffer returning tradeofferID
        if(itemsOffered == undefined){
            tradeoffer.setCashOnlyTradeOffer(itemTradingFor, moneyOffered, offerMessage, dateOfOffer, userPostedOffer).then((result) => {
                req.flash('message', 'Successfully added your offer.');
                return res.redirect("/makeoffer/"+req.params.id);
            }).catch((err) => {
                req.flash('message', 'Failed to add offer.');
                return res.redirect('/makeoffer/'+req.params.id);
            });
        }else{
            tradeoffer.setTradeOffer(itemTradingFor, moneyOffered, offerMessage, dateOfOffer, userPostedOffer).then((result) => {
                var tradeofferID = result.rows[0].tradeoffer_id;
                //add each users items to item in trade
                var addingOffer = new Promise((resolve, reject) => {
                    //Single item
                    if(typeof itemsOffered == "string" && itemsOffered != undefined){
                        tradeoffer.addTradeItem(itemsOffered, tradeofferID).then((result) => {
                            resolve(result)
                        }).catch((err) => {
                            req.flash('message', 'Failed to add items to offer.');
                            reject(err);
                        });
                    }else if(itemsOffered != undefined){
                        itemsOffered.forEach((item, index, array) => {
                            if (index === array.length - 1){
                                resolve();
                            }
                            tradeoffer.addTradeItem(item, tradeofferID).then((result) => {
                            }).catch((err) => {
                                req.flash('message', 'Failed to add items to offer.');
                                reject();
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
            }).catch((err) => {
                req.flash('message', 'Failed to add tradeoffer.');
                return res.redirect("/makeoffer/"+req.params.id);
            });
        }
    });

    /**
     * Endpoint that serves the page with offers on an item with a given ID.
     */
    app.get("/viewoffers/:id", (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            var itemID = req.params.id;
            item.isItemOwner(user, itemID).then((youOwnItem) => {
                if(youOwnItem){
                    tradeoffer.getTradeOffersForItem(itemID).then((tradeOffers) => {
                       var tradeOffersFormatted = [];
                       var allTradeOfferIDsForDBQuery = '';
                       tradeOffers.forEach((offer) => {
                            var t = {
                                "id": offer.tradeoffer_id,
                                "message": offer.offer_message,
                                "acceptedOffer": offer.accepted_offer,
                                "postedBy": offer.user_name,
                                "moneyOffered": offer.money_offered,
                                "cashOnly": offer.cash_only,
                                "datePosted": offer.date_of_offer
                            };
                            allTradeOfferIDsForDBQuery += 'part_of_offer = ' + t.id + ' or ';
                            tradeOffersFormatted.push(t);
                       });
                       if(allTradeOfferIDsForDBQuery.length <= 1){
                             allTradeOfferIDsForDBQuery = "part_of_offer = -1;";
                       }else{
                            allTradeOfferIDsForDBQuery = allTradeOfferIDsForDBQuery.substring(0, allTradeOfferIDsForDBQuery.length - 4);
                            allTradeOfferIDsForDBQuery += ';';
                       }
                       
                       
                       tradeoffer.getAllItemsFromTradeOffers(allTradeOfferIDsForDBQuery).then((allItems) => {
                            var args = {
                                'tradeOffers': tradeOffersFormatted,
                                'items': allItems,
                                'message': req.flash('message')
                            };
                            return res.render('pages/viewtradeoffers', args);
                       });
                  });
                }else{
                    return res.redirect('/');
                }
            });
        }else{
            req.flash('message', 'You must be logged in to view offers.');
            res.redirect('/');
        }
    });
    
    /**
     * Endpoint that changes an offer status to declined for a given offer ID.
     */
    app.get("/declineoffer/:id", (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            var offerID = req.params.id;
            tradeoffer.isUsersItemInTradeOffer(user, offerID).then((yourOffer) => {
                if(yourOffer){
                    tradeoffer.setOfferStatus('false', offerID).then((rejectedOffer) => {
                        var itemTradingFor = rejectedOffer[0].item_trading_for;
                        req.flash("message", "Offer has been declined.");
                        return res.redirect("/viewoffers/"+itemTradingFor);
                    });
                }else{
                    req.flash('message', 'You cannot decline this offer as it is not your item.');
                    return res.redirect('/youritemposts');
                }
            });
        }else{
            return res.redirect('/login');
        }
    });

    /**
     * Endpoint that changes an offer status to accepted for a given offer ID.
     */
    app.get("/acceptoffer/:id", (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            var offerID = req.params.id;
            tradeoffer.isUsersItemInTradeOffer(user, offerID).then((yourOffer) => {
                if(yourOffer){
                    tradeoffer.getItemTradingFor(offerID).then((tradeoffer) => {
                        var itemTradingFor = tradeoffer[0].item_trading_for;
                        tradeoffer.getPreviousAcceptedOffer(itemTradingFor).then((previousTrade) => {
                            if(previousTrade.length == 0){
                                tradeoffer.setOfferStatus('true', offerID).then((acceptedOffer) => {
                                    var itemTradingFor = acceptedOffer[0].item_trading_for;
                                    req.flash("message", "Offer has been accepted.");
                                    return res.redirect("/viewoffers/"+itemTradingFor);
                                });
                            }else{
                                var previousTradeID = previousTrade[0].tradeoffer_id;
                                tradeoffer.setOfferStatus('false', previousTradeID).then((declinedOffer) => {
                                    tradeoffer.setOfferStatus('true', offerID).then((acceptedOffer) => {
                                        var itemTradingFor = acceptedOffer[0].item_trading_for;
                                        req.flash("message", "Offer has been accepted.");
                                        return res.redirect("/viewoffers/"+itemTradingFor);
                                    });
                                });
                            }
                        });
                    });
                }else{
                    req.flash('message', 'You cannot accept this offer as it is not your item.');
                    return res.redirect('/youritemposts');
                }
            });
        }else{
            req.flash('message', 'You must be logged in to accept an offer.');
            return res.redirect('/');
        }
    });

    /**
     * Endpoint that serves a page with the logged in users' items.
     */
    app.get("/youroffers", (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_id;
            var offerTypes = [];
            var gettingTradeOffers = tradeoffer.getUsersTradeOffer(user);
            gettingTradeOffers.then((tradeOffers)=>{
                tradeOffers.forEach(offer => {
                    //Check if cash only get cash offered
                    var getOfferType = tradeoffer.isCashOfferOnly(offer.tradeoffer_id);
                    offerTypes.push(getOfferType);
                });
                Promise.all(offerTypes).then((result) => {
                    var complete = [];
                    result.forEach(offer => {
                        var p = new Promise((resolve, reject)=>{
                            if(offer.length == 0){
                                //is a cash only deal
                                resolve('cashOnly');
                            }else{
                                tradeoffer.retrieveItemOffer(offer[0].part_of_offer).then(result => {
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
                            'message': req.flash('message'),
                            'yourOffers': yourOffersFormatted
                        }
                        return res.render("pages/youroffers", args);
                    });
                            
                });
            });
        }
    });

    /**
     * Endpoint that deletes an offer for a given offer ID.
     */
    app.get("/deleteoffer/:id", (req, res) => {
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            var offerID = req.params.id;
            account.getUserID(user).then((id) => {
                tradeoffer.isUsersOffer(id[0].user_id, offerID).then((yourOffer) => {
                    if(yourOffer){
                        tradeoffer.deleteOffer(offerID).then(() => {
                            req.flash('message', 'Your offer has been successfully removed.');
                            return res.redirect('/youroffers');
                        }).catch((err) => {
                            req.flash('message', 'Your offer has failed to be deleted.');
                            return res.redirect('/youroffers');
                        });
                    }else{
                        req.flash('message', 'You cannot delete this offer as it is not an offer for your items.');
                        return res.redirect('/youroffers');
                    }
                });
            });
        }else{
            return res.redirect('/login');
        }
    });

    /**
     * Gets the time stamp at the current moment in time.
     * @returns a String form of a timestamp.
     */
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
}
