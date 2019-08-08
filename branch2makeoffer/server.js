const express = require('express');
const app = express();
const path = require('path');
const controllers = require('./controllers/index');
//Get DB singleton
const DB = require('./controllers/db');

//ejs settings
app.engine('ejs', require('express-ejs-extend'));
app.set('view engine', 'ejs');

//static file location and stylesheets
app.use('/images', express.static(path.join(__dirname + '/images')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const cors = require('cors');

// use it before all route definitions
app.use(cors({origin: 'http://127.0.0.1:3000'}));


controllers.set(app);
  

app.listen(3000, function(){
    console.log('Server started on port 3000.');
});



