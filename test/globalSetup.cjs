const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const config = require('./config.cjs');

module.exports = async function globalSetup() {
  if (config.Memory) { // Config to decide if an mongodb-memory-server instance should be used
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create();
    const uri = instance.getUri();
    global.__MONGOINSTANCE = instance;

    // Set the MongoDB URI for the tests
    process.env.MONGO_URI = uri;
    console.log('MongoDB URI:', uri);

    // Connect to the in-memory database
    const conn = await mongoose.connect(uri, config.db.options);
    // Clean the database
    await conn.connection.db?.dropDatabase();
    await mongoose.disconnect();
  } else {
    // Connect to the specified database
    const conn = await mongoose.connect(config.db.uri, config.db.options);
    await conn.connection.db?.dropDatabase();
    await mongoose.disconnect();
  }
};