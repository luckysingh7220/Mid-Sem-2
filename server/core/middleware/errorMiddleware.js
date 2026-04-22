// @desc    Global error handler — must be the LAST middleware registered in server.js
const errorHandler = (err, req, res, next) => {
  // If res.statusCode is still 200, something unhandled occurred — default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// @desc    Handle 404 — route not found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
