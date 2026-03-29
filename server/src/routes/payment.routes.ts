import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireFinance } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import * as paymentController from '../controllers/payment.controller.js';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from '../validators/payment.validator.js';

const router = Router();

router.use(authenticate);
router.use(requireFinance);

router.post('/order', validateBody(createPaymentOrderSchema), paymentController.createPaymentOrder);
router.post('/verify', validateBody(verifyPaymentSchema), paymentController.verifyPayment);

export default router;
