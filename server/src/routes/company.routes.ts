import { Router } from 'express';
import * as companyController from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { updateCompanySchema, companySettingsSchema } from '../validators/company.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', companyController.getCompany);
router.put('/', requireAdmin, validateBody(updateCompanySchema), companyController.updateCompany);
router.put('/settings', requireAdmin, validateBody(companySettingsSchema), companyController.updateSettings);
router.get('/stats', requireAdmin, companyController.getStats);

export default router;
