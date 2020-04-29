const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
//schema-model
//a blueprint for us to us to create documents, we create models from mongoose schemas
const tourSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A tour name must be less or equal to 40 characters"],
    minlength: [10, "A tour name must be less or equal to 10 characters"]
    // validate: [validator.isAlpha, "Tour name must only contain characters"]
  },
  slug: {
    type: String
  },
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"]
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"]
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty should be: easy, medium or difficult"
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1"],
    max: [5, "Rating must be below or equal to 5"],
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  price: { 
    type: Number, 
    required: [true, "A tour must have a price"]  
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(value) {
        //only works on a new document and not on update
        return value < this.price;
      },
      message: "Discount price ({VALUE}) should be below the regular price"
    } 

  },
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must have a description"]
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"]
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

//not part of the DB, gets added to the response
tourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7;
});

//mongoose middleware, document middleware: runs before a create() save() only
tourSchema.pre("save", function(next) {
  //this is going to point to the currently processed document
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post("save", function(doc, next) {
//   //we don't have the this keyword here, bit we do have the finished document
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  //"this" is a query object so we can use query methods on it
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre("aggregate", function(next) {
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;