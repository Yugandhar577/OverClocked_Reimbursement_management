import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { config } from '../config/index.js';
import { OcrStatus } from '@prisma/client';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface OcrResult {
  vendor?: string;
  amount?: number;
  currency?: string;
  date?: string;
  rawText?: string;
  items?: Array<{ description: string; amount: number }>;
}

export class ReceiptService {
  async createReceipt(
    expenseId: string,
    file: Express.Multer.File,
    expenseLineId?: string
  ) {
    // Verify expense exists
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    // Calculate file checksum
    const fileBuffer = await fs.readFile(file.path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const receipt = await prisma.receipt.create({
      data: {
        expenseId,
        expenseLineId,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        ocrStatus: OcrStatus.PENDING,
        checksum,
      },
    });

    return receipt;
  }

  async getById(receiptId: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        expense: { select: { id: true, title: true, creatorId: true } },
      },
    });

    if (!receipt) {
      throw new NotFoundError('Receipt not found');
    }

    return receipt;
  }

  async deleteReceipt(receiptId: string, userId: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { expense: true },
    });

    if (!receipt) {
      throw new NotFoundError('Receipt not found');
    }

    if (receipt.expense.creatorId !== userId) {
      throw new BadRequestError('Access denied');
    }

    // Delete file from disk
    try {
      await fs.unlink(receipt.filePath);
    } catch (error) {
      logger.error('Failed to delete receipt file', error);
    }

    await prisma.receipt.delete({ where: { id: receiptId } });
  }

  async processOcr(receiptId: string): Promise<OcrResult | null> {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundError('Receipt not found');
    }

    // Update status to processing
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { ocrStatus: OcrStatus.PROCESSING },
    });

    try {
      let result: OcrResult | null = null;

      // Try Mindee first
      if (config.externalApis.mindeeApiKey) {
        result = await this.processMindeeOcr(receipt.filePath);
      }

      // Fallback to OCR.space
      if (!result && config.externalApis.ocrSpaceApiKey) {
        result = await this.processOcrSpace(receipt.filePath);
      }

      if (result) {
        await prisma.receipt.update({
          where: { id: receiptId },
          data: {
            ocrStatus: OcrStatus.COMPLETED,
            ocrData: result as any,
            ocrRawText: result.rawText,
          },
        });
      } else {
        await prisma.receipt.update({
          where: { id: receiptId },
          data: { ocrStatus: OcrStatus.FAILED },
        });
      }

      return result;
    } catch (error) {
      logger.error('OCR processing failed', error);

      await prisma.receipt.update({
        where: { id: receiptId },
        data: { ocrStatus: OcrStatus.FAILED },
      });

      return null;
    }
  }

  private async processMindeeOcr(filePath: string): Promise<OcrResult | null> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const base64File = fileBuffer.toString('base64');
      const fileName = path.basename(filePath);

      const response = await fetch(
        'https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${config.externalApis.mindeeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document: base64File,
            filename: fileName,
          }),
        }
      );

      if (!response.ok) {
        logger.error(`Mindee API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const prediction = data.document?.inference?.prediction;

      if (!prediction) {
        return null;
      }

      return {
        vendor: prediction.supplier_name?.value,
        amount: prediction.total_amount?.value,
        currency: prediction.locale?.currency,
        date: prediction.date?.value,
        rawText: JSON.stringify(prediction),
        items: prediction.line_items?.map((item: any) => ({
          description: item.description,
          amount: item.total_amount,
        })),
      };
    } catch (error) {
      logger.error('Mindee OCR error', error);
      return null;
    }
  }

  private async processOcrSpace(filePath: string): Promise<OcrResult | null> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const base64File = fileBuffer.toString('base64');
      const ext = path.extname(filePath).slice(1);

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          apikey: config.externalApis.ocrSpaceApiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          base64Image: `data:image/${ext};base64,${base64File}`,
          language: 'eng',
          isOverlayRequired: 'false',
        }),
      });

      if (!response.ok) {
        logger.error(`OCR.space API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const parsedText = data.ParsedResults?.[0]?.ParsedText;

      if (!parsedText) {
        return null;
      }

      // Basic extraction from raw text
      const amountMatch = parsedText.match(/\$?\s*([\d,]+\.?\d*)/);

      return {
        rawText: parsedText,
        amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : undefined,
      };
    } catch (error) {
      logger.error('OCR.space error', error);
      return null;
    }
  }

  async getReceiptUrl(receiptId: string): Promise<string> {
    const receipt = await this.getById(receiptId);
    const relativePath = path.relative(config.upload.uploadDir, receipt.filePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }
}

export const receiptService = new ReceiptService();
