const pool = require('pg').Pool;
require('dotenv').config(); //To get environment letiables

class DB{

    /**
     * Constructs a singleton database instance.
     * @returns singleton database instance.
     */
    constructor(){
        //Singleton pattern
        this.DB = this.getDatabase();
        return this.DB;
    }

    /**
     * Creates a database pool connection.
     * @returns database connection.
     */
    createInstance() {
        this.DB = new pool({
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            port: 5432,
            host: process.env.PGHOST,
            ssl: true
        });
        this.DB.connect();
        return this.DB;
    };

    /**
     * Creates a database instance if there isn't one.
     * @returns database connection.
     */
    getDatabase() {
        if (typeof this.DB === 'undefined') {
            this.createInstance();
        }
        return this.DB;
    }

    /**
     * Gets the current date.
     * @returns a String with the date formatted.
     */
    getDateNow(){
        let date =  new Date();
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let milliseconds = date.getMilliseconds();
        let timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        return timestamp;
    }
}
module.exports = DB;