const assert = require('assert');
const Database = require('../src/models/Database');
const DB = new Database();
const Account = require('../src/models/Account');
const Item = require('../src/models/Item');
const Message = require('../src/models/Message');
const Notification = require('../src/models/Notification');
const Tradeoffer = require('../src/models/Tradeoffer');

const account = new Account(DB);
const item = new Item(DB);
const message = new Message(DB);
const notification = new Notification(DB);
const tradeoffer = new Tradeoffer(DB);

describe('Database Model', function() {

  describe('#Get Singleton DB connection', function() {
    it('should return true if it is the same connection', function() {
      const database1 = new Database();
      const database2 = new Database();
      assert.equal(database1.DB, database2.DB);
    });
  });

  describe('#Query Database: valid query', function() {
    it('should return no error if the connection is valid', function(done) {
      const database1 = new Database();
        database1.query('Select * from users;', (err, result) => {
          if(err){
            console.log(err);
            done(err);
          }else{
            done();
          }
        });
    });
  });

  describe('#Query Database: Expected result', function() {
    it('should return a single row from the database', function() {
      const database1 = new Database();
      database1.query('Select * from users limit 1;', (err, result) => {
        assert.equal(result.rowCount, 1);
      });
    });
  });
  
});

describe('Account Model', () => {

  describe('#Get User email', () => {
    it('should return correct email for user', function() {
      const userEmail = 'shyueb@hotmail.co.uk';
      account.getUserEmail('shyueb123').then((result) => {
        assert.equal(result.user_email, userEmail);
      })
      .catch((err) => {
        throw new Error;
      });
    });
  });

  describe('#Find account or create', () => {
    it('should find an account', function() {
      account.findOrCreate({name:'shyueb123'}, (err, user) => {
        assert.deepEqual({user_id:12, user_name:'shyueb123'}, user);
      });
    });
  });

  describe('#Check email and username availability', () => {
    it('should return no rows', function() {
      account.checkEmailAndUsernameAvailability('s', 's', (err, result) => {
        assert.equal(result.rowCount, 0);
      });
    });
  });

  describe('#Get users chats', () => {
    it('should return no chats since invalid user', function(done){
      account.getUsersChats('s')
      .then((result) => {
        assert.equal(result.length, 0);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return chats messages', function(done){
      account.getUsersChats('shyueb123')
      .then((result) => {
        assert.equal(result.length>0, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });
  });

  describe('#Get users notifications', () => {
    it('should return no notifications', function(done){
      account.getUserNotifications('s')
      .then((result) => {
        assert.equal(result.length, 0);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return users notifications', function(done){
      account.getUserNotifications('shyueb123')
      .then((result) => {
        assert.equal(result.length>0, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });
  });

  describe('#Get users from their ID', () => {
    it('should return no users', function(done){
      account.getUserByID('-1')
      .then((result) => {
        assert.equal(result.rowCount, 0);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return correct user from their ID', function(done){
      account.getUserByID('12')
      .then((result) => {
        assert.equal(result.rows[0].user_name, 'shyueb123');
        done();
      })
      .catch((err) => {
        done(err);
      })
    });
  });

  describe('#Get user ID from their username', () => {
    it('should return no user ID', function(done){
      account.getUserID('s')
      .then((result) => {
        assert.equal(result.length, 0);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return correct user ID', function(done){
      account.getUserID('shyueb123')
      .then((result) => {
        assert.equal(result[0].user_id, 12);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });
  });
});

describe('Item Model', () => {
  describe('#Check if user owns item', () => {
    it('should return false for wrong user', function(done){
      item.isItemOwner('test123', 43)
      .then((result) => {
        assert.equal(result, false);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return true for correct user', function(done){
      item.isItemOwner('shyueb123', 43)
      .then((result) => {
        assert.equal(result, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });
  });

  describe('#Get item by ID', () => {
    it('should return no results for wrong item ID', function(done){
      item.getItemByID(-1)
      .then((result) => {
        assert.equal(result.rowCount==0, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return item ID for correct item ID', function(done){
      item.getItemByID(43)
      .then((result) => {
        assert.equal(result.rowCount>0, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });
  });

  describe('#Get users latest item posts', () => {
    it('should return no results for invalid user', function(done){
      item.getLatestItemPosts('0a')
      .then((result) => {
        assert.equal(result.length==0, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return no results for user with no items', function(done){
      item.getLatestItemPosts('demo1234')
      .then((result) => {
        assert.equal(result.length==0, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });

    it('should return latest posts for user with items', function(done){
      item.getLatestItemPosts('shyueb123')
      .then((result) => {
        assert.equal(result.length>0, true);
        done();
      })
      .catch((err) => {
        done(err);
      })
    });
  });
});

describe('Message Model', () => {
  describe('#Get users chat', () => {
    it('should get no chats for invalid user', function(done){
      message.getUsersChats('s')
      .then((result) => {
        assert.equal(result.length==0, true);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    it('should get users chats for valid user', function(done){
      message.getUsersChats('shyueb123')
      .then((result) => {
        assert.equal(result.length>0, true);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe('#Check if chat exists', () => {
    it('should return false for invalid chat participants', function(done){
      message.checkIfChatExists('x', 'y')
      .then((result) => {
        assert.equal(result.length==0, true);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    it('should return true for valid chat participants', function(done){
      message.checkIfChatExists('shyueb123', 'beuyhs123')
      .then((result) => {
        assert.equal(result.length>0, true);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe('#Get users sent messages', () => {
    it('should return no results for invalid user', function(done){
      message.getUsersSentMessages('x')
      .then((result) => {
        assert.equal(result.rowCount==0, true);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    it('should return results for valid user', function(done){
      message.getUsersSentMessages('shyueb123')
      .then((result) => {
        assert.equal(result.rowCount>0, true);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });
});

describe('Notification Model', () => {
})
