import fs from 'fs';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import {
  extractReceiptAmount,
  extractReceiptDate,
  extractReceiptVendor,
} from '../utils/ocr-parsing.js';

interface OcrResult {
  rawText: string;
  parsedData: {
    amount?: number;
    currency?: string;
    date?: string;
    vendor?: string;
    items?: Array<{
      description: string;
      amount: number;
    }>;
    confidence: number;
  };
}

export class OcrService {
  async processReceipt(filePath: string): Promise<OcrResult> {
    // Try Mindee first, fall back to OCR.space
    try {
      if (config.externalApis.mindeeApiKey) {
        return await this.processWithMindee(filePath);
      }
    } catch (error) {
      logger.warn('Mindee OCR failed, trying OCR.space fallback', { error });
    }

    try {
      if (config.externalApis.ocrSpaceApiKey) {
        return await this.processWithOcrSpace(filePath);
      }
    } catch (error) {
      logger.warn('OCR.space failed', { error });
    }

    // Return empty result if both fail
    logger.warn('All OCR services failed or not configured');
    return {
      rawText: '',
      parsedData: {
        confidence: 0,
      },
    };
  }

  private async processWithMindee(filePath: string): Promise<OcrResult> {
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');

    const response = await fetch(
      'https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${config.externalApis.mindeeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: base64File,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Mindee API error: ${response.statusText}`);
    }

    const data = await response.json() as {
      document: {
        inference: {
          prediction: {
            total_amount?: { value: number };
            currency?: { value: string };
            date?: { value: string };
            supplier_name?: { value: string };
            line_items?: Array<{
              description: string;
              total_amount: number;
            }>;
          };
          pages: Array<{
            extras: {
              full_text_ocr: {
                content: string;
              };
            };
          }>;
        };
      };
    };

    const prediction = data.document.inference.prediction;
    const rawText = data.document.inference.pages
      .map((p) => p.extras?.full_text_ocr?.content || '')
      .join('\n');

    return {
      rawText,
      parsedData: {
        amount: prediction.total_amount?.value,
        currency: prediction.currency?.value,
        date: prediction.date?.value,
        vendor: prediction.supplier_name?.value,
        items: prediction.line_items?.map((item) => ({
          description: item.description,
          amount: item.total_amount,
        })),
        confidence: 0.9, // Mindee is generally high confidence
      },
    };
  }

  private async processWithOcrSpace(filePath: string): Promise<OcrResult> {
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64File}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': config.externalApis.ocrSpaceApiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.statusText}`);
    }

    const data = await response.json() as {
      ParsedResults?: Array<{
        ParsedText: string;
      }>;
    };

    const rawText = data.ParsedResults?.[0]?.ParsedText || '';

    // Parse the raw text to extract structured data
    const parsedData = this.parseRawText(rawText);

    return {
      rawText,
      parsedData,
    };
  }

  private parseRawText(text: string): OcrResult['parsedData'] {
    const amount = extractReceiptAmount(text) ?? undefined;
    const date = extractReceiptDate(text) ?? undefined;
    const vendor = extractReceiptVendor(text) ?? undefined;

    return {
      amount,
      date,
      vendor,
      confidence: 0.6, // OCR.space with parsing has lower confidence
    };
  }
}

export const ocrService = new OcrService();
