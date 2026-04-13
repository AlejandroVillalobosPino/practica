import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import * as val from '../validators/user.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';
import { uploadLogo } from '../middleware/upload.js';

const router = Router();

// Públicos
router.post('/register', validate(val.registerSchema), ctrl.register);
router.post('/login', validate(val.loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);

// Protegidos
router.use(protect);
router.put('/validation', ctrl.validateEmail); // Punto 2
router.put('/register', validate(val.onboardingSchema), ctrl.updatePersonalData); // Punto 4 (Personal)
router.patch('/company', ctrl.updateCompany); // Punto 4 (Compañía)
router.patch('/logo', uploadLogo, ctrl.updateLogo); // Punto 5
router.get('/', ctrl.getMe); // Punto 6
router.post('/logout', (req, res) => res.json({ message: 'Cierre de sesión exitoso' })); // Punto 7
router.delete('/', ctrl.deleteUser); // Punto 8
router.put('/password', validate(val.passwordSchema), ctrl.changePassword); // Punto 9
router.post('/invite', checkRole('admin'), ctrl.invite); // Punto 10

export default router;