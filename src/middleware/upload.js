import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `logo-${req.user.id}-${Date.now()}.${ext}`);
    }
});

export const uploadLogo = multer({
    storage: logoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) cb(null, true);
        else cb(AppError.badRequest('Solo se permiten imágenes'), false);
    }
}).single('logo');


const signatureStorage = multer.memoryStorage();

export const uploadSignature = multer({
    storage: signatureStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Máximo 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(AppError.badRequest('El archivo de la firma debe ser una imagen'), false);
    }
}).single('signature');