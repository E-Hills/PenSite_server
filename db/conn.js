const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
var _db;
 
module.exports = {
  
  connectToServer: function (database) {
    client.connect()
    .then(
      (db) => {
        if (db) {
          _db = db.db(database);
          console.log(`Successfully connected to MongoDB database: ${database}`); 
        }
      }, 
      (dbErr) => {
        if (dbErr) throw dbErr;
      }
    );
  },
 
  getDb: function () {
    return _db;
  },
};