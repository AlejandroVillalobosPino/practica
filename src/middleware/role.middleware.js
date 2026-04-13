import { AppError } from '../utils/AppError.js';

export const checkRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return next(AppError.forbidden(`Acceso denegado: se requiere rol ${role}`));
    }
    next();
};