/**
 * @model User
 *
 * @collection Users
 * @document User
 */
'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
