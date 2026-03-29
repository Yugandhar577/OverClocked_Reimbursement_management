import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { commentService } from '../services/comment.service.js';

export const getExpenseComments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await commentService.listExpenseComments(req.params.expenseId, {
      userId: req.user!.userId,
      companyId: req.user!.companyId,
      role: req.user!.role,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const comment = await commentService.createComment(req.params.expenseId, {
      userId: req.user!.userId,
      companyId: req.user!.companyId,
      role: req.user!.role,
    }, req.body);

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const comment = await commentService.deleteComment(req.params.commentId, {
      userId: req.user!.userId,
      companyId: req.user!.companyId,
      role: req.user!.role,
    });

    res.json({
      success: true,
      data: comment,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
