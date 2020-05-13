const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell use your name!'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],
    validator: [validator.isEmail, 'Please provide a valid email'],
    lowercase: true,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //custom validators only works on save and create, not on update etc
      validator: function (el) {
        return el === this.password; //el aka passwordConfirm
      },
      message: 'Passwords are not the same',
    },
  },
});

//mongoose middleware
userSchema.pre('save', async function (next) {
  //this refers to the current document in question
  //if the password has not been modified
  if (!this.isModified('password')) return next();

  //salt means that it's going to add a random string to the password, so that 2 equal passwords do not generate the same hash
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; //DELETE - only needed for validation, required input but not required in the db
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
