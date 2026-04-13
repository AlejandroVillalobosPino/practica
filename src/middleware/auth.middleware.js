import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith('Bearer')
            ? req.headers.authorization.split(' ')[1] : null;

        if (!token) return next(AppError.unauthorized('No has iniciado sesión'));

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.deleted) return next(AppError.unauthorized('Usuario no válido'));

        req.user = user; // Inyectamos el usuario en la petición
        next();
    } catch (err) {
        next(AppError.unauthorized('Token inválido o expirado'));
    }
};