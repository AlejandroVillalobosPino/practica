import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { notificationEmitter } from '../services/notification.service.js';

// --- UTILIDADES ---
const signTokens = (id) => {
    const accessToken = jwt.sign({ id }, config.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// --- ENDPOINTS ---

// 1. Registro
export const register = async (req, res, next) => {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing && existing.status === 'verified') return next(AppError.conflict('Email ya registrado'));

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({ email, password: hashedPassword, verificationCode: code });
    notificationEmitter.emit('user:registered', user); // Requisito T2

    res.status(201).json({ ...signTokens(user._id), status: user.status });
};

// 2. Validación de email
export const validateEmail = async (req, res, next) => {
    const { code } = req.body;
    if (req.user.verificationCode !== code) {
        req.user.verificationAttempts -= 1;
        await req.user.save();
        if (req.user.verificationAttempts <= 0) return next(new AppError('Intentos agotados', 429));
        return next(AppError.badRequest('Código incorrecto'));
    }
    req.user.status = 'verified';
    await req.user.save();
    notificationEmitter.emit('user:verified', req.user);
    res.json({ message: 'Verificado' });
};

// 3. Login
export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return next(AppError.unauthorized('Credenciales incorrectas'));
    res.json({ user, ...signTokens(user._id) });
};

// 4. Onboarding: Datos personales y Compañía
export const updatePersonalData = async (req, res) => {
    const { name, lastName, nif } = req.body;
    req.user.name = name;
    req.user.lastName = lastName;
    req.user.nif = nif;
    await req.user.save();
    res.json(req.user);
};

export const updateCompany = async (req, res, next) => {
    const { name, cif, address, isFreelance } = req.body;
    let company = await Company.findOne({ cif });

    if (!company) {
        company = await Company.create({
            name: isFreelance ? `${req.user.name} ${req.user.lastName}` : name,
            cif: isFreelance ? req.user.nif : cif,
            address: isFreelance ? req.user.address : address,
            owner: req.user._id,
            isFreelance
        });
        req.user.role = 'admin';
    } else {
        req.user.role = 'guest';
    }
    req.user.company = company._id;
    await req.user.save();
    res.json({ company, role: req.user.role });
};

// 5. Logo de la compañía
export const updateLogo = async (req, res, next) => {
    if (!req.user.company) return next(AppError.badRequest('No tienes compañía'));
    await Company.findByIdAndUpdate(req.user.company, { logo: req.file.path });
    res.json({ message: 'Logo actualizado', url: req.file.path });
};

// 6. Obtener usuario (Populate + Virtual)
export const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).populate('company');
    res.json(user); // fullName aparecerá gracias al virtual
};

// 7. Sesión: Refresh y Logout
export const refresh = (req, res, next) => {
    const { refreshToken } = req.body;
    try {
        const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    } catch (err) { next(AppError.unauthorized('Token inválido')); }
};

// 8. Eliminar usuario (Hard o Soft)
export const deleteUser = async (req, res) => {
    const { soft } = req.query;
    if (soft === 'true') {
        req.user.deleted = true;
        await req.user.save();
    } else {
        await User.findByIdAndDelete(req.user.id);
    }
    notificationEmitter.emit('user:deleted', req.user);
    res.status(204).send();
};

// 9. Cambiar contraseña
export const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await bcrypt.compare(currentPassword, user.password))) return next(AppError.badRequest('Password actual incorrecto'));
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Contraseña cambiada' });
};

// 10. Invitar compañeros
export const invite = async (req, res, next) => {
    const { email } = req.body;

    // 1. Comprobar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(AppError.conflict('Este usuario ya está en el sistema'));
    }

    // 2. Crear el invitado con los datos del Admin
    // Le ponemos una contraseña aleatoria temporal para saltar la validación del modelo
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
        email,
        password: hashedPassword,
        companyID: req.user.companyID, // Se vincula a tu empresa
        role: 'guest',
        status: 'pending'
    });

    // 3. Emitir evento para el log
    notificationEmitter.emit('user:invited', newUser);

    res.status(201).json({
        message: 'Invitación enviada con éxito',
        user: { email: newUser.email, role: newUser.role }
    });
};