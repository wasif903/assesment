const ErrorHandler = (err, req, res, next) => {
    let statusCode = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose CastError
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}.`;
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export default ErrorHandler;
