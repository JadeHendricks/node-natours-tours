const express = require('express');
const morgan = require('morgan');
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
//upon calling express() it will give us a bunch of methods to use
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//Global middlewares
//=============================================================================

//setting security HTTP headers with helmet
//helmet will return a middleware function and will sit there until it is called
//best ti use helmet early in the middleware stack to make sure these headers will be set
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Rate limiting from the same API - this is a middleware function
// 100 requests per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
//work on all api routes
app.use('/api', limiter);

//Body parser, reading data from body into req.body
//a function that can modify the incoming request data
//express. json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object so we can access the req.body
app.use(express.json({ limit: '10kb' })); //will not accept a body bigger than 10kb

//Data sanitization against noSql query injection
//looks at the request body, request query string and also at request.params and will filter out all the $ and dots
//returns a middleware function
app.use(mongoSanitize());

//Data sanitization against XSS
//prevents malicious html with some js attached to it, converts all those html symbols
//returns a middleware function
app.use(xss());

//Preventing parameter pollution
//good to use at the end because it will clear up the query string after everything has run before it
//returns a middleware function
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ], //we can allow duplicates to be passed via a whitelist
  })
);

//serving static files
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
app.use('/api/v1/reviews', reviewRouter);

//this will only work if it did not reach any of our routers above, because this runs after.
//handle all http methods in one handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//if you pass it 4 parametres, express will automatically know it is a error handling middleware
app.use(globalErrorHandler);

module.exports = app;
