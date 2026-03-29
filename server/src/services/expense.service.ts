import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseLineInput,
  ExpenseFilterInput,
} from '../validators/expense.validator.js';
import { ExpenseStatus, UserRole, Prisma } from '@prisma/client';

export class ExpenseService {
  async createExpense(
    creatorId: string,
    companyId: string,
    input: CreateExpenseInput
  ) {
    return prisma.expense.create({
      data: {
        companyId,
        creatorId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        totalAmount: input.totalAmount,
        currency: input.currency || 'USD',
        expenseDate: new Date(input.expenseDate),
        status: ExpenseStatus.DRAFT,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        expenseLines: true,
        receipts: true,
      },
    });
  }

  async getExpense(expenseId: string, userId: string, companyId: string, userRole: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, companyId },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        },
        expenseLines: {
          include: {
            category: true,
            receipts: true,
          },
        },
        receipts: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        approvalSteps: {
          include: {
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    // Authorization check
    const isOwner = expense.creatorId === userId;
    const isAdmin = new Set<string>([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.FINANCE,
    ]).has(userRole);
    const isApprover = expense.approvalSteps.some((step) => step.approverId === userId);

    if (!isOwner && !isAdmin && !isApprover) {
      throw new NotFoundError('Expense not found');
    }

    return expense;
  }

  async listExpenses(
    userId: string,
    companyId: string,
    userRole: string,
    filters: ExpenseFilterInput
  ) {
    const {
      page = 1,
      limit = 20,
      status,
      categoryId,
      creatorId,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause based on role
    const where: Prisma.ExpenseWhereInput = {
      companyId,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(fromDate && { expenseDate: { gte: new Date(fromDate) } }),
      ...(toDate && { expenseDate: { lte: new Date(toDate) } }),
      ...(minAmount && { totalAmount: { gte: minAmount } }),
      ...(maxAmount && { totalAmount: { lte: maxAmount } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Role-based filtering
    if (userRole === UserRole.EMPLOYEE) {
      where.creatorId = userId;
    } else if (userRole === UserRole.MANAGER) {
      where.OR = [
        { creatorId: userId },
        {
          approvalSteps: {
            some: { approverId: userId },
          },
        },
      ];
    } else if (creatorId) {
      where.creatorId = creatorId;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              expenseLines: true,
              receipts: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateExpense(
    expenseId: string,
    userId: string,
    companyId: string,
    input: UpdateExpenseInput
  ) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, companyId, creatorId: userId },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestError('Can only update draft expenses');
    }

    return prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.totalAmount && { totalAmount: input.totalAmount }),
        ...(input.currency && { currency: input.currency }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.expenseDate && { expenseDate: new Date(input.expenseDate) }),
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        expenseLines: true,
        receipts: true,
      },
    });
  }

  async deleteExpense(expenseId: string, userId: string, companyId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, companyId, creatorId: userId },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestError('Can only delete draft expenses');
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });
  }

  async submitExpense(expenseId: string, userId: string, companyId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, companyId, creatorId: userId },
      include: {
        creator: {
          include: {
            reportsTo: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.DRAFT && expense.status !== ExpenseStatus.TO_SUBMIT) {
      throw new BadRequestError('Expense cannot be submitted');
    }

    // Update expense to submitted status (approval engine will create steps)
    return prisma.expense.update({
      where: { id: expenseId },
      data: {
        status: ExpenseStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Expense Lines
  async addExpenseLine(expenseId: string, userId: string, input: ExpenseLineInput) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, creatorId: userId },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestError('Can only add lines to draft expenses');
    }

    const line = await prisma.expenseLine.create({
      data: {
        expenseId,
        categoryId: input.categoryId,
        description: input.description,
        amount: input.amount,
        currency: input.currency || 'USD',
        vendor: input.vendor,
        lineDate: new Date(input.lineDate),
      },
      include: {
        category: true,
      },
    });

    // Update total amount on expense
    await this.recalculateExpenseTotal(expenseId);

    return line;
  }

  async updateExpenseLine(
    expenseId: string,
    lineId: string,
    userId: string,
    input: Partial<ExpenseLineInput>
  ) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, creatorId: userId },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestError('Can only update lines on draft expenses');
    }

    const line = await prisma.expenseLine.update({
      where: { id: lineId },
      data: {
        ...(input.description && { description: input.description }),
        ...(input.amount && { amount: input.amount }),
        ...(input.currency && { currency: input.currency }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.vendor !== undefined && { vendor: input.vendor }),
        ...(input.lineDate && { lineDate: new Date(input.lineDate) }),
      },
      include: {
        category: true,
      },
    });

    // Update total amount on expense
    await this.recalculateExpenseTotal(expenseId);

    return line;
  }

  async deleteExpenseLine(expenseId: string, lineId: string, userId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, creatorId: userId },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestError('Can only delete lines from draft expenses');
    }

    await prisma.expenseLine.delete({
      where: { id: lineId },
    });

    // Update total amount on expense
    await this.recalculateExpenseTotal(expenseId);
  }

  private async recalculateExpenseTotal(expenseId: string) {
    const lines = await prisma.expenseLine.findMany({
      where: { expenseId },
    });

    const total = lines.reduce((sum, line) => sum + Number(line.amount), 0);

    await prisma.expense.update({
      where: { id: expenseId },
      data: { totalAmount: total },
    });
  }
}

export const expenseService = new ExpenseService();
