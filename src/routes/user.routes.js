import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import * as val from '../validators/user.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';
import { uploadLogo } from '../middleware/upload.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y autenticación
 *
 * /user/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@test.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       409:
 *         description: Email ya registrado
 *
 * /user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@test.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login correcto, devuelve tokens
 *       401:
 *         description: Credenciales incorrectas
 *
 * /user:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autorizado
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *         description: Si es true, hace soft delete
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *
 * /user/password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña cambiada
 *       400:
 *         description: Contraseña actual incorrecta
 */

router.post('/register', validate(val.registerSchema), ctrl.register);
router.post('/login', validate(val.loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);

router.use(protect);
router.put('/validation', ctrl.validateEmail);
router.put('/register', validate(val.onboardingSchema), ctrl.updatePersonalData);
router.patch('/company', ctrl.updateCompany);
router.patch('/logo', uploadLogo, ctrl.updateLogo);
router.get('/', ctrl.getMe);
router.post('/logout', (req, res) => res.json({ message: 'Cierre de sesión exitoso' }));
router.delete('/', ctrl.deleteUser);
router.put('/password', validate(val.passwordSchema), ctrl.changePassword);
router.post('/invite', checkRole('admin'), ctrl.invite);

export default router;