'use strict';
require('dotenv').config();

// ...import the mongoose module
const mongoose = require('mongoose');

// ...destructure connection credentials from the .env file
const { MONGO_DB_CONN } = process.env;

// ...set up default mongoose connection
const mongoDB = MONGO_DB_CONN;
mongoose.connect(mongoDB, { useNewUrlParser: true })
  .then(result => {
    console.log(`Connected succesfully to ${mongoDB}`);
  })
  .catch(err => {
    console.log(err);
  });

// ...get Mongoose to use the global promise library
mongoose.Promise = global.Promise;

module.exports = mongoose.connection;
