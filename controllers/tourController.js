const Tour = require("../models/tourModel");
//Blocking Code - Testing
// const tours = JSON.parse(fileSystem.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = async (req, res) => {
  //gets all the params in the URL and stores it in an object
  // console.log(req.query);
  try {
    //1A) Filtering
    //creating a hardcopy and not a reference
    const queryObj = {...req.query};
    const excludedFields = ["page", "sort", "limit", "fields"];
    //looping through here to remove the excluded files from the queryObj
    excludedFields.forEach(element => delete queryObj[element]);

    //1B) advanced Filtering
    //convert the object to a string and replace the gte, gt, lte,le
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    //get all tours from the database
    let query = Tour.find(JSON.parse(queryString));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(" ");
      // console.log("req.query", req.query);
      // console.log("sortBy", sortBy);
      //sort via price, this is set on the query
      query = query.sort(req.query.sort);
    } else {
      //decending order, newest one goes first
      query = query.sort("-createdAt");
    }


    // const tours = await Tour.find()
    //   .where("duration")
    //   .equals(5)
    //   .where("difficulty")
    //   .equals("easy");

    const tours = await query;

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
      message: "Invalid data sent!"
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