import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: '*' }
    });

    io.on('connection', (socket) => {
        console.log(`Socket conectado: ${socket.id}`);

        socket.on('join:company', (companyId) => {
            socket.join(`company:${companyId}`);
            console.log(`Socket ${socket.id} unido a company:${companyId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Socket desconectado: ${socket.id}`);
        });
    });

    return io;
};

export const emitToCompany = (companyId, eventName, data) => {
    if (io) {
        io.to(`company:${companyId}`).emit(eventName, data);
    }
};