const pool = require('pg').Pool;
require('dotenv').config(); //To get environment variables

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
            user: "piokorpxelpjjr",
            password: "be3bde01afc8334703981300318a55f44d562cd5934cf5a3a4dc432fe04816cf",
            database: "d7mbcvj2vn80d",
            port: 5432,
            host: "ec2-54-217-234-157.eu-west-1.compute.amazonaws.com",
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
        var date =  new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        return timestamp;
    }
}
module.exports = DB;