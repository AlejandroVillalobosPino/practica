import { Router } from 'express';
import * as ctrl from '../controllers/client.controller.js';
import { clientSchema } from '../validators/client.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /client:
 *   get:
 *     summary: "Obtener lista de clientes"
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: "Operacion exitosa"
 *   post:
 *     summary: "Crear un nuevo cliente"
 *     tags: [Clientes]
 *     responses:
 *       201:
 *         description: "Cliente creado"
 */

router.use(protect);

router.get('/archived', ctrl.getArchivedClients);   // <-- ANTES que /:id
router.patch('/:id/restore', ctrl.restoreClient);

router.post('/', validate(clientSchema), ctrl.createClient);
router.get('/', ctrl.getClients);
router.get('/:id', ctrl.getClient);
router.put('/:id', validate(clientSchema), ctrl.updateClient);
router.delete('/:id', ctrl.deleteClient);

export default router;