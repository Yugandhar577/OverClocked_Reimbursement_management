import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { approvalEngineService } from '../services/approval.engine.js';
import {
  approvalRulesQuerySchema,
  pendingApprovalsQuerySchema,
} from '../validators/approval.validator.js';

export const getApprovalRules = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = approvalRulesQuerySchema.parse(req.query);
    const rules = await approvalEngineService.listRules(req.user!.companyId, filters);

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

export const createApprovalRule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rule = await approvalEngineService.createRule(
      req.user!.companyId,
      req.user!.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: rule,
      message: 'Approval rule created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateApprovalRule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rule = await approvalEngineService.updateRule(
      req.params.id,
      req.user!.companyId,
      req.user!.userId,
      req.body
    );

    res.json({
      success: true,
      data: rule,
      message: 'Approval rule updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApprovalRule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rule = await approvalEngineService.deactivateRule(
      req.params.id,
      req.user!.companyId,
      req.user!.userId
    );

    res.json({
      success: true,
      data: rule,
      message: 'Approval rule deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovals = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = pendingApprovalsQuerySchema.parse(req.query);
    const result = await approvalEngineService.getPendingApprovals(
      req.user!.userId,
      req.user!.companyId,
      filters
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const approveExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await approvalEngineService.approveExpense(
      req.params.expenseId,
      req.user!.userId,
      req.user!.companyId,
      req.body.comment
    );

    res.json({
      success: true,
      data: expense,
      message: 'Expense approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const rejectExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await approvalEngineService.rejectExpense(
      req.params.expenseId,
      req.user!.userId,
      req.user!.companyId,
      req.body.comment
    );

    res.json({
      success: true,
      data: expense,
      message: 'Expense rejected successfully',
    });
  } catch (error) {
    next(error);
  }
};
