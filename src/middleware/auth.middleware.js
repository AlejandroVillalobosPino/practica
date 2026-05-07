import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) return next(AppError.unauthorized('No estás logueado'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);

        if (!user) return next(AppError.unauthorized('El usuario ya no existe'));

        req.user = user;
        next();
    } catch (error) {
        next(AppError.unauthorized('Token inválido'));
    }
};