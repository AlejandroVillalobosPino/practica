import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';

/**
 * Función principal para arrancar el servidor y la base de datos
 */
async function main() {
    try {
        // Conexión a MongoDB Atlas usando la URI del config
        await mongoose.connect(config.MONGO_URI);
        console.log('Conexión exitosa a MongoDB Atlas');

        app.listen(config.PORT, () => {
            console.log(`Servidor BildyApp corriendo en http://localhost:${config.PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error.message);
        process.exit(1);
    }
}

main();