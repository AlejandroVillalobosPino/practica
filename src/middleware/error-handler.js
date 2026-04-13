export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.errorCode = err.errorCode || 'INTERNAL_ERROR';

    res.status(err.statusCode).json({
        status: 'error',
        errorCode: err.errorCode,
        message: err.message,
        details: err.details, // <--- Ahora verás qué campo falla (ej: lastName min 2)
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};