import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  country: z.string().min(2, 'Country is required'),
  baseCurrency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
  logoUrl: z.string().url().optional().nullable(),
  settings: z.record(z.unknown()).optional().default({}),
});

export const updateCompanySchema = createCompanySchema.partial();

export const companySettingsSchema = z.object({
  defaultApprovalType: z.enum(['SEQUENTIAL', 'PERCENTAGE', 'ANY']).optional(),
  autoApproveThreshold: z.number().positive().optional(),
  requireReceiptAbove: z.number().positive().optional(),
  allowedCategories: z.array(z.string()).optional(),
  fiscalYearStart: z.string().optional(),
  expenseReportingPeriod: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
