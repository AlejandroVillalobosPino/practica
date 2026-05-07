import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendVerificationEmail = async (email, code) => {
    await transporter.sendMail({
        from: `"BildyApp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifica tu cuenta',
        html: `
            <h2>Bienvenido a BildyApp</h2>
            <p>Tu código de verificación es:</p>
            <h1 style="color: #4F46E5; letter-spacing: 8px;">${code}</h1>
            <p>Este código expira en 24 horas.</p>
        `
    });
};

export const sendInvitationEmail = async (email, tempPassword) => {
    await transporter.sendMail({
        from: `"BildyApp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Te han invitado a BildyApp',
        html: `
            <h2>Has sido invitado a BildyApp</h2>
            <p>Tu contraseña temporal es:</p>
            <h3 style="color: #4F46E5;">${tempPassword}</h3>
            <p>Por favor cámbiala tras iniciar sesión.</p>
        `
    });
};