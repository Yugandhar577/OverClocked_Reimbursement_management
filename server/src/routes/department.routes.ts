import { Router } from 'express';
import * as departmentController from '../controllers/department.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', departmentController.getDepartments);
router.get('/hierarchy', departmentController.getHierarchy);
router.get('/:id', departmentController.getDepartment);
router.post('/', requireAdmin, validateBody(createDepartmentSchema), departmentController.createDepartment);
router.put('/:id', requireAdmin, validateBody(updateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', requireAdmin, departmentController.deleteDepartment);

export default router;
