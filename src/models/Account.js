const bcrypt = require('bcryptjs');
const saltRounds = 10;

class Account{

    constructor(databaseConnection){
        this.DB = databaseConnection;
    }
    
    /**
     * Gets the email associated with a username.
     * @param {String} username 
     * @returns a promise which then gives the user's email.
     */
    getUserEmail(username){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT user_email FROM users WHERE user_name=($1);', [username], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows[0]);
                }
            });
        });
        return promise;
    }

    /**
     * Gets the email associated with a username.
     * @param {String} username 
     * @returns a promise which then gives the user's email.
     */
    getUserByEmail(email){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM users WHERE user_email=($1);', [email], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows[0]);
                }
            });
        });
        return promise;
    }

    /**
     * Finds a user by username or creates a user if one with the username couldn't be found.
     * @param {Object} info Object containing the users information.
     * @param {CallableFunction} callback 
     * @returns a callback with either an error or the user object,
     */
    findOrCreate(info, callback){
        var name = info.name;
        this.DB.query('SELECT * FROM users WHERE user_name=($1);', [name], (err, result) => {
            if(err){
                return callback(err);
            }else{
                if(result.rowCount <= 0){
                    this.DB.query("INSERT INTO users(user_name) VALUES($1) RETURNING user_id;", [name], (err, result) => {
                        var user = {
                            user_id: result.rows[0].user_id,
                            user_name: name
                        }
                        if(err){
                            return callback(err, user);
                        }else{
                            return callback(err, user);
                        }
                    });
                }else{
                    var user = {
                        user_id: result.rows[0].user_id,
                        user_name: result.rows[0].user_name,
                    }
                    return callback(err, user);
                }
            }
        });
    }

    /**
     * Checks if there is an account with the email or username provided.
     * @param {String} email 
     * @param {String} username 
     * @param {CallableFunction} callback 
     * @returns a callback with an error or the result of the query.
     */
    checkEmailAndUsernameAvailability( email, username, callback){
        this.DB.query("SELECT * FROM users WHERE user_email=$1 OR user_name=$2;", [email, username], (err, result) => {
            if(err){
                callback(err, result);
            }else{
                callback(err, result);
            }
        });
    }

    /**
     * Checks if there is an account with the email or username provided.
     * @param {String} email 
     * @param {String} username 
     * @returns a promise with an error or the result of the query.
     */
    checkEmailAndUsernameFree(email, username){
        const promise = new Promise((resolve, reject) => {
            this.DB.query("SELECT * FROM users WHERE user_email=$1 OR user_name=$2;", [email, username], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    if(result.rowCount == 0){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }
            });
        });
        return promise;
    }

    /**
     * Creates a new user account and stores it within the database.
     * @param {String} firstname 
     * @param {String} lastname 
     * @param {String} username 
     * @param {String} password 
     * @param {String} email 
     * @param {String} callback 
     * @returns a callback with either an error or true if the insertion into the database was successful.
     */
    addAccount(firstname, lastname, username, password, email, callback){
        //Create hash and store in db
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                this.DB.query("insert into users(first_name, last_name, user_name, user_pass, user_email, user_role) values ($1, $2, $3, $4, $5, $6);",[firstname, lastname, username, hash, email, 'customer'], (err, result) => {
                    if(err){
                        callback(err);
                    }else{
                        callback(true);
                    } 
                });
            });
        });
    }

    /**
     * Creates a new user account and stores it within the database.
     * @param {String} firstname 
     * @param {String} lastname 
     * @param {String} username 
     * @param {String} password 
     * @param {String} email 
     * @returns a promise with either an error or true if the insertion into the database was successful.
     */
    setAccount(firstname, lastname, username, email, password){
        const self = this;
        const promise = new Promise((resolve, reject) => {
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    self.DB.query("insert into users(first_name, last_name, user_name, user_pass, user_email, user_role) values ($1, $2, $3, $4, $5, $6);",[firstname, lastname, username, hash, email, 'customer'], (err, result) => {
                        if(err){
                            reject(err);
                        }else{
                            resolve(true);
                        } 
                    });
                });
            });
        });
        return promise;
    }

    /**
     * Gets the chat messages for the given user.
     * @param {String} username 
     * @returns a promise which will resolve to rows corresponding to chat messages.
     */
    getUsersChats(username){
        var promise = new Promise((resolve, reject) => {
            this.DB.query(`SELECT DISTINCT ON (chat_id) *
                    FROM (SELECT * 
                            FROM (select * from chat where user_one=($1) or user_two=($1)) AS x 
                            INNER JOIN message ON chat_id = part_of_chat) AS y;`, [username], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets the messages from a chat with the given chat ID.
     * @param {Integer} chatID 
     * @returns a promise that resolves to rows containing each message.
     */
    getChatMessages(chatID){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM message WHERE part_of_chat = ($1);', [chatID], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets the notifications for the given user.
     * @param {String} username
     * @returns a promise that resolves to rows containing each notification.
     */
    getUserNotifications(username){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM notifications WHERE notification_for = ($1) ORDER BY sent_at desc;', [username], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }

    /**
     * Gets the hashed password for the given email.
     * @param {String} email 
     * @returns a promise that resolves to a row containing the hashed password.
     */
    getUserPassword(email){
        var promise = new Promise((resolve, reject) => {
            this.DB.query("SELECT user_pass, user_name FROM users WHERE user_email= $1;", [email], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Gets the information for a given user by it's ID.
     * @param {Integer} id
     * @returns a promise that resolves to a row containing all the users information.
     */
    getUserByID(id){
        var promise = new Promise((resolve, reject) => {
            this.DB.query("SELECT user_id, user_name, user_email, user_role FROM users WHERE user_id = $1", [id], (err, result) => {
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Gets a users information from a given email and password.
     * @param {String} email 
     * @param {String} password
     * @returns a promise that resolves to a row containing the users information.
     */
    getUserByEmailAndPassword(email, password){
        var promise = new Promise((resolve, reject) => {
            this.DB.query("SELECT user_id, user_name, user_email, user_role FROM users WHERE user_email=$1 AND user_pass=$2", [email, password], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });
        return promise;
    }

    /**
     * Gets a users ID from their username.
     * @param {String} user 
     * @returns a promise that resolves to a row containing the users ID.
     */
    getUserID(user){
        var promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT user_id FROM users WHERE user_name = ($1);', [user], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result.rows);
                }
            });
        });
        return promise;
    }
}

module.exports = Account;