import { Router } from 'express';
import * as ctrl from '../controllers/project.controller.js';
import { projectSchema } from '../validators/project.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /project:
 *   get:
 *     summary: "Listar proyectos de la empresa"
 *     tags: [Proyectos]
 *     responses:
 *       200:
 *         description: "OK"
 *   post:
 *     summary: "Registrar nuevo proyecto"
 *     tags: [Proyectos]
 *     responses:
 *       201:
 *         description: "Creado"
 */

router.use(protect);

router.get('/archived', ctrl.getArchivedProjects);
router.patch('/:id/restore', ctrl.restoreProject);
router.post('/', validate(projectSchema), ctrl.createProject);
router.get('/', ctrl.getProjects);
router.get('/:id', ctrl.getProject);
router.put('/:id', validate(projectSchema), ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);

export default router;