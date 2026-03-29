import { Response, NextFunction } from 'express';
import { receiptService } from '../services/receipt.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const uploadReceipt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const receipt = await receiptService.createReceipt(
      req.params.expenseId,
      req.file,
      req.body.expenseLineId
    );

    res.status(201).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceipt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const receipt = await receiptService.getById(req.params.id);

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReceipt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await receiptService.deleteReceipt(req.params.id, req.user!.userId);

    res.json({
      success: true,
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const processOcr = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await receiptService.processOcr(req.params.id);

    res.json({
      success: true,
      data: result,
      message: result ? 'OCR processing completed' : 'OCR processing failed',
    });
  } catch (error) {
    next(error);
  }
};

export const getReceiptUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const url = await receiptService.getReceiptUrl(req.params.id);

    res.json({
      success: true,
      data: { url },
    });
  } catch (error) {
    next(error);
  }
};
