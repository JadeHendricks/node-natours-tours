module.exports = fn => {
  return (req, res, next) => {
    //sends the error to the globalErrorHandler via next();
    fn(req, res, next).catch(err => next(err));
  }
};