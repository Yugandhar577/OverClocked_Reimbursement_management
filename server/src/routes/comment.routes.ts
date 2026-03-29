import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as commentController from '../controllers/comment.controller.js';
import { createCommentSchema } from '../validators/comment.validator.js';

const router = Router();

router.use(authenticate);

router.get('/expense/:expenseId', commentController.getExpenseComments);
router.post('/expense/:expenseId', validateBody(createCommentSchema), commentController.createComment);
router.delete('/:commentId', commentController.deleteComment);

export default router;
