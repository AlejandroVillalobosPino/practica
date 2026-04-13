import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
    try {
        // Validamos el objeto completo (body, query, params)
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Solo actualizamos el BODY.
        // Express 5 prohíbe reasignar req.query o req.params
        req.body = parsed.body;

        next();
    } catch (err) {
        const details = err.errors?.map(e => ({
            campo: e.path.join('.'),
            mensaje: e.message
        })) || err.message;

        next(AppError.badRequest('Error de validación', 'VALIDATION_ERROR', details));
    }
};