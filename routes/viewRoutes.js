const express = require('express');
const router = express.Router();
const { protect, isLoggedIn } = require('../controllers/authController');

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
} = require('../controllers/viewsController');

//this will run on every route below it
// router.use(isLoggedIn);

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getAccount);

module.exports = router;
