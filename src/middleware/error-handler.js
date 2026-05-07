import { sendSlackNotification } from '../services/slack.service.js';

export const errorHandler = async (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.errorCode = err.errorCode || 'INTERNAL_ERROR';

    if (err.statusCode >= 500) {
        await sendSlackNotification(
            `ERROR ${err.statusCode} | ${req.method} ${req.originalUrl} | ${err.message} | ${new Date().toISOString()}`
        );
    }

    res.status(err.statusCode).json({
        status: 'error',
        errorCode: err.errorCode,
        message: err.message,
        details: err.details,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};