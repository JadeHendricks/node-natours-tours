const Review = require('../models/reviewModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // if there are things on the body that are not in the schema it will be ignored
  const newReview = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
