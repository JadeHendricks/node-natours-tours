const fileSystem = require("fs");
const express = require("express");
const morgan = require("morgan");
//upon calling express() it will give us a bunch of methods to use
const app = express();

//middleware 
app.use(morgan("dev"));
//a function that can modify the incoming request data
//express. json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object so we can access the req.body
app.use(express.json());

app.use((req, res, next) => {
  console.log("Hello from the middleware");
  next();
});


//blocking code
const tours = JSON.parse(fileSystem.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours
    }
  })
}

const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(element => element.id === id);

  if (!tour) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: tour
    }
  })
}

const createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fileSystem.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({ 
      status: "success",
      data: {
        tour: newTour
      }
     })
  })
}

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: "Updated tour here"
    }
  })
}

const deleteTour = (req, res) => {

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    });
  }

  res.status(204).json({
    status: "success",
    data: null
  })
}

//requests
// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTour);
// app.post("/api/v1/tours", createTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

app
  .route("/api/v1/tours")
  .get(getAllTours)
  .post(createTour);

app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

//starting a server
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});