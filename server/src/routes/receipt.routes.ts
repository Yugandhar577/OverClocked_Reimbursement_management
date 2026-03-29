import { Router } from 'express';
import * as receiptController from '../controllers/receipt.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireEmployee } from '../middleware/rbac.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(requireEmployee);

router.post('/expense/:expenseId', uploadSingle, receiptController.uploadReceipt);
router.get('/:id', receiptController.getReceipt);
router.get('/:id/url', receiptController.getReceiptUrl);
router.delete('/:id', receiptController.deleteReceipt);
router.post('/:id/ocr', receiptController.processOcr);

export default router;
