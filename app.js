const express = require('express');
const morgan = require('morgan');
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
//upon calling express() it will give us a bunch of methods to use
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//Global middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//rate limiting - this is a middleware function
// 100 requests per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
//work on all api routes
app.use('/api', limiter);

//a function that can modify the incoming request data
//express. json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object so we can access the req.body
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toString();
  //console.log(req.headers);
  next();
});

//we create a new router and save it into a variable and that variable is now middleware
//this is know as mounting the router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//this will only work if it did not reach any of our routers above, because this runs after.
//handle all http methods in one handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//if you pass it 4 parametres, express will automatically know it is a error handling middleware
app.use(globalErrorHandler);

module.exports = app;
