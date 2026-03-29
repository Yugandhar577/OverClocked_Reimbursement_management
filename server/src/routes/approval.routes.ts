import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireManager } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import * as approvalController from '../controllers/approval.controller.js';
import {
  approvalActionSchema,
  createApprovalRuleSchema,
  updateApprovalRuleSchema,
} from '../validators/approval.validator.js';

export const approvalRuleRoutes = Router();
approvalRuleRoutes.use(authenticate);
approvalRuleRoutes.use(requireAdmin);
approvalRuleRoutes.get('/', approvalController.getApprovalRules);
approvalRuleRoutes.post('/', validateBody(createApprovalRuleSchema), approvalController.createApprovalRule);
approvalRuleRoutes.put('/:id', validateBody(updateApprovalRuleSchema), approvalController.updateApprovalRule);
approvalRuleRoutes.delete('/:id', approvalController.deleteApprovalRule);

const router = Router();
router.use(authenticate);
router.get('/pending', requireManager, approvalController.getPendingApprovals);
router.post('/:expenseId/approve', requireManager, validateBody(approvalActionSchema), approvalController.approveExpense);
router.post('/:expenseId/reject', requireManager, validateBody(approvalActionSchema), approvalController.rejectExpense);

export default router;
