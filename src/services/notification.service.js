import { EventEmitter } from 'node:events';
import { sendVerificationEmail, sendInvitationEmail } from './email.service.js';
import { sendSlackNotification } from './slack.service.js';

export const notificationEmitter = new EventEmitter();

const logEvent = (event, user) => {
    const codeInfo = user.verificationCode ? ` - CODE: ${user.verificationCode}` : '';
    console.log(`[EVENTO ${new Date().toISOString()}] ${event}: ${user.email}${codeInfo}`);
};

notificationEmitter.on('user:registered', async (user) => {
    logEvent('REGISTRO', user);
    try {
        await sendVerificationEmail(user.email, user.verificationCode);
    } catch (err) {
        console.error('Error enviando email de verificación:', err.message);
    }
    await sendSlackNotification(`nuevo usuario registrado: ${user.email}`);
});

notificationEmitter.on('user:verified', async (user) => {
    logEvent('VERIFICACIÓN', user);
    await sendSlackNotification(`usuario verificado: ${user.email}`);
});

notificationEmitter.on('user:invited', async (user) => {
    logEvent('INVITACIÓN', user);
    try {
        await sendInvitationEmail(user.email, user.tempPassword);
    } catch (err) {
        console.error('Error enviando email de invitación:', err.message);
    }
    await sendSlackNotification(`usuario invitado: ${user.email}`);
});

notificationEmitter.on('user:deleted', async (user) => {
    logEvent('BORRADO', user);
    await sendSlackNotification(`usuario eliminado: ${user.email}`);
});