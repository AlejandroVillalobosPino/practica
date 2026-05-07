import { Router } from 'express';
import * as ctrl from '../controllers/deliveryNote.controller.js';
import { deliveryNoteSchema } from '../validators/deliveryNote.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSignature } from '../middleware/upload.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Gestión de albaranes
 *
 * /deliverynote:
 *   get:
 *     summary: Listar albaranes con paginación y filtros
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_SIGNATURE, SIGNED, REJECTED]
 *     responses:
 *       200:
 *         description: Lista de albaranes
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client, project, items]
 *             properties:
 *               client:
 *                 type: string
 *                 example: 64a1b2c3d4e5f6a7b8c9d0e1
 *               project:
 *                 type: string
 *                 example: 64a1b2c3d4e5f6a7b8c9d0e2
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     concept:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     hours:
 *                       type: number
 *     responses:
 *       201:
 *         description: Albarán creado
 *       400:
 *         description: Proyecto inválido
 *
 * /deliverynote/{id}:
 *   get:
 *     summary: Obtener albarán por ID
 *     tags: [Albaranes]
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
 *         description: Albarán encontrado
 *       404:
 *         description: Albarán no encontrado
 *   delete:
 *     summary: Eliminar albarán no firmado
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Albarán eliminado
 *       400:
 *         description: No se puede borrar un albarán firmado
 *
 * /deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán con imagen
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado
 *
 * /deliverynote/{id}/pdf:
 *   get:
 *     summary: Descargar PDF del albarán
 *     tags: [Albaranes]
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
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */

router.use(protect);

router.post('/', validate(deliveryNoteSchema), ctrl.createDeliveryNote);
router.get('/', ctrl.getDeliveryNotes);
router.get('/:id', ctrl.getDeliveryNote);
router.delete('/:id', ctrl.deleteDeliveryNote);
router.patch('/:id/sign', uploadSignature, ctrl.signDeliveryNote);
router.get('/:id/pdf', ctrl.downloadPDF);

export default router;