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
    select: false,
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
  passwordChangedAt: Date,
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

//instance method
// a method that's going to be available in all documents of user
//Check if password received and password in the DB matches
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //this points to the current document, but password is not available because of select: false
  return await bcrypt.compare(candidatePassword, userPassword);
};

//checking to see whether the user has changed the password after recieving the Token
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //checks if that property exists for the user
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //false means not changed
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
