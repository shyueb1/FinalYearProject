const Item = require('../models/Item');
const Offer = require('../models/Tradeoffer');
const Database = require('../models/Database');
const imagestore = require('../services/imagestore').upload;
const auth = require('../middleware/auth');
const DB = new Database();
const item = new Item(DB);
const offer = new Offer(DB);
const express = require('express');
const router = express.Router();

const getDate = () => {
    let date =  new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let milliseconds = date.getMilliseconds();
    let timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
    return timestamp;
}

router.get('/itembyid/:id', (req, res) => {
    const itemId = req.params.id;
    item.getItemByID(itemId)
    .then((item) => res.status(200).json(item.rows[0]))
    .catch((err) => { console.log(err); res.sendStatus(500);})
});

router.get('/latestitems', (req, res) => {
    item.getItemsWithImages()
    .then((itemsAndImages) => {
        res.status(200).json(itemsAndImages);
    })
    .catch((err) => res.sendStatus(500));
});

router.post('/itemsbysimilarname', (req, res) => {
    item.getItemWithSimilarName(req.body.query)
    .then((items) => {
        res.status(200).json(items);
    })
    .catch((err) => res.sendStatus(500));
});

router.post('/useritems', (req, res) => {
    const { user } = req.body;
    item.getUsersItems(user)
    .then((items) => {
        res.status(200).json(items.rows);
    })
    .catch((err) => {
        res.sendStatus(500);
    })
});

router.post('/delete', (req, res) => {
    const { id } = req.body;
    item.deleteItem(id)
    .then((result) => res.sendStatus(200))
    .catch((err) => res.sendStatus(500));
});

router.post('/listitem', auth, imagestore.array('images', 3), (req, res) => {
    if(req.isAuthenticated){
        const { itemname, category, description, location, value } = req.body;
        const user = req.user.username;
        const images = req.files;
        item.storeItem(user, itemname, location, value, description, category, images, (err, result)=>{
            if(err){
                console.log(err);
                res.status(500).json({'error':'server error'});
            }else{
                res.status(200).json({'status':'success'});
            }
        });
    }else{
        res.status(400).json({'error': 'user not authenticated'});
    }
});

router.get('/userallitems', auth, (req, res) => {
    if(req.isAuthenticated){
        const user = req.user.username;
        item.getUsersItems(user)
        .then((items) => {
            res.status(200).json(items.rows);
        })
        .catch((err) => res.sendStatus(500));
    }else{
        res.status(400).json({'error': 'user not authenticated'});
    }
});

router.post('/makeoffer', auth, (req, res) => {
    if(req.isAuthenticated){
        const user = req.user.id;
        const { itemsOffered, moneyOffered, message, itemTradingFor } = req.body;
        if(itemsOffered.length == 0){
            //Cash only
            offer.setCashOnlyTradeOffer(itemTradingFor, moneyOffered, message, getDate(), user)
            .then((tradeOfferId) => res.status(200).json({'status':'successful'}))
            .catch((err) => {
                console.log(err);
                res.status(500);
            });
        }else{
            offer.setTradeOffer(itemTradingFor, moneyOffered, message, getDate(), user)
            .then((tradeOffer) => {
                itemsOffered.forEach((item) => {
                    console.log(itemsOffered);
                    console.log(tradeOffer);
                    offer.addTradeItem(item, tradeOffer.rows[0].tradeoffer_id)
                    .then((result) => {
                        console.log("Added item to trade!");
                        res.status(200).json({'status':'successful'});
                    })
                    .catch((err) => {
                        console.log(err); 
                        res.status(500);
                    }); 
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500)
            });
        }
        res.status(200);
    }else{
        res.status(400);
    }
});

router.post('/expired/:id', (req, res) => {
    const itemId = req.params.id;
    item.setItemExpired(itemId)
    .then((result) => res.status(200).json({'status': 'successful'}))
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});


router.get('/getitemoffers/:id', auth, (req, res) => {
    const itemId = req.params.id;
    const user = req.user.username;
    if(req.isAuthenticated){
        item.isItemOwner(user, itemId)
        .then((youOwnItem) => {
            if(youOwnItem){
                offer.getTradeOffersForItem(itemId)
                .then((tradeOffers) => {
                   let tradeOffersFormatted = [];
                   let allTradeOfferIDsForDBQuery = '';
                   tradeOffers.forEach((offer) => {
                        let t = {
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

                   offer.getAllItemsFromTradeOffers(allTradeOfferIDsForDBQuery)
                   .then((allItems) => {
                        console.log("tID:"+allTradeOfferIDsForDBQuery+", "+allItems);
                        res.status(200).json({
                            'tradeOffers': tradeOffersFormatted, 
                            'items': allItems
                        });
                   })
                   .catch((err) => {
                        console.log(err);
                        res.status(500).json({'error': 'server error'});
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({'error': 'server error'});
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({'error': 'server error'});
        });
    }else{
        res.status(401).json({'error':'user not authorized'});
    }
});

router.get('/bidding/:id', (req, res) => {
    console.log("check win bid");
    offer.getAcceptedOffer(req.params.id)
    .then((result) => res.status(200).json({'status': 'successful', 'acceptedOffer': result}))
    .catch((err) => {
        console.log(err);
        res.status(500).json({'status': 'unsuccessful', 'error':'server error'});
    });
});

router.put('/expired/:id', auth, (req, res) => {
    if(req.isAuthenticated){
        item.setItemExpired(req.params.id)
        .then((result) => res.status(200).json({'status': 'successful'}))
        .catch((err) => {
            console.log(err);
            res.status(500).json({'error':'server error'});
        });
    }else{
        res.status(401).json({'error':'user not authorized'});
    }
});


router.put('/acceptoffer/:id', auth, (req, res) => {
    if(req.isAuthenticated){
        offer.setOfferStatus("TRUE", req.params.id)
        .then(() => res.status(200).json({'status': 'success'}))
        .catch((err) => {
            console.log(err);
            res.status(500).json({'status':'failed', 'error': 'server error'});
        })
    }else{
        res.status(401).json({'error': 'user not authorized'});
    }
});


router.put('/declineoffer/:id', auth, (req, res) => {
    if(req.isAuthenticated){
        offer.setOfferStatus("FALSE", req.params.id)
        .then(() => res.status(200).json({'status': 'success'}))
        .catch((err) => {
            console.log(err);
            res.status(500).json({'status':'failed', 'error': 'server error'});
        })
    }else{
        res.status(401).json({'error': 'user not authorized'});
    }
});
module.exports = router;