const express = require('express');
//this is kind of like a mini application, so just like the regular app, we can use middleware on this router aswell
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
} = require('../controllers/userController');
const {
  signup,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//so now this will protect all the routes that come after this line,
//because this will be the next middleware in the stack
router.use(protect);
router.patch('/updateMyPassword', updatePassword);
//settign the user,id in the the params id, that's why we camm, getMe and then getUser in that order
// faking like the id is coming from the URL when it is actually not
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
