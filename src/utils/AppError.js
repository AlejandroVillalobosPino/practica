/**
 * Clase personalizada para manejar errores operativos de la aplicación.
 * Permite centralizar el mensaje, el código de estado HTTP y un código de error interno.
 */
export class AppError extends Error {
    constructor(message, statusCode, errorCode, details = null) { // Añadimos details
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details; // Guardamos los detalles del error
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(msg, code = 'BAD_REQUEST', details = null) {
        return new AppError(msg, 400, code, details); // Pasamos details
    }

    static unauthorized(msg = 'No autorizado', code = 'UNAUTHORIZED') {
        return new AppError(msg, 401, code);
    }

    static notFound(msg = 'Recurso no encontrado', code = 'NOT_FOUND') {
        return new AppError(msg, 404, code);
    }

    static conflict(msg, code = 'CONFLICT') {
        return new AppError(msg, 409, code);
    }
}