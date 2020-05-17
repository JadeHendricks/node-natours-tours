const mongoose = require('mongoose');
//schema-model
//a blueprint for us to us to create documents, we create models from mongoose schemas
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true }, //show virtual data, aka field not in the db, but fields that show from calculations or on query
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour', //name of the field we want to replace
  //   select: 'name', // only get the name and nothing else
  // }).populate({
  //   path: 'user', //name of the field we want to replace
  //   select: 'name photo', // only get the name and photo
  // });
  this.populate({
    path: 'user', //name of the field we want to replace
    select: 'name photo', // only get the name and photo
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
