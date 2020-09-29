const express = require('express');
const router = express.Router();
const Database = require('../models/Database');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const DB = new Database();
const account = new Account(DB);
const notification = new Notification(DB);
const messageStore = new Message(DB);
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.post('/createuser', (req, res) => {
    const { firstname, surname, username, email, password } = req.body;
    account.checkEmailAndUsernameFree(email, username)
    .then((available) => {
        if(available){
            account.setAccount(firstname, surname, username, email, password)
            .then((created) => {
                if(created){
                    res.status(200).json({
                        "status": true, 
                        "newUser": username 
                    });
                }else{
                    res.status(200).json({"status":true});
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({"status":false});
            })
        }else{
            res.status(200).json({"status":false});
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({"error": "server error"});
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    //Check username and password valid
    account.getUserPassword(email)
    .then((result) => {
        //if there is an account with that email
        if(result.rowCount > 0){
            let storedHashPassword = result.rows[0].user_pass;
            bcrypt.compare(password, storedHashPassword, (err, match) => {
                if(err){
                    console.log(err);
                    res.status(500);
                }else{
                    if(match){
                        //create jwt and send it
                        const payload = {
                            'email': email
                        }
                        const token = jwt.sign(payload, process.env.PRIVATE_KEY, { expiresIn: 1800 });
                        res.status(200).json({
                            'token': token,
                            'user': result.rows[0].user_name,
                            'error': false
                        });
                    }else{
                        res.status(200).json({'error': 'Incorrect credentials.'});
                    }
                }        
            });
        } else {
            res.status(200).json({'error':'Account doesn\'t exist.'});
        }
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

router.post('/authorizeuser', auth, (req, res) => {
    if(req.isAuthenticated){
        res.status(200).json({
            'authorized':true,
            'user': req.user
        });
    }else{
        res.status(200).json({
            'authorized':false
        });
    }
});

router.get('/allchats', auth, (req, res) => {
    if(req.isAuthenticated){
        const user = req.user.username;
        account.getUsersChats(user).then((usersChats) => {
            //Creating array of the users the person has a conversation with
            let chatPersons = [];
            for(let i = 0; i < usersChats.length; i++){
                if(usersChats[i].user_one != user){
                    chatPersons.push(usersChats[i].user_one);
                }else{
                    chatPersons.push(usersChats[i].user_two);
                }
            }
            //Getting the chat messages
            let chatMessagePromises = [];
            let groupedChats = []
            usersChats.forEach((chat) => {
                let chatMessages = account.getChatMessages(chat.chat_id);
                chatMessagePromises.push(chatMessages);
                groupedChats.push([chatMessages]);
            });
            Promise.all(chatMessagePromises).then((allChatMessages) => {
                let allGroupedChats = [];
                for(let i = 0; i < groupedChats.length; i++){
                    allGroupedChats.push(groupedChats[i][0]);
                }
                Promise.all(allGroupedChats).then((result) => {
                    res.status(200).json({
                        'chatParticipants': chatPersons,
                        'chatMessages': result
                    });
                });
            });
        })
    }else{
        res.status(400).json({'error': 'user not authenticated'});
    }
});

router.get('/allnotifications', auth, (req, res) => {
    if(req.isAuthenticated){
        account.getUserNotifications(req.user.username)
        .then((result) => res.status(200).json(result))
        .catch((err) => res.status(500).json({
            'status': 'failed',
            'error': err
        }));
    }else{
        res.status(500).json({
            'status': 'failed',
            'error': 'user not authenticated'
        });
    }
});

router.post('/sendmessage', auth, (req, res) => {
    const { sender, receiver, message } = req.body;
    if(req.isAuthenticated){
        messageStore.storeMessage(sender, receiver, message);
        res.status(200).json({'status': 'successful'});
    }else{
        res.status(400).json({'error': 'user not authorized'});
    }
});

router.get('/notifications/:id', auth, (req, res) => {
    console.log("Removing users notifications"+ req.params.id);
    const maxId = req.params.id;
    if(req.isAuthenticated){ 
        notification.setAllNotificationsRead(req.user.username, maxId)
        .then((response) => {
            res.status(200).json({'status': 'successful'});
        })
        .catch((err) => res.status(500).json({'error': 'server error'}));
    }
});

module.exports = router;