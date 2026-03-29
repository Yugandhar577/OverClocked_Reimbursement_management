import { Response, NextFunction } from 'express';
import { companyService } from '../services/company.service.js';
import { currencyService } from '../services/currency.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const company = await companyService.getById(req.user!.companyId);

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const company = await companyService.update(req.user!.companyId, req.body);

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const company = await companyService.updateSettings(req.user!.companyId, req.body);

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await companyService.getStats(req.user!.companyId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrencies = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currencies = await currencyService.getSupportedCurrencies();

    res.json({
      success: true,
      data: currencies,
    });
  } catch (error) {
    next(error);
  }
};
