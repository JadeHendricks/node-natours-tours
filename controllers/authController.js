const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  //creating a new user with the results from req.body
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //creating a token using the users ID
  //the token header will be created automatically
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  //pass the token back to automatically log in the user
  //because on register we do not ahve to check or match any data in the database, this is only done on login
  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser,
    },
  });
});
