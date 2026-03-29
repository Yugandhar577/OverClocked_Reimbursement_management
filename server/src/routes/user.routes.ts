import { Router } from 'express';
import multer from 'multer';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/auth.validator.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authenticate);

router.get('/', userController.getUsers);
router.get('/hierarchy', userController.getHierarchy);
router.get('/import-template', requireAdmin, userController.getImportTemplate);
router.post('/import', requireAdmin, upload.single('file'), userController.importUsers);
router.get('/:id', userController.getUser);
router.post('/', requireAdmin, validateBody(createUserSchema), userController.createUser);
router.put('/:id', requireAdmin, validateBody(updateUserSchema), userController.updateUser);
router.delete('/:id', requireAdmin, userController.deleteUser);

export default router;
