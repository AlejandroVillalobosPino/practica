import { Router } from 'express';
import * as ctrl from '../controllers/deliveryNote.controller.js';
import { deliveryNoteSchema } from '../validators/deliveryNote.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSignature } from '../middleware/upload.js';

const router = Router();
router.use(protect);

router.post('/', validate(deliveryNoteSchema), ctrl.createDeliveryNote);
router.get('/', ctrl.getDeliveryNotes);
router.get('/:id', ctrl.getDeliveryNote);
router.delete('/:id', ctrl.deleteDeliveryNote);
router.patch('/:id/sign', uploadSignature, ctrl.signDeliveryNote);
router.get('/:id/pdf', ctrl.downloadPDF);

export default router;