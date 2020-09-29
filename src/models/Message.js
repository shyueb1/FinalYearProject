class Message{
    constructor(databaseConnection){
        this.DB = databaseConnection;
    }

    /**
     * Gets the chats the user is involved in.
     * @param {String} user 
     * @returns a promise that resolves to rows containing chats the user participated in.
     */
    getUsersChats(user){
        let promise = new Promise((resolve, reject) => {
            this.DB.query(`SELECT DISTINCT ON (part_of_chat) * FROM (SELECT * FROM (SELECT * FROM chat WHERE user_one=($1) or user_two=($1)) AS X INNER JOIN message ON part_of_chat=chat_id ORDER BY date_posted) AS Y;`, [user], (err, result) => {
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
     * Checks if there exists a chat that the users are in together.
     * @param {String} sender 
     * @param {String} receiver 
     * @returns a promise that resolves to an error or a row containing the chat ID for the chat they are in together.
     */
    checkIfChatExists(sender, receiver){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT chat_id FROM chat WHERE user_one=($1) AND user_two=($2) OR user_one=($2) AND user_two=($1);', [sender, receiver], (err, result) => {
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
     * Creates a new chat for the given users.
     * @param {String} sender 
     * @param {String} receiver 
     * @returns a promise that resolves to an error or a row containing the chat ID.
     */
    makeNewChat(sender, receiver){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('INSERT INTO chat(user_one, user_two) VALUES ($1, $2) RETURNING chat_id;', [sender, receiver], (err, result) => {
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
     * Adds a message to the specified chat.
     * @param {String} sender 
     * @param {String} receiver 
     * @param {String} message 
     * @param {Date} date 
     * @param {Integer} chatID 
     * @returns a promise that resolves to an error or the rows containing the chat message.
     */
    addMessageToChat(sender, receiver, message, date, chatID){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('INSERT INTO message(sender, receiver, message, date_posted, part_of_chat) VALUES ($1, $2, $3, $4, $5);', [sender, receiver, message, date, chatID], (err, result) => {
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
     * Adds a message to a chat or creates the chat.
     * @param {String} sender 
     * @param {String} receiver 
     * @param {String} message 
     * @returns a promise that resolves to function that creates a chat then adds the message or adds the mssage to a chat.
     */
    storeMessage(sender, receiver, message){
        let date = this.getDate();
        this.checkIfChatExists(sender, receiver)
        .then((result) => {
            if(result.length != 0){
                let chatID = result[0].chat_id;
                return this.addMessageToChat(sender, receiver, message, date, chatID);
            }else{
                //Make the chat
                this.makeNewChat(sender, receiver)
                .then((result) => {
                    let chatID = result[0].chat_id;
                    return this.addMessageToChat(sender, receiver, message, date, chatID);
                })
                .catch((err) => {
                    console.log(err);
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
    };

    /**
     * Gets all of the users sent messages.
     * @param {String} username 
     * @returns a promise that resolves to rows containing the users sent messages.
     */
    getUsersSentMessages(username){
        let promise = new Promise((resolve, reject) => {
            this.DB.query('SELECT * FROM message where sender=($1) ORDER BY date_posted desc;', [username], (err, result) => {
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
     * Returns the current date as a timestamp in string format.
     */
    getDate(){
        let date =  new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let milliseconds = date.getMilliseconds();
        let timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        return timestamp;
    }

}

module.exports = Message;