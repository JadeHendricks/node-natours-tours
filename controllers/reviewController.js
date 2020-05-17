const Review = require('../models/reviewModel');
const catchAsync = require('../utilities/catchAsync');
const factory = require('./handlerFactory');

//this will also get called automatically when we create a review on the tour, because of the mounted router in tourRoutes
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  //will only find the reviews of the tour matching the id else if filter is empty, it will find all reviews
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //req.user - we get this from the protect middleware
  // if there are things on the body that are not in the schema it will be ignored
  const newReview = await Review.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.deleteReview = factory.deleteOne(Review);
