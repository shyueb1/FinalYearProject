module.exports.set = function(app) {
    const Database = require('../models/Database');
    const Message = require('../models/Message');
    const DB = new Database();
    const messageModel = new Message(DB);

    /**
     * Endpoint that stores message to be sent.
     */
    app.post('/sendmessage', (req, res) => {
        var sender = req.user.rows[0].user_name;
        var receiver = req.body.recipient;
        var title = req.body.title;
        var message = req.body.message;
        messageModel.storeMessage(sender, receiver, message).then((result) => {
            req.flash('message', 'Message has been sent.');
            return res.redirect("/");
        }).catch((err) => {
            console.log(err);
            req.flash('message', 'Message failed to be sent.');
            return res.redirect("/");
        });
    });

    /**
     * Endpoint that retrieves the user's messages.
     */
    app.get("/yourmessages", (req, res)=>{
        if(req.isAuthenticated()){
            var user = req.user.rows[0].user_name;
            //Get latest message for each unique chat user is involved in
            messageModel.getUsersChats(user).then((result) => {
                var privateMessages = result;
                args = {
                    'privateMessages': privateMessages,
                    'user': req.user.rows[0],
                    'message': req.flash('message')
                };
                return res.render('pages/yourmessages', args);
            }).catch((err) => {
                console.log(err);
                req.flash('message', 'Failed to get your messages.');
                args = {
                    'user': user,
                    'message': req.flash('message')
                };
                return res.render('pages/homepage', args);
            });
        }else{
            return res.redirect('/');
        }
    });

    /**
     * Enpoint that retrieves messages the user has sent.
     */
    app.get("/yoursentmessages", (req, res)=>{
        var username = req.user.rows[0].user_name;
        messageModel.getUsersSentMessages(username)
        .then((result) => {
            args = {
                'privateMessages': result.rows,
                'message': req.flash('message')
            };
            return res.render('pages/yoursentmessages', args);
        })
        .catch((err) => {
            console.log(err);
            req.flash('message', 'Failed to find messages');
            return res.redirect("/");
        });
    });
}