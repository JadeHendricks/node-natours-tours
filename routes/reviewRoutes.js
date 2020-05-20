const express = require('express');
//by default each router only has access to their specific parameters
//but '/' this does not have a tourId so we use merge params in order to access toursId from tourRoutes
//this is kind of like a mini application, so just like the regular app, we can use middleware on this router aswell
const router = express.Router({ mergeParams: true });
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setTourAndUserIds,
} = require('../controllers/reviewController');

router.use(protect);
router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourAndUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
