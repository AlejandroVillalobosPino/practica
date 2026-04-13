import { EventEmitter } from 'node:events';

export const notificationEmitter = new EventEmitter();

const logEvent = (event, user) => {
    // Añadimos el código al log para poder verlo en la terminal
    const codeInfo = user.verificationCode ? ` - CODE: ${user.verificationCode}` : '';
    console.log(`[EVENTO ${new Date().toISOString()}] ${event}: ${user.email}${codeInfo}`);
};

notificationEmitter.on('user:registered', (user) => logEvent('REGISTRO', user));
notificationEmitter.on('user:verified', (user) => logEvent('VERIFICACIÓN', user));
notificationEmitter.on('user:invited', (user) => logEvent('INVITACIÓN', user));
notificationEmitter.on('user:deleted', (user) => logEvent('BORRADO', user));