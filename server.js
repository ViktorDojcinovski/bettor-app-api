'use strict';

// Base setup of the backend app
require('dotenv').config();
// Call the dependencies for our REST server:
// 1. call express
const express = require('express');
// 2. define our app using express
const app = express();
// 3. allow us to pull POST content from  our HTTP request
const bodyParser = require('body-parser');
// 4. make promise of every callback that you expect
const { promisify } = require('util');
// 5. dodge that obnoxios CORS confinement
const cors = require('cors');
// 6. set the path variable
const path = require('path');
// 7. import passport library
const passport = require('passport');

// Middlewares
// ...always use cors middleware before routing
app.use(cors());
// ...form data middleware
app.use(bodyParser.urlencoded({ extended: false }));
// ...json body middleware
app.use(bodyParser.json());
// ...setup static directory
app.use(express.static(path.join(__dirname, 'public')));
// ...initialize passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Connect to database
const db_connect = require('./dbconnect');
// ...bind connection to error event
db_connect.on('error', console.error.bind(console, 'DB connection error.'));

// Register routes
const users = require('./routes/api/users.router');
app.use('/api/users', users);

// Start the server
// ...set our port
const port = process.env.PORT || 8001;

const startServer = async() => {
  await promisify(app.listen).bind(app)(port);
  console.log(`Magic happens on port ${port}`);
};

startServer();
