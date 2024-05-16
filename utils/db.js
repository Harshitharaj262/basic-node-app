const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:admin1234@node-app.ofw4lzs.mongodb.net/?retryWrites=true&w=majority&appName=node-app";

let _db;

const mongoconnect =(callback)=>{
    MongoClient.connect(uri)
    .then(client=>{
        console.log('Connected to Mongo');
        _db=client.db();
        callback(client);
    }).catch(err=>{
        console.log(err);
        throw err;

    })

}

const getDB = () =>{
    if(_db){
        return _db
    }
    throw "No database found"
}

module.exports.mongoconnect = mongoconnect;
module.exports.getDB = getDB;


