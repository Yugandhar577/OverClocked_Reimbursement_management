import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isPlaceholderValue = (value?: string) => {
  const normalized = value?.trim().toLowerCase() ?? '';
  if (!normalized) {
    return true;
  }

  return [
    'your-',
    'xxxxxxxx',
    'example.com',
    'noreply@example.com',
  ].some((fragment) => normalized.includes(fragment));
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    url: process.env.DATABASE_URL || '',
  },

  defaults: {
    baseCurrency: process.env.DEFAULT_BASE_CURRENCY || 'USD',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@example.com',
    useOutbox:
      isPlaceholderValue(process.env.SMTP_USER) ||
      isPlaceholderValue(process.env.SMTP_PASS) ||
      isPlaceholderValue(process.env.SMTP_FROM),
    outboxDir: path.join(__dirname, '../../dev-outbox'),
  },

  externalApis: {
    mindeeApiKey: process.env.MINDEE_API_KEY || '',
    ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY || '',
    useDemoFixtures:
      isPlaceholderValue(process.env.MINDEE_API_KEY) &&
      isPlaceholderValue(process.env.OCR_SPACE_API_KEY),
  },

  payment: {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    useMockGateway:
      isPlaceholderValue(process.env.RAZORPAY_KEY_ID) ||
      isPlaceholderValue(process.env.RAZORPAY_KEY_SECRET),
    mockSecret: process.env.RAZORPAY_MOCK_SECRET || 'local-razorpay-demo-secret',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadDir: path.join(__dirname, '../../uploads'),
  },
} as const;

export type Config = typeof config;
