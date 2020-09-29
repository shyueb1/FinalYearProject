    const express = require('express');
    const app = express();
    const path = require('path');
    const flash = require('connect-flash');
    const bodyParser = require('body-parser');
    const Socket = require('./services/Socket');

    //ejs settings
    app.engine('ejs', require('express-ejs-extend'));
    app.set('view engine', 'ejs');

    //static file location and stylesheets
    app.use('/images', express.static(path.join(__dirname + '/static/images')));
    app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
    app.use('/sounds', express.static(path.join(__dirname + '/static/sounds')));
    app.use('/styles', express.static(path.join(__dirname + '/static/styles')));
    app.use('/js', express.static(path.join(__dirname + '/static/js')));
    
    //plugins
    app.use(flash());
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "ws://localhost:3000"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    const cors = require('cors');

    // use it before all route definitions
    app.use(cors({
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
      })); 
    app.use('/push', require('./routes/push'));
    app.use('/api/item', require('./api/item'));
    app.use('/api/account', require('./api/account'));

    function initServer(){
        const server = app.listen(3001, function(){
            console.log('Server started on port 3001.');
        });
        //Socket to handle real time communication via web sockets
        const io = new Socket(server);
    }
    
    initServer();
    

    