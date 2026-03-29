import { Router } from 'express';
import * as receiptController from '../controllers/receipt.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireEmployee } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  uploadReceiptSchema,
  getReceiptSchema,
  triggerOcrSchema,
  deleteReceiptSchema,
} from '../validators/receipt.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(requireEmployee);

router.post('/expense/:expenseId', validate(uploadReceiptSchema), uploadSingle, receiptController.uploadReceipt);
router.get('/:id', validate(getReceiptSchema), receiptController.getReceipt);
router.get('/:id/url', validate(getReceiptSchema), receiptController.getReceiptUrl);
router.delete('/:id', validate(deleteReceiptSchema), receiptController.deleteReceipt);
router.post('/:id/ocr', validate(triggerOcrSchema), receiptController.processOcr);

export default router;
