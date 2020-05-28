const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const multer = require('multer');
const factory = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    //first argument is an error or if not just null, then the destination
    callback(null, 'public/img/users');
  },
  filename: (req, file, callback) => {
    //making the image names unique
    //get the name of the current file
    const extension = file.mimetype.split('/')[1];
    //req.user.id = id of the currently logged in user
    callback(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  },
});

//test if the uploaded file is an image
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload only images', 400),
      false
    );
  }
};

//configure a multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  // req.params.id the get one factory function is gonna use this, so we need to change it to the user that we are logged in with
  // the protect middleware adds the req.user.id because fo the token
  req.params.id = req.user.id;
  next();
};

//Do not update passwords with this (updateOne)
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if the user tries to update the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updateMyPassword',
        400
      )
    );
  }

  //2) Filter out unwanted field names, that are not allowed to be updated
  //body.role='admin' - prevent this  with "filteredBody"
  const filteredBody = filterObj(req.body, 'name', 'email');
  //if there is a req.file we can use it here to update it to the db via filteredBody
  if (req.file) filteredBody.photo = req.file.filename;

  //3) Update the user document
  //we can use findByIdAndUpdate, because we are not working with sensitive data here, takes in the ID: DATA to change: Options
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // returns the new updated object instead of the old one
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser,
    },
  });
});

//deactivate users account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'Success',
//     results: users.length,
//     data: {
//       tours: users,
//     },
//   });
// });
