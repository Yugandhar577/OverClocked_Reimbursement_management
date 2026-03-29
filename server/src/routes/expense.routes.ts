import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireEmployee } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseLineSchema,
  updateExpenseLineSchema,
} from '../validators/expense.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(requireEmployee);

// Expense routes
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', validateBody(createExpenseSchema), expenseController.createExpense);
router.put('/:id', validateBody(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);
router.post('/:id/submit', expenseController.submitExpense);

// Expense line routes
router.post('/:id/lines', validateBody(expenseLineSchema), expenseController.addLine);
router.put('/:id/lines/:lineId', validateBody(updateExpenseLineSchema), expenseController.updateLine);
router.delete('/:id/lines/:lineId', expenseController.deleteLine);

export default router;
