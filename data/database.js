const { MongoClient } = require('mongodb');
let _db;
const mongoConnnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://Richard:azubike88@cluster0.4eqaw.mongodb.net/node-complete?retryWrites=true&w=majority'
  )
    .then((client) => {
      console.log('Database connected ');
      _db = client.db()
      callback();
    })
    .catch((err) => {
      console.log(err)
      throw err
    });
};

const getDb = ()=>{
  if(_db){
    return _db
  }
  throw new Error('No db instance ')
}

module.exports = {mongoConnnect , getDb};
