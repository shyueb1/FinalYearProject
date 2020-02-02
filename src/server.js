    const express = require('express');
    const app = express();
    // const WebSocket = require('ws');
    const path = require('path');
    const flash = require('connect-flash');
    const bodyParser = require('body-parser');
    //routers
    // const controllers = require('./routes/notification');
    const Socket = require('./services/Socket');
    // const accountRoute = require('./routes/account');
    // const messageRoute = require('./routes/message');
    // const notificationRoute = require('./routes/notification');
    // const itemRoute = require('./routes/item');

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
    //{origin: 'http://127.0.0.1:3000'}
    //Adding routes
    // controllers.set(app);
    // accountRoute.set(app);
    // messageRoute.set(app);
    // itemRoute.set(app);
    // notificationRoute.set(app);
    app.use('/push', require('./routes/push'));
    app.use('/api/item', require('./api/item'));
    app.use('/api/account', require('./api/account'));

    function initServer(){
        const server = app.listen(3001, function(){
            console.log('Server started on port 3001.');
        });
        //Socket to handle real time communication via web sockets
        const io = new Socket(server);
        // const wss = new WebSocket.Server({
        //     port: 8080,
        //     perMessageDeflate: {
        //       zlibDeflateOptions: {
        //         // See zlib defaults.
        //         chunkSize: 1024,
        //         memLevel: 7,
        //         level: 3
        //       },
        //       zlibInflateOptions: {
        //         chunkSize: 10 * 1024
        //       },
        //       // Other options settable:
        //       clientNoContextTakeover: true, // Defaults to negotiated value.
        //       serverNoContextTakeover: true, // Defaults to negotiated value.
        //       serverMaxWindowBits: 10, // Defaults to negotiated value.
        //       // Below options specified as default values.
        //       concurrencyLimit: 10, // Limits zlib concurrency for perf.
        //       threshold: 1024 // Size (in bytes) below which messages
        //       // should not be compressed.
        //     }
        //   });
        //   wss.on('connection', (socket) => {
        //       console.log("connection to "+socket);
        //       socket.send("hi");
        //   })
        //   wss.onmessage = (e) => {
        //       console.log(e);
        //   }

        //   function originIsAllowed(origin) {
        //     return true;
        //    }
           
        //    wss.on('request', function(request) {
        //        if (!originIsAllowed(request.origin)) {
        //          request.reject();
        //          console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        //          return;
        //        }
           
        //        var connection = request.accept('*', request.origin);
        //        console.log((new Date()) + ' Connection accepted.');
        //        connection.on('message', function(message) {
        //            console.log(message);
        //            connection.sendBytes(message);
           
        //        });
        //        connection.on('close', function(reasonCode, description) {
        //            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        //        });
        //    });
    }
    
    initServer();
    

    