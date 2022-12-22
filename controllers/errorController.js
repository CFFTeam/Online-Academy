// handle specific error (pre-processing) (from mongoose, library,...)
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new Error(message); // Bad request (400)
  };
  
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    //const message = `Duplicate field value ${value}. Please use another value!`;
    const message = `${value.replaceAll('"', '')} already exists. Please use another value!`;
    return new Error(message); // Bad request (400)
  };
  
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new Error(message); // Bad request(400)
};

  // error handler
 export default (err, req, res, next) => {
    let error = err;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    res.render(res.locals.handlebars, {layout: res.locals.layout || 'default', message: error.message, ...res.locals.props});
};