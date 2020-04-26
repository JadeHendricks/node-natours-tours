const Tour = require("../models/tourModel");
//Blocking Code - Testing
// const tours = JSON.parse(fileSystem.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = async (req, res) => {
  try {
    //get all tours from the database
    const tours = await Tour.find();

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
      message: "Invalid data sent!"
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
      message: "Invalid data sent!"
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "Updated tour here"
    }
  })
}

exports.deleteTour = (req, res) => {

  res.status(204).json({
    status: "success",
    data: null
  })
}