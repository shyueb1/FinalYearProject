const DB = require('./db');

module.exports.set = function(app) {
    app.post('/sendmessage', (req, res) => {
        var sender = req.user.rows[0].user_name;
        var receiver = req.body.recipient;
        var title = req.body.title;
        var message = req.body.message;
        storeMessage(sender, receiver, title, message, (err, result)=>{
            if(err){
                console.log(err);
            }else{
                req.flash('message', 'Message has been sent.');
                return res.redirect("/");
            }
        });
    });

    function storeMessage(sender, receiver, title, message, callback){
        var date =  new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        DB.query('INSERT INTO chat (sender, receiver, title, message, date_posted) VALUES ($1, $2, $3, $4, $5)', [sender, receiver, title, message, timestamp], (err, result) => {
            return callback(err, result);
        });
    };

    app.get("/yourmessages", (req, res)=>{
        var user = req.user.rows[0];
        DB.query('SELECT * FROM chat where receiver=$1 ORDER BY date_posted desc', [user.user_name], (err, result) => {
            if(err){
                console.log(err);
                req.flash('message', 'Failed to find messages');
                return res.redirect("/");
            }else{
                var privateMessages = result.rows;
                args = {
                    'privateMessages': privateMessages,
                    'user': user,
                    'message': req.flash('message')
                };
                return res.render('pages/yourmessages', args);
            }
        });
    });

    app.get("/yoursentmessages", (req, res)=>{
        var user = req.user.rows[0];
        DB.query('SELECT * FROM chat where sender=$1 ORDER BY date_posted desc', [user.user_name], (err, result) => {
            if(err){
                console.log(err);
                req.flash('message', 'Failed to find messages');
                return res.redirect("/");
            }else{
                var privateMessages = result.rows;
                args = {
                    'privateMessages': privateMessages,
                    'user': user,
                    'message': req.flash('message')
                };
                return res.render('pages/yoursentmessages', args);
            }
        });
    });
};