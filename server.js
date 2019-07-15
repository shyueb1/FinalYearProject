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

controllers.set(app);

// (() => {
//         DB.query("insert into item_images(key, item) values (10, 1); select image_id from item_images;", (err, res)=>{
//             res.forEach(element => {
//                 console.log(element.rows);
//             });
//         });
//     }
// )();

app.listen(3000, function(){
    console.log('Server started on port 3000.');
});

