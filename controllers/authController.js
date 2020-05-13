const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  //creating a new user with the results from req.body
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      user: newUser,
    },
  });
});
