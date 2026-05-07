import { Router } from 'express';
import * as ctrl from '../controllers/client.controller.js';
import { clientSchema } from '../validators/client.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de clientes
 *
 * /client:
 *   get:
 *     summary: Listar clientes con paginación
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de clientes
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif, email, address]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Empresa ABC
 *               cif:
 *                 type: string
 *                 example: A12345678
 *               email:
 *                 type: string
 *                 example: contacto@empresa.com
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 *       409:
 *         description: CIF duplicado
 *
 * /client/archived:
 *   get:
 *     summary: Listar clientes archivados
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 *
 * /client/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *     responses:
 *       204:
 *         description: Cliente eliminado
 *       200:
 *         description: Cliente archivado
 */

router.use(protect);

router.get('/archived', ctrl.getArchivedClients);
router.patch('/:id/restore', ctrl.restoreClient);
router.post('/', validate(clientSchema), ctrl.createClient);
router.get('/', ctrl.getClients);
router.get('/:id', ctrl.getClient);
router.put('/:id', validate(clientSchema), ctrl.updateClient);
router.delete('/:id', ctrl.deleteClient);

export default router;