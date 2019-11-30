
module.exports.set = function(app) {
    const Database = require('../models/Database');
    const Item = require('../models/Item');
    const Notification = require('../models/Notification');
    const DB = new Database();
    const item = new Item(DB);
    const notify = new Notification(DB);

    /**
     * Endpoint that deletes a notification by its ID.
     */
    app.post('/notification/delete', (req, res) => {
        var notification = req.body.notificationID;
        notify.deleteNotification(notification).then((result) => {
            res.send('deleted notification');
        }).catch((err) => {
            res.send('failed to delete notification');
        });
    });

    /**
     * Endpoint that adds a notification.
     */
    app.post('/notification/add', (req, res) => {
        var type = req.body.type;
        var notificationFor = req.body.notificationFor;
        var notificationFrom = req.body.notificationFrom;
        var relatedItem = req.body.relatedItem;
        if(type != 'message'){
            notify.addItemNotification(notificationFor, type, sentAt, notificationFrom, relatedItem).then((result) => {
                res.send('added '+type+' notification');
            }).catch((err) => {
                res.send('failed to add '+type+' notification');
            });
            
        }else{
            notify.addMessageNotification(notificationFor, type, sentAt).then((result) => {
                res.send('added message notification');
            }).catch((err) => {
                res.send('failed to add message notification');
            });
        }

        
        res.send('added notification');
    });
 };