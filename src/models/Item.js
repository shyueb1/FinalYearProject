class Item{
    constructor(databaseConnection){
        this.DB = databaseConnection;
    }

    /**
     * Gets items with a similar name to the query name.
     * @param {String} itemName 
     * @returns a promise that resolves to rows containing items and their information.
     */
    getItemWithSimilarName(itemName){
        var promise = new Promise((resolve, reject) => {
            this.DB.query(`SELECT DISTINCT ON (item_id) * FROM (SELECT * FROM item where LOWER(item_name) ~ ($1)) as x inner join item_images on item_id=item;`, [itemName.toLowerCase()], (err, result) => {
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
     * Checks if the given user posted the item with the given item ID.
     * @param {String} user 
     * @param {Integer} itemID 
     * @returns a promise that resolves to true if it is the user's item and false otherwise.
     */
    isItemOwner(user, itemID){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM item WHERE user_posted = ($1) AND item_id = ($2);', [user, itemID], (err, result) => {
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
     * Stores an item and its images in the database.
     * @param {String} user 
     * @param {String} itemname 
     * @param {String} location 
     * @param {Integer} value 
     * @param {String} description 
     * @param {String} category 
     * @param {String} images 
     * @param {CallableFunction} callback 
     * @return a callback with an error or the result of the rows being stored.
     */
    storeItem(user, itemname, location, value, description, category, images, callback){
        var date =  new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        console.log(timestamp);
        this.DB.query("INSERT INTO item(user_posted, item_name, item_location, est_cost, description, category, date_posted, sold_status, main_img) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING item_id;",[user, itemname, location, value, description, category, timestamp, 'false', images[0].key], (err, result) => {
            if(err){
               return callback(err);
            }else{
                var itemID = result.rows[0].item_id;
                this.storeImg(images, itemID);
                callback(err, result);
                return;
            } 
        });
    };

    /**
     * Stores an images key.
     * @param {String} keys 
     * @param {Integer} itemID 
     */
    storeImg(keys, itemID){
        console.log(keys +" "+itemID);
        keys.forEach((element) => {
            this.DB.query('INSERT INTO item_images(key, item) VALUES ($1, $2);', [element.key, itemID], (err, result) => {
                if(err){
                    console.log(err);
                }
            });
        });
    }

    /**
     * Gets an item by a given item ID.
     * @param {Integer} itemID 
     * @returns a promise that resolves to an error or a row containing the item information.
     */
    getItemByID(itemID){
        var promise = new Promise((resolve, reject) => {
            this.DB.query("SELECT * FROM item where item_id=($1);", [itemID], (err, result)=>{ 
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    };

    /**
     * Gets the 8 latest item postings.
     * @param {String} username
     * @returns a promise that resolves to rows containing the 8 latest items and their information.
     */
    getLatestItemPosts(username){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM item WHERE user_posted=($1) ORDER BY date_posted DESC LIMIT 8;',[username], (err, result)=>{
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
     * Stores an item in the database.
     * @param {Integer} itemID 
     * @param {String} itemname 
     * @param {String} category 
     * @param {String} description 
     * @param {String} location 
     * @param {Integer} value 
     * @param {String} userListing
     * @returns a promise that resolves to the result of the database insertion. 
     */
    setItem(itemID, itemname, category, description, location, value, userListing){
        var promise = new Promise((resolve, reject) => {
            this.DB.query(`UPDATE item
                      SET 
                        item_name = ($2),
                        category = ($3),
                        description = ($4),
                        item_location = ($5),
                        est_cost = ($6),
                        user_posted = ($7)
                      WHERE item_id = ($1);`, [itemID, itemname, category, description, location, value, userListing], (err, result) => {
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
     * Gets an image key from the database for a given ID.
     * @param {Integer} itemID 
     * @param {CallableFunction} callback 
     * @returns a callback with an error or a row containing the item key.
     */
    getImg(itemID, callback){
        this.DB.query('SELECT key FROM item_images WHERE item=($1);', [itemID], (err, result) => {
            return callback(err, result);
        });
    };

    /**
     * Gets a user's items.
     * @param {String} username 
     * @returns a promise that resolves to a row containing the user's items.
     */
    getUsersItems(username){
        var promise = new Promise((resolve, reject) => {
            this.DB.query("SELECT * FROM item WHERE user_posted=($1);", [username], (err, result) => {
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
     * Gets an item from its ID.
     * @param {Integer} itemID 
     * @returns a promise that resolves to a row containing an items information.
     */
    getItem(itemID){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM item WHERE item_id = ($1);', [itemID], (err, result) => {
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
     * Deletes an item by a given item ID.
     * @param {Integer} itemID 
     * @returns a promise that resolves to an error or nothing if item was deleted successfully.
     */
    deleteItem(itemID){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('DELETE FROM item WHERE item_id = ($1);', [itemID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
        return promise;
    };

    /**
     * Gets the latest item's information and it's images.
     * @returns a promise that resolves to a row containing the items information and images.
     */
    getItemsWithImages(){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT DISTINCT ON (item_id) * FROM (select * from item order by date_posted desc) AS items INNER JOIN item_images ON items.item_id = item_images.item WHERE items.expired = false;', (err, result)=>{
                if(err){
                    reject(err);
                }{
                    resolve(result.rows);
                }
            }); 
        });
        return promise;  
    }

    /**
     * Sets the expired column to true if an item has past its sell-by date.
     */
    setItemExpired(itemId){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('UPDATE item SET expired = true WHERE item_id=($1);', [itemId], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
        return promise;
    }

    
}

module.exports = Item;
