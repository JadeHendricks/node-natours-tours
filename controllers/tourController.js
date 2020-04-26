const Tour = require("../models/tourModel");
//Blocking Code - Testing
// const tours = JSON.parse(fileSystem.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success"
    // results: tours.length,
    // data: {
    //   tours: tours
    // }
  })
}

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  // const tour = tours.find(element => element.id === id);

  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     tour: tour
  //   }
  // })
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