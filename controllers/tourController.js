const Tour = require('../models/tourModel');
const catchAsync = require('../utilities/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utilities/appError');
//Blocking Code - Testing
// const tours = JSON.parse(fileSystem.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 }, //1 for each document
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, //1 for ascending
    },
    {
      $match: { _id: { $ne: 'easy' } }, //not equals
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //almost like map, takes in dates and exports something in it's place
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, //$push creates an array
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0, //removes id from the response
      },
    },
    {
      $sort: { numTourStarts: -1 }, // -1 IS decending
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  //getting the co-ordinates
  const [lat, lng] = latlng.split(',');
  //getting radiants from the radius by dividing it by the radius of the earth
  const radius = unit === 'miles' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide a latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  //time to write a geospatial query
  //startLocation + the value that we are searching for
  //geoWithin - finds documents within a certain geometry
  //centerSphere takes in an array of the co-ordinates and the radius
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  //getting the co-ordinates
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'miles' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide a latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  //geoNear is the only geospatial pipeline that actually exsists
  //and it always needs to be the first in the pipeline
  //geoNear requires one of our fields to have a geospacial index (startLocation)
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //the start point from which to calculate the distances
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        //this is the name of the field that will be created and where all calculated distances will be stored
        distanceField: 'distance',
        distanceMultiplier: multiplier, //changing result from metres to km or miles
      },
    },
    {
      //add in the name of the fields that you want to keep only (show in res)
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //Execute Query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   //we want to populate the guides in the tourModel with the data that being referenced, only in the query and not in the actual DB
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     //create an error and pass it to next, as soon as next recieves a value it will assume it is a error
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   //Tour.findOne({ _id: req.params.id });
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, // to return the new updated document
//     runValidators: true, //tells the validators in the schema to run again
//   });

//   if (!tour) {
//     //create an error and pass it to next, as soon as next recieves a value it will assume it is a error
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     //create an error and pass it to next, as soon as next recieves a value it will assume it is a error
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
