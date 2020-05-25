const express = require('express');
const router = express.Router();
const { protect, isLoggedIn } = require('../controllers/authController');

const {
  getOverview,
  getTour,
  getLoginForm,
} = require('../controllers/viewsController');

//this will run on every route below it
router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;
