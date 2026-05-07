import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import indexRoutes from './routes/index.js';
import setupSwagger from './config/swagger.js';
import { errorHandler } from './middleware/error-handler.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(express.json());
app.use(cors());

// --- SWAGGER CONFIGURACIÓN ---
// Quitamos el "if" para que se cargue SÍ O SÍ
console.log('Intentando cargar Swagger...');
setupSwagger(app);

// --- RUTAS ---
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use('/api', indexRoutes);

// --- MANEJO DE 404 ---
// Importante: El '*' debe ir DESPUÉS de Swagger y de las Rutas
app.use((req, res, next) => {
    // Si la ruta no es /api-docs ni empieza por /api, lanzamos el 404
    if (!req.url.startsWith('/api-docs') && !req.url.startsWith('/api')) {
        return next(AppError.notFound(`No se pudo encontrar ${req.originalUrl}`));
    }
    next();
});

app.use(errorHandler);

export default app;