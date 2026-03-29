import { Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service.js';
import { expenseFilterSchema } from '../validators/expense.validator.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getExpenses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = expenseFilterSchema.parse(req.query);

    const result = await expenseService.listExpenses(
      req.user!.userId,
      req.user!.companyId,
      req.user!.role,
      filters
    );

    res.json({
      success: true,
      data: result.expenses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await expenseService.getExpense(
      req.params.id,
      req.user!.userId,
      req.user!.companyId,
      req.user!.role
    );

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await expenseService.createExpense(
      req.user!.userId,
      req.user!.companyId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await expenseService.updateExpense(
      req.params.id,
      req.user!.userId,
      req.user!.companyId,
      req.body
    );

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await expenseService.deleteExpense(
      req.params.id,
      req.user!.userId,
      req.user!.companyId
    );

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const submitExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await expenseService.submitExpense(
      req.params.id,
      req.user!.userId,
      req.user!.companyId
    );

    res.json({
      success: true,
      data: expense,
      message: 'Expense submitted for approval',
    });
  } catch (error) {
    next(error);
  }
};

// Expense Lines
export const addLine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const line = await expenseService.addExpenseLine(
      req.params.id,
      req.user!.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: line,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const line = await expenseService.updateExpenseLine(
      req.params.id,
      req.params.lineId,
      req.user!.userId,
      req.body
    );

    res.json({
      success: true,
      data: line,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await expenseService.deleteExpenseLine(
      req.params.id,
      req.params.lineId,
      req.user!.userId
    );

    res.json({
      success: true,
      message: 'Expense line deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
