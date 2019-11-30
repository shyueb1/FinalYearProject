class Notification{
    constructor(databaseConnection){
        this.DB = databaseConnection;
    }

    /**
     * Deletes a notification with the given notification ID.
     * @param {Integer} notificationID 
     * @returns a promise that resolves to an error or the string "deleted" if it was deleted.
     */
    deleteNotification(notificationID){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('DELETE FROM notifications WHERE notification_id = ($1);', [notificationID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    if(result.rows.length >= 0){
                        resolve(result.rows);
                    }else{
                        resolve('deleted');
                    }                    
                }
            });
        });
        return promise;
    }

    /**
     * Adds a notification of type message to the database.
     * @param {String} notificationFor 
     * @param {Date} sentAt 
     * @param {String} notificationFrom 
     * @returns a promise that resolves to an error or the string "Added" if it was added.
     */
    addMessageNotification(notificationFor, notificationFrom){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('INSERT INTO notifications (notification_for, type, sent_at, notification_from) VALUES ($1, $2, $3, $4);', [notificationFor, 'message_sent', this.getDateNow(), notificationFrom], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    if(result.rows.length >= 0){
                        resolve(result.rows);
                    }else{
                        resolve('added');
                    }     
                }
            });
        });
        return promise;
    }

    /**
     * Adds a notification with the specified parameters.
     * @param {String} notificationFor 
     * @param {String} type 
     * @param {Date} sentAt 
     * @param {String} notificationFrom 
     * @param {Integer} relatedItem 
     * @returns a promise that resolves to an error or a String "added" if the notification was added.
     */
    addItemNotification(notificationFor, type, sentAt, notificationFrom, relatedItem){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('INSERT INTO notifications (notification_for, type, sent_at, notification_from, related_item) VALUES ($1, $2, $3, $4, $5);', [notificationFor, type, sentAt, notificationFrom, relatedItem], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    if(result.rows.length >= 0){
                        resolve(result.rows);
                    }else{
                        resolve('added');
                    }     
                }
            });
        });
        return promise;
    }

    /**
     * Stores a notification for a relevant type.
     * @param {String} notificationFor 
     * @param {String} type 
     * @param {String} sender 
     * @param {Integer} relatedItem 
     * @returns a promise that resolves to an error or a row containing the result of the insertion.
     */
    storeNotification(notificationFor, type, sender, relatedItem){
        var sentAt = this.getDateNow();
        var promise = new Promise((resolve, reject) => {
            this.DB.query('INSERT INTO notifications(notification_for, type, sent_at, notification_from, related_item) VALUES ($1, $2, $3, $4, $5);', [notificationFor, type, sentAt, sender, relatedItem], (err, result) => {
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

module.exports = Notification;