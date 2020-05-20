const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//schema-model
//a blueprint for us to us to create documents, we create models from mongoose schemas
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be less or equal to 40 characters'],
      minlength: [10, 'A tour name must be less or equal to 10 characters'],
      // validate: [validator.isAlpha, "Tour name must only contain characters"]
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty should be: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below or equal to 5'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          //only works on a new document and not on update
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GEOJSON - to specify geospacial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', //creating a reference from User
      },
    ],
  },
  {
    toJSON: { virtuals: true }, //show virtual data, aka field not in the db, but fields that show from calculations or on query
    toObject: { virtuals: true },
  }
);

//indexing for quicker querying, by ordering them
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

//not part of the DB, gets added to the response
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
//a way of storing data into another collection but noy persisting it to a DB
//takes in a virtual field and options
tourSchema.virtual('reviews', {
  ref: 'Review', //the model we want to reference
  foreignField: 'tour', //this is the name of the field in the review model, where the reference to the current model is stored (tour from review model)
  localField: '_id', //this _id is called tour in the foreign model
});

//mongoose middleware, document middleware: runs before a create() save() only
tourSchema.pre('save', function (next) {
  //this is going to point to the currently processed document
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

//embedding tour-guides into the tours model on save
// tourSchema.pre('save', async function (next) {
//   //the result off the map is a promise, so we need to use promise.all here
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post("save", function(doc, next) {
//   //we don't have the this keyword here, bit we do have the finished document
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  //"this" is a query object so we can use query methods on it
  this.find({ secretTour: { $ne: true } });
  next();
});

//populate the guide fields with the referenced user, before a query occurs
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides', //name of the field we want to replace
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.pre('aggregate', function (next) {
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
