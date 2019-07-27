const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const User = require('../models/User.model');

exports.registerUser = (req, res, next) => {
  console.log(req.body);
  let { name, lastname, email, password, confirm_password } = req.body;
  //...check if all required fields are there
  if (!name || !lastname || !email) {
    return res.status(400).json({
      message: "Some of the required fields are missing."
    })
  }
  //...check if confirmed password matches password
  if (password !== confirm_password) {
    return res.status(400).json({
      message: "Confirm password does not match the password."
    })
  }
  //...check if the password is unique
  User.findOne({ email }).then(user => {
    if (user) {
      return res.status(400).json({
        message: "Sorry! Email is already taken."
      })
    }
  })
  //...all is valid ...register the user
  let newUser = new User({
    name,
    lastname,
    password,
    email
  })
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save().then(user => {
        return res.status(201).json({
          success: true,
          message: "User is now registered"
        })
      })
    })
  })
}

exports.loginUser = (req, res, next) => {
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (!user) {
      return res.status(404).json({
        message: "Email is not found",
        success: false
      })
    }
    //...if there is a user with that email
    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if (isMatch) {
        //...password correct ...send jwt
        const { SECRET } = process.env;
        const key = SECRET;
        const payload = {
          _id: user._id,
          name: user.name,
          lastname: user.lastname,
          email: user.email
        }
        jwt.sign(payload, key, { expiresIn: 3600 }, (err, token) => {
          res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            message: "You are successfully logged in!"
          })
        })
      } else {
        return res.status(404).json({
          message: "Incorrect password.",
          success: false
        })
      }
    })
  })
}

exports.showDashboard = (req, res, next) => {
  return res.json(req.user);
}
