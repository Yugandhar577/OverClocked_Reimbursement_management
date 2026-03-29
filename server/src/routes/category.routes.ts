import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', categoryController.getCategories);
router.get('/hierarchy', categoryController.getHierarchy);
router.get('/:id', categoryController.getCategory);
router.post('/', requireAdmin, validateBody(createCategorySchema), categoryController.createCategory);
router.put('/:id', requireAdmin, validateBody(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

export default router;
