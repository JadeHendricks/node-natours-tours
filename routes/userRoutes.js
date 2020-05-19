const express = require('express');
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
} = require('../controllers/userController');
const {
  signup,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);
//settign the user,id in the the params id, that's why we camm, getMe and then getUser in that order
// faking like the id is coming from the URL when it is actually not
router.get('/me', protect, getMe, getUser);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
