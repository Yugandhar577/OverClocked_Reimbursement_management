import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from './auth.js';
import { ForbiddenError } from '../utils/errors.js';

type RoleType = keyof typeof UserRole;

export const requireRoles = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const userRole = req.user.role as RoleType;

    if (!allowedRoles.includes(userRole)) {
      next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
      return;
    }

    next();
  };
};

export const requireAdmin = requireRoles('SUPER_ADMIN', 'ADMIN');
export const requireFinance = requireRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE');
export const requireManager = requireRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'MANAGER');
export const requireEmployee = requireRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'MANAGER', 'EMPLOYEE');

export const requireSameCompany = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new ForbiddenError('Authentication required'));
    return;
  }

  const companyIdFromParams = req.params.companyId;

  if (companyIdFromParams && companyIdFromParams !== req.user.companyId) {
    // Super admins can access any company
    if (req.user.role !== 'SUPER_ADMIN') {
      next(new ForbiddenError('Access denied to this company'));
      return;
    }
  }

  next();
};

export const requireOwnerOrAdmin = (userIdField: string = 'id') => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const targetUserId = req.params[userIdField];
    const isOwner = targetUserId === req.user.userId;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      next(new ForbiddenError('Access denied'));
      return;
    }

    next();
  };
};
