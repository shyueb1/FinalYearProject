const io = require('socket.io');
const Database = require('../models/Database');
const DB = new Database();

class Socket{

    /**
     * Constructor for Socket object which creates an instance of a websocket, database and event handlers.
     * @param {Object} server 
     */
    constructor(server){
        this.io = new io.listen(server);
        this.allMissedMessages = [];
        this.DB = DB;
        this.handleEvents();
    }

    /**
     * Handler for when the join event is emitted by the socket.
     * @param {Object} socket 
     */
    handleJoinEvent(socket){
        socket.on('join', (userInfo) => {
            var usersMissedMessages = [];
            this.allMissedMessages.forEach((message) => {
                if(message.receiver == userInfo.room){
                    usersMissedMessages.push(message);
                    this.allMissedMessages.splice(this.allMissedMessages.indexOf(message), 1);
                }
            });
            socket.join(userInfo.room, (err) => {
                if(err){
                    console.log(err);
                }else{
                    this.io.to(userInfo.room).emit('missed messages', usersMissedMessages);
                }
            });
        });
    }

    /**
     * Handler for when the send message event is emitted by the socket.
     * @param {Object} socket 
     */
    handleSendMsgEvent(socket){
        socket.on('send message', (message) => {
            //store message before sending via socket
            var socketInRoom = this.io.sockets.adapter.rooms[message.receiver] 
            if(!socketInRoom || socketInRoom.length <= 0){
                allMissedMessages.push(message);
            }else{
                this.io.to(message.receiver).emit('chat message', {
                    'receiver': message.receiver,
                    'sender':message.sender,
                    'message': message.message
                });
            }
            this.DB.storeMessage(message.sender, message.receiver, message.message);
            this.DB.addMessageNotification(message.receiver, message.sender);
        });
    }

    /**
     * Handler for when the add notification event is emitted by the socket.
     * @param {Object} socket 
     */
    handleAddNotificationEvent(socket){
        socket.on('add notification', (notification) => {
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
            this.handleSendMsgEvent(socket);
            this.handleAddNotificationEvent(socket);
        });
    }
}

module.exports = Socket;