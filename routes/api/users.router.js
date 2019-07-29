'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

const usersController = require('../../controllers/users.controller');

// ...test route
router.get('/', function(req, res) {
  res.json({ message: 'hooray! ...and welcome to my users api!' });
});

/**
 * @route POST api/users/register
 * @description Register new user
 * @access Public
 */
router.post('/register', usersController.registerUser);

/**
 * @route POST api/users/login
 * @description Sign in new user
 * @access Public
 */
router.post('/login', usersController.loginUser);

/**
 * @route GET api/users/confirmation
 * @description Confirm user signup process
 * @access Public
 */
router.post('/confirmation', usersController.confirmUser);

/**
 * @route GET api/users/dashboard
 * @description Route user to the dashboard
 * @access Private
 */
router.get(
  '/dashboard',
  passport.authenticate('jwt', { session: false }),
  usersController.showDashboard
);

module.exports = router;
