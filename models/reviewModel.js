const mongoose = require('mongoose');
const Tour = require('./tourModel');
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

//each combination of tour and user always has to be unique IS BEING SET HERE
reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true,
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

//creating a static method
//takes in a tour ID
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //using the aggregation pipeline
  //this points to the current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, //select the tour that we actually want to update
    },
    {
      $group: {
        _id: '$tour', //grouping all the tours together by tour
        nRatings: { $sum: 1 }, //for each review found it will add one resulting in a total return
        avgRating: { $avg: '$rating' }, //calculate the average
      },
    },
  ]);

  //find the current tour by Id and update it
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//wait before things are saved to the DB and then do the calculation with post
//the post method does not get access to next()
reviewSchema.post('save', function () {
  //this points to the current document/review
  //this.constructor is the model that created the document it is a workaround for using the model before it is defined
  this.constructor.calcAverageRatings(this.tour);
});

//findOneAndUpdate
//findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //the goal here is to get access to the current review document, but in this method the this keyword is the current query
  //so we need to execute a query in order to get access to the document that is currently being processed (findOne)
  this.r = await this.findOne(); //review trick to pass it from pre to post
  next();
});

//this will fire after the review has been updated
reviewSchema.post(/^findOneAnd/, async function () {
  //this.r = await this.findOne(); does NOT work here, the query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour); //passing the tour id from this.r = which is the review
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
