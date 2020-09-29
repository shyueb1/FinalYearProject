const io = require('socket.io');
const Database = require('../models/Database');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

class Socket{

    /**
     * Constructor for Socket object which creates an instance of a websocket, database and event handlers.
     * @param {Object} server 
     */
    constructor(server){
        this.io = new io.listen(server);
        // this.allMissedMessages = [];
        // this.DB = DB;
        this.DB = new Database();
        this.message = new Message(this.DB);
        this.notification = new Notification(this.DB);
        this.handleEvents();
    }

    /**
     * Handler for when the join event is emitted by the socket.
     * @param {Object} socket 
     */
    handleJoinEvent(socket){
        socket.on('join', (userInfo) => {
            socket.join(userInfo.room, (err) => {
                if(err){
                    console.log(err);
                }else{
                    this.io.to(userInfo.room).emit('joinResponse', `You have successfully joined your room ${userInfo.room}`);
                }
            });
        });
    }

    /**
     * Handler for when the leave event is emitted by the socket.
     * @param {Object} socket 
     */
    handleLeaveEvent(socket){
        socket.on('leave', (room) => {
            socket.leave(room, (err) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Left socket from room.");
                }
            });
        });
    }

    /**
     * Handler for when the send message event is emitted by the socket.
     * @param {Object} socket 
     */
    handleSendMsgEvent(socket){
        socket.on('sendMessage', (message) => {
            //store message before sending via socket
            this.message.storeMessage(message.sender, message.receiver, message.message);
            this.notification.addMessageNotification(message.receiver, message.sender)
            .then((result) => {
                console.log(result);
                this.io.to(message.receiver).emit('chatMessage', {
                    'receiver': message.receiver,
                    'sender': message.sender,
                    'message': message.message
                });
                this.io.to(message.receiver).emit('notification', {
                    'notification_for': message.receiver,
                    'type': 'message',
                    'notification_from': message.sender,
                    'notification_id': result[0].notification_id
                });
            })
        });
    }

    /**
     * Handler for when the add notification event is emitted by the socket.
     * @param {Object} socket 
     */
    handleAddNotificationEvent(socket){
        socket.on('addNotification', (notification) => {
            switch(notification.type){
                case 'message_sent':
                    break;
                case 'offer_placed':
                    this.DB.getItemOwner(notification.relatedItem).then((result) => {
                        var notificationFor = result[0].user_posted;
                        this.DB.storeNotification(notificationFor, notification.type, notification.sender, notification.relatedItem).then(() => {
                            io.to(notificationFor).emit("notification", 
                                {'notificationFor': notificationFor, 
                                'type': 'Offer placed', 
                                'sender': notification.sender, 
                                'relatedItem': notification.relatedItem
                            });
                        });
                    });
                    break;
                case 'offer_deleted':
                    this.DB.getItemFromTradeOffer(notification.relatedItem).then((result) => {
                        var notificationFor = result[0].user_posted;
                        this.DB.storeNotification(notificationFor, notification.type, notification.sender, notification.relatedItem).then(() => {
                            this.io.to(notificationFor).emit("notification", 
                                    {'notificationFor': notificationFor, 
                                    'type': 'Offer deleted', 
                                    'sender': notification.sender, 
                                    'relatedItem': notification.relatedItem
                            });
                        });
                    });
                    break;
                case 'offer_accepted':
                    this.DB.getOfferFromOfferID(notification.relatedItem).then((offer) => {
                        var notificationFor = offer[0].user_name;
                        this.DB.storeNotification(notificationFor, notification.type, notification.sender, notification.relatedItem).then(() => {
                            this.io.to(notificationFor).emit("notification", 
                                    {'notificationFor': notificationFor, 
                                    'type': 'Offer accepted', 
                                    'sender': notification.sender, 
                                    'relatedItem': notification.relatedItem
                            });
                        });
                    });
                    break;
                case 'offer_declined':
                    this.DB.getOfferFromOfferID(notification.relatedItem).then((offer) => {
                        var notificationFor = offer[0].user_name;
                        this.DB.storeNotification(notificationFor, notification.type, notification.sender, notification.relatedItem).then(() => {
                            this.io.to(notificationFor).emit("notification", 
                                    {'notificationFor': notificationFor, 
                                    'type': 'Offer declined', 
                                    'sender': notification.sender, 
                                    'relatedItem': notification.relatedItem});
                        });
                    });
                break;
            case 'removed_item':
                this.DB.getTradeOffersOnItem(notification.relatedItem).then((tradeOffers) => {
                    tradeOffers.forEach((offer) => {
                        this.DB.removeTradeOffer(offer.tradeoffer_id);
                        this.DB.storeNotification(offer.user_name, notification.type, notification.sender, notification.relatedItem).then(() => {
                            this.io.to(offer.user_name).emit("notification", 
                                    {'notificationFor': offer.user_name, 
                                    'type': 'Item removed', 
                                    'sender': notification.sender, 
                                    'relatedItem': notification.relatedItem});
                        });
                    });
                });
                break;
            }
        });
    }

    /**
     * Calls all the event handlers for socket events.
     */
    handleEvents(){
        this.io.on('connection', (socket) => {
            this.handleJoinEvent(socket);
            this.handleLeaveEvent(socket);
            this.handleSendMsgEvent(socket);
            this.handleAddNotificationEvent(socket);
        });
    }
}

module.exports = Socket;