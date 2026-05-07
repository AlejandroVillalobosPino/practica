import mongoose from 'mongoose';
import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './config/socket.js';
import { config } from './config/index.js';

const httpServer = createServer(app);
const io = initSocket(httpServer);

async function main() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('Conexión exitosa a MongoDB Atlas');

        const PORT = config.PORT || 3000;
        httpServer.listen(PORT, () => {
            console.log(`Servidor BildyApp corriendo en http://localhost:${PORT}`);
            console.log(`WebSockets preparados`);
        });

        // Apagado seguro (Graceful Shutdown)
        const gracefulShutdown = async () => {
            console.log('\nCerrando conexiones...');
            if (io) io.close();
            await mongoose.connection.close();
            httpServer.close(() => {
                console.log('Servidor apagado.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error('Error al iniciar:', error.message);
        process.exit(1);
    }
}

main();