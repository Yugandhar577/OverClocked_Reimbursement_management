import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanySettingsInput,
} from '../validators/company.validator.js';

export class CompanyService {
  async getById(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            expenseCategories: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return company;
  }

  async update(companyId: string, input: UpdateCompanyInput) {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: input,
    });

    return company;
  }

  async updateSettings(companyId: string, settings: CompanySettingsInput) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const currentSettings = (company.settings as Record<string, unknown>) || {};
    const mergedSettings = { ...currentSettings, ...settings };

    return prisma.company.update({
      where: { id: companyId },
      data: { settings: mergedSettings },
    });
  }

  async getStats(companyId: string) {
    const [
      userCount,
      departmentCount,
      categoryCount,
      expenseStats,
    ] = await Promise.all([
      prisma.user.count({ where: { companyId } }),
      prisma.department.count({ where: { companyId } }),
      prisma.expenseCategory.count({ where: { companyId } }),
      prisma.expense.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      users: userCount,
      departments: departmentCount,
      categories: categoryCount,
      expenses: expenseStats,
    };
  }
}

export const companyService = new CompanyService();
