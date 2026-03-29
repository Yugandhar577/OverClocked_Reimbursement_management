import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { paymentService } from '../services/payment.service.js';

export const createPaymentOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await paymentService.createOrder(
      req.user!.companyId,
      req.user!.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: order,
      message: 'Payment order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await paymentService.verifyPayment(
      req.user!.companyId,
      req.user!.userId,
      req.body
    );

    res.json({
      success: true,
      data: expense,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    next(error);
  }
};
