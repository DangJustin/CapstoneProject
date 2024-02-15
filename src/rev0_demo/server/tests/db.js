const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');

let mongoServer = null;

// Connect to database
module.exports.connect = async () =>{
    mongoServer = await MongoMemoryServer.create();
    const uri =  mongoServer.getUri();
    await mongoose.connect(uri);
}

// Disconnect from database after tests are complete
module.exports.disconnect = async () => {
    if (mongoServer){
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    }
};
 
 
// Clear database after each test
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections){
        const collection = collections[key];
        await collection.deleteMany();
    }
}