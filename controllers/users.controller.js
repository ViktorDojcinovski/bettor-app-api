'use strict';
require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Validator = require('node-input-validator');

const User = require('../models/User.model');
const Token = require('../models/VerificationToken.model');

async function registerUser(req, res, next) {
  const origin = req.headers.origin;
  let valid = false;
  let {
    firstname,
    lastname,
    email,
    username,
    password,
    confirm_password,
  } = req.body;
  // ...check if all required fields are there and validate format
  if (!firstname || !lastname || !email || !username) {
    return res.status(422).json({
      message: 'Some of the required fields are missing.',
    });
  }

  let validator = new Validator(req.body, {
    email: 'email',
    username: 'regex:^[A-Za-z][A-Za-z0-9_-]*$',
    password: 'regex:^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$',
  });

  await validator.check().then(function(matched) {
    if (matched) {
      valid = true;
    }
  });

  if (valid) {
    // ...check if confirmed password matches password
    if (password !== confirm_password) {
      return res.status(422).json({
        message: 'Confirm password does not match the password.',
      });
    }
    // ...check if the password is unique
    await User.findOne({ email }).then(user => {
      if (user) {
        valid = false;
      }
    });
    if (!valid) {
      return res.status(400).json({
        message: 'Sorry! Email is already taken.',
      });
    }
    // ...check if the username is unique
    await User.findOne({ username }).then(user => {
      if (user) {
        valid = false;
      }
    });
    if (!valid) {
      return res.status(422).json({
        message: 'Sorry! Username is already taken.',
      });
    }
    // ...all is valid ...register the user
    let user = new User({
      firstname,
      lastname,
      email,
      username,
      password,
    });
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return res.status(400).json({
          message: 'Problem with authentication protocol.',
        });
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) throw err;
        user.password = hash;
        user.save().then(user => {

          // Create a verification token for this user
          const token = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex'),
          });

          // Save the verification token
          token.save().then(verificationToken => {

            // Send the email
            const transporter = nodemailer.createTransport({
              service: 'Sendgrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD,
              },
            });
            const mailOptions = {
              from: 'no-reply@better.com',
              to: user.email,
              subject: 'Account Verification Token',
              text: `
              Hello, 
              Please verify your account by visiting the link: 
              ${origin}/confirmation?token=${verificationToken.token}`,
            };
            transporter.sendMail(mailOptions, function(err) {
              if (err) {
                return res.status(500).json({ message: err.message });
              };
              return res.status(400).json({
                success: true,
                message: `
                User registered.
                A verification email has been sent to ${user.email}.
                `,
              });
            });
          }).catch(err => {
            if (err) {
              return res.status(500).json({ message: err.message });
            }
          });
        }).catch(err => {
          return res.status(500).send({ message: err.message });
        });
      });
    });
  } else {
    valid = false;
    return res.status(422).json({
      message: validator.errors,
    });
  }
};

function loginUser(req, res, next) {
  User.findOne({
    username: req.body.username,
  }).then(user => {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Username is not found',
      });
    }
    // ...if there is a user with that email
    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if (isMatch) {
        // ...password correct ...send jwt
        const { SECRET } = process.env;
        const key = SECRET;
        const payload = {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          email: user.email,
        };
        // Make sure the user has been verified
        if (!user.isVerified) {
          return res.status(401).json({
            success: false,
            message: 'Your account has not been verified.',
          });
        }
        jwt.sign(payload, key, { expiresIn: 3600 }, (err, token) => {
          if (err) {
            return res.status(400).json({
              message: 'Problem with authentication protocol.',
            });
          }
          res.status(200).json({
            success: true,
            user,
            token: `Bearer ${token}`,
            message: 'You are successfully logged in!',
          });
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Incorrect password.',
        });
      }
    });
  });
};

function confirmUser(req, res, next) {
  // Find a matching token
  console.log(req.body);
  Token.findOne({ token: req.body.token }).then(token => {
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'We were unable to find a valid token.',
      });
    }
    // If we found a token, find a matching user
    User.findOne({ _id: token._userId }).then(user => {
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'We were unable to find a user for this token.',
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          message: 'This user has already been verified.',
        });
      }

      // ...no errors ...verify and save the user
      user.isVerified = true;
      user.save(function(err) {
        if (err) { return res.status(500).json({ messsage: err.message }); }
        res.status(200).json({
          success: true,
          message: 'The account has been verified. Please log in.',
        });
      });

    }).catch(err => {
      if (err) { return res.status(500).send({ message: err.message }); }
    });
  });
};

function showDashboard(req, res, next) {
  return res.json(req.user);
};

module.exports = {
  loginUser,
  registerUser,
  confirmUser,
  showDashboard,
};
