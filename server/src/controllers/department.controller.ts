import { Response, NextFunction } from 'express';
import { departmentService } from '../services/department.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getDepartments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departments = await departmentService.getAll(req.user!.companyId);

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const department = await departmentService.getById(
      req.params.id,
      req.user!.companyId
    );

    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const department = await departmentService.create(
      req.user!.companyId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const department = await departmentService.update(
      req.params.id,
      req.user!.companyId,
      req.body
    );

    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await departmentService.delete(req.params.id, req.user!.companyId);

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getHierarchy = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hierarchy = await departmentService.getHierarchy(req.user!.companyId);

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};
