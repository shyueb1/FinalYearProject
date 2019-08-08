const pool = require('pg').Pool;
require('dotenv').config(); //To get environment variables
var DB; 

module.exports = getDatabase();

function getDatabase() {
    if (typeof DB === 'undefined') {
        createInstance();
    }
    return DB;
}

function createInstance() {
    DB = new pool({
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: 5432,
        host: process.env.PGHOST,
        ssl: true
    });
    DB.connect();
    console.log("DB connection created.");
    return DB;
};

// function Database(){
//     var DB = getDatabase();
//     this.query = (query, callback) => { 
//         return DB.query(query, callback);
//     };
// };