import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { errorHandler } from './middleware/error-handler.js';
import userRoutes from './routes/user.routes.js';
import { AppError } from './utils/AppError.js';

const app = express();

// 1. SEGURIDAD: Cabeceras HTTP
app.use(helmet());

// 2. CORS
app.use(cors());

// 3. RATE LIMIT
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones.'
});
app.use('/api', limiter);

// 4. PARSEO JSON: Límite de seguridad
app.use(express.json({ limit: '10kb' }));

// 5. SANITIZACIÓN MANUAL (Compatible con Express 5)
// Esta función limpia el body de operadores $ de MongoDB sin tocar la query de solo lectura
app.use((req, res, next) => {
    if (req.body) {
        const sanitize = (obj) => {
            for (const key in obj) {
                if (key.startsWith('$')) delete obj[key];
                else if (typeof obj[key] === 'object' && obj[key] !== null) sanitize(obj[key]);
            }
        };
        sanitize(req.body);
    }
    next();
});

// 6. ARCHIVOS ESTÁTICOS
app.use('/uploads', express.static(path.join(import.meta.dirname, '../uploads')));

// 7. RUTAS
app.use('/api/user', userRoutes);

// 8. MANEJO DE 404
app.all('/*splat', (req, res, next) => {
    next(AppError.notFound(`No se pudo encontrar ${req.originalUrl}`));
});

// 9. ERROR HANDLER CENTRALIZADO
app.use(errorHandler);

export default app;