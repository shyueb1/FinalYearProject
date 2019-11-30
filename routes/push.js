const express = require('express');
const router = express.Router();
const webpush = require('web-push');
// const path = require('path');
const pubVKey = 'BIoFhC7ZHCi_r6FXGAm3KrrTqWNXnpvlUKJyXJpNOEPTJuZ3Rn0KeV7oaX7yvM9IbxjEzTky7TFuecks3VTewQU';
const privVKey = 'rJQXmGe-Q2a7lU9_B7WstRr77pQanA61JPG32dI_ZIE';

webpush.setVapidDetails('mailto:shyueb@hotmail.co.uk', pubVKey, privVKey);

/**
 * Endpoint that subscribes a client to push notifications.
 */
router.post('/subscribe', (req, res) => {
    //Get push subscription obj
    const subscription = req.body.subscription;
    const payload = req.body.msg;
    //send status 201 - resource made
    res.status(201).json({});
    webpush.sendNotification(subscription, payload).catch(err => console.log(err));

});

module.exports = router;