const Tour = require("../models/tourModel");
const APIFeatures = require("../utilities/apiFeatures");
//Blocking Code - Testing
// const tours = JSON.parse(fileSystem.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
}

exports.getAllTours = async (req, res) => {
  try {
    //Execute Query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours: tours
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}

exports.getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  //Tour.findOne({ _id: req.params.id });
  try {
    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}

exports.createTour = async (req, res) => {
  // console.log(req.body);
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ 
      status: "success",
      data: {
        tour: newTour
      }
     })
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error
    })
  }
}

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // to return the new updated document
      runValidators: true //tells the validators in the schema to run again
    });

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }

}

exports.deleteTour = async (req, res) => {
  try {
   await Tour.findByIdAndDelete(req.params.id);
   
    res.status(204).json({
      status: "success",
      data: null
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      { 
        $group: {
          _id: "$difficulty",
          numTours: { $sum: 1 }, //1 for each document
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        }
      },
      {
        $sort: { avgPrice: 1 } //1 for ascending
      }, 
      {
        $match: { _id: { $ne: "easy" } } //not equals
      }
    ]);
    
    res.status(200).json({
      status: "success",
      data: {
        stats
      }
    });

  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates" //almost like map, takes in dates and exports something in it's place
      },
      {
        $match: {
          startDates: { 
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month:  "$startDates"},
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name"} //$push creates an array
        }
      },
      {
        $addFields: {
          month: "$_id"
        }
      },
      {
        $project: {
          _id: 0 //removes id from the response
        }
      },
      {
        $sort: { numTourStarts: -1 } // -1 IS decending
      }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        plan
      }
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}