const express = require("express");
const morgan = require("morgan");
//upon calling express() it will give us a bunch of methods to use
const app = express();
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

//middleware 
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//a function that can modify the incoming request data
//express. json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object so we can access the req.body
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//we create a new router and save it into a variable and that variable is now middleware
//this is know as mounting the router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;