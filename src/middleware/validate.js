export const validate = (schema) => (req, res, next) => {
    // Forzamos la comprobación del body
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'No se han recibido datos (body undefined)'
        });
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: 'error',
            errorCode: 'VALIDATION_ERROR',
            details: result.error.errors
        });
    }

    req.body = result.data;
    next();
};