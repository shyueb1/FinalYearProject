class Tradeoffer{
    constructor(databaseConnection){
        this.DB = databaseConnection;
    }
    /**
     * Adds a cash only trade offer into the database.
     * @param {Integer} itemTradingFor 
     * @param {Integer} moneyOffered 
     * @param {String} offerMessage 
     * @param {Date} dateOfOffer 
     * @param {Integer} userPostedOffer 
     * @returns a promise that resolves to a row containing the new trade offers ID.
     */
    setCashOnlyTradeOffer(itemTradingFor, moneyOffered, offerMessage, dateOfOffer, userPostedOffer){
        let promise = new Promise((resolve, reject) => {
            this.DB.query("INSERT INTO tradeoffer(item_trading_for, money_offered, offer_message, date_of_offer, user_posted_trade, cash_only) VALUES ($1, $2, $3, $4, $5, $6) RETURNING tradeoffer_id;",[itemTradingFor, moneyOffered, offerMessage, dateOfOffer, userPostedOffer, 'true'] , (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Adds a trade offer to the database.
     * @param {Integer} itemTradingFor 
     * @param {Integer} moneyOffered 
     * @param {String} offerMessage 
     * @param {Date} dateOfOffer 
     * @param {Integer} userPostedOffer 
     * @returns a promise that resolves to a row containing the trade offers ID.
     */
    setTradeOffer(itemTradingFor, moneyOffered, offerMessage, dateOfOffer, userPostedOffer){
        let promise = new Promise((resolve, reject) => {
            this.DB.query("INSERT INTO tradeoffer(item_trading_for, money_offered, offer_message, date_of_offer, user_posted_trade) VALUES ($1, $2, $3, $4, $5) RETURNING tradeoffer_id;",[itemTradingFor, moneyOffered, offerMessage, dateOfOffer, userPostedOffer] , (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Adds a trade item to the database.
     * @param {Integer} itemOffered 
     * @param {Integer} tradeofferID
     * @returns a promise with no value. 
     */
    addTradeItem(itemOffered, tradeofferID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query("INSERT INTO item_in_trade(item_being_traded, part_of_offer) VALUES ($1, $2);", [itemOffered, tradeofferID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Gets items that satisfy the selection filters.
     * @param {String} selectionFilters
     * @returns a promise that resolves to rows containing the items matching the filters. 
     */
    getAllItemsFromTradeOffers(selectionFilters){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM (SELECT * FROM item_in_trade) AS X INNER JOIN item ON item_id = item_being_traded WHERE ' + selectionFilters, (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            }); 
        });
        return promise;
    }

    /**
     * Gets trade offers made for an item with the given item ID.
     * @param {Integer} itemID 
     * @returns a promise that resolves to a row containing trade offers.
     */
    getTradeOffersForItem(itemID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM (SELECT * FROM tradeoffer WHERE item_trading_for = ($1)) AS X INNER JOIN users ON user_id = user_posted_trade;', [itemID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

        /**
     * Sets an offers sold status.
     * @param {String} status 
     * @param {Integer} tradeoffer 
     * @returns a promise that resolves to a row containing
     */
    setOfferStatus(status, tradeoffer){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('UPDATE tradeoffer SET accepted_offer = ($1) WHERE tradeoffer_id = ($2) RETURNING item_trading_for;', [status, tradeoffer], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Deletes an offer by the given offer ID.
     * @param {Integer} offerID 
     * @returns a promise that resolves to a row containing
     */
    deleteOffer(offerID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query(`DELETE FROM tradeoffer where tradeoffer_id=($1);`, [offerID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Gets items that are part of a trade offer.
     * @param {Integer} tradeoffer 
     * @returns a promise that resolves to a row containing the items of the trade offer.
     */
    retrieveItemOffer(tradeoffer){
        let promise = new Promise((resolve, reject) => {
            this.DB.query(`SELECT distinct on (item_being_traded) item_being_traded, key FROM item_in_trade inner join item_images on item_being_traded = item WHERE part_of_offer=($1);`, [tradeoffer], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Checks if a trade offer is cash only.
     * @param {Integer} tradeoffer 
     * @returns a promise that resolves to a row containing the cash trade offer if it exists.
     */
    isCashOfferOnly(tradeoffer){
        let promise = new Promise((resolve, reject) => {
            this.DB.query(`SELECT * FROM item_in_trade WHERE part_of_offer = ($1);`, [tradeoffer], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets all of the user's trade offers.
     * @param {String} username 
     * @returns a promise that resolves a rows containing the user's trade offers.
     */
    getUsersTradeOffer(username){
        let promise = new Promise((resolve, reject) => {
            this.DB.query(`SELECT DISTINCT ON (tradeoffer_id) tradeoffer_id, item_name, money_offered, item_id, est_cost, description, key
                    FROM (SELECT * FROM tradeoffer 
                    INNER JOIN item ON item_trading_for = item_id where user_posted_trade=($1)) AS X 
                    INNER JOIN item_images ON item_id=item;`, [username], (err, result) => {
                        if(err){
                            reject(err);
                        }else{
                            resolve(result.rows);
                        }
                    });
        });
        return promise;
    }

    /**
     * Gets previously accepted trade offers.
     * @param {Integer} itemID 
     * @returns a promise that resolves to a row containing trade offers that were previously accepted.
     */
    getPreviousAcceptedOffer(itemID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM tradeoffer WHERE item_trading_for = ($1) AND accepted_offer = true;', [itemID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets a trade offer by the given trade offer ID.
     * @param {Integer} tradeoffer 
     * @returns a promise that resolves to a row containing the trade offer.
     */
    getItemTradingFor(tradeoffer){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM tradeoffer WHERE tradeoffer_id = ($1);', [tradeoffer], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets a trade offer by the given trade offer ID.
     * @param {Integer} tradeoffer 
     * @returns a promise that resolves to a row containing the trade offer.
     */
    getAcceptedOffer(itemId){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM (SELECT * FROM tradeoffer WHERE item_trading_for=($1) AND accepted_offer=TRUE) AS X INNER JOIN users ON user_id = X.user_posted_trade;', [itemId], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Checks if a user's item is being traded for another item.
     * @param {String} user 
     * @param {Integer} offerID 
     * @returns a promise that resolves to true if the user's item is being traded and false otherwise.
     */
    isUsersItemInTradeOffer(user, offerID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM (SELECT * FROM (SELECT * FROM tradeoffer WHERE tradeoffer_id = ($2)) AS x INNER JOIN item ON item_id = item_trading_for) AS y WHERE user_posted = ($1);', [user, offerID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    if(result.rowCount > 0){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }
            })
        });
        return promise;
    }

    /**
     * Checks if the offer was made by the given user.
     * @param {String} user 
     * @param {Integer} offerID 
     * @returns true if the trade was posted by that user and false otherwise.
     */
    isUsersOffer(user, offerID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM tradeoffer where user_posted_trade = ($1) AND tradeoffer_id = ($2);', [user, offerID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    if(result.rowCount > 0){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }
            });
        });
        return promise;
    }

     /**
     * Removes a trade offer by a given ID.
     * @param {Integer} offerID 
     * @returns a promise that resolves to an error or a row containing the result of the deletion.
     */
    removeTradeOffer(offerID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('DELETE FROM tradeoffer WHERE tradeoffer_id = ($1);', [offerID], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets the item owner and details for a given item ID.
     * @param {Integer} itemID 
     * @returns a promise that resolves to a row containing the item and it's details.
     */
    getItemOwner(itemID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM item WHERE item_id = ($1);', [itemID], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets the items that are included in a trade offer.
     * @param {Integer} offerID 
     * @returns a promise that resolves to an error or a row containing the items in the trade offer.
     */
    getItemFromTradeOffer(offerID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM (SELECT * FROM (SELECT * FROM tradeoffer WHERE tradeoffer_id = ($1)) AS x inner join item on item_id = item_trading_for) AS y;', [offerID], (err, result) => {
                    if(err){
                        console.log(err);
                        reject(err);
                    }else{
                        resolve(result.rows);
                    }
            });
        });
        return promise;
    }

    /**
     * Gets an offer with the user associated with it by its offer ID.
     * @param {Integer} offerID 
     * @returns a promise that resolves to an error or a row containing the offer and the user who posted it.
     */
    getOfferFromOfferID(offerID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM (SELECT * FROM tradeoffer WHERE tradeoffer_id = ($1)) AS x INNER JOIN users ON user_id = user_posted_trade;', [offerID], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        }); 
        return promise;
    }

    /**
     * Gets the trade offers that are placed for an item.
     * @param {Integer} itemID 
     * @returns a promise that resolves to an error or rows containing trade offers placed for it.
     */
    getTradeOffersOnItem(itemID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM (SELECT * FROM tradeoffer WHERE item_trading_for = ($1)) AS x INNER JOIN users on user_id = x.user_posted_trade;',[itemID], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }
}

module.exports = Tradeoffer;