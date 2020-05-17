const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllTours,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');

const reviewRouter = require('../routes/reviewRoutes');

//mounting a router
//we are saying here, that the tour router should use the review router if it encounters this endpoint
//the review router doesn't get access to the tourId, we do that in reviewRoutes.js with merge params
//this will now hit .route('/')
router.use('/:tourId/reviews', reviewRouter);

// router.param("id", checkID);

router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getAllTours).post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
