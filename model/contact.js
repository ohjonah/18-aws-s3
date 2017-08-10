'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = Schema({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  phone: { type: Number, required: true },
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('contact', contactSchema);