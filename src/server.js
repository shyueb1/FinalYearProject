    const express = require('express');
    const app = express();
    const path = require('path');
    const flash = require('connect-flash');
    const bodyParser = require('body-parser');
    //routers
    const controllers = require('./routes/notification');
    const Socket = require('./services/Socket');
    const accountRoute = require('./routes/account');
    const messageRoute = require('./routes/message');
    const notificationRoute = require('./routes/notification');
    const itemRoute = require('./routes/item');

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

    const cors = require('cors');

    // use it before all route definitions
    app.use(cors({origin: 'http://127.0.0.1:3000'}));

    //Adding routes
    controllers.set(app);
    accountRoute.set(app);
    messageRoute.set(app);
    itemRoute.set(app);
    notificationRoute.set(app);
    app.use('/push', require('./routes/push'));

    function initServer(){
        const server = app.listen(3000, function(){
            console.log('Server started on port 3000.');
        });
        //Socket to handle real time communication via web sockets
        const io = new Socket(server);
    }
    
    initServer();
    

    