import { Prisma, ExpenseStatus, UserRole } from '@prisma/client';
import prisma from '../config/database.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import {
  CreateExpenseInput,
  ExpenseFilterInput,
  ExpenseLineInput,
  UpdateExpenseInput,
  UpdateExpenseLineInput,
} from '../validators/expense.validator.js';
import { approvalEngineService } from './approval.engine.js';

export class ExpenseService {
  async getAll(
    companyId: string,
    userId: string,
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

    const skip = (page - 1) * limit;
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
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
              comments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(expenseId: string, companyId: string, userId: string, userRole: string) {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        companyId,
      },
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

    const role = userRole as UserRole;
    const isAdmin =
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.ADMIN ||
      role === UserRole.FINANCE;
    const isOwner = expense.creatorId === userId;
    const isApprover = expense.approvalSteps.some((step) => step.approverId === userId);

    if (!isAdmin && !isOwner && !isApprover) {
      throw new NotFoundError('Expense not found');
    }

    return expense;
  }

  async create(userId: string, companyId: string, input: CreateExpenseInput) {
    return prisma.expense.create({
      data: {
        companyId,
        creatorId: userId,
        categoryId: input.categoryId ?? null,
        title: input.title,
        description: input.description ?? null,
        totalAmount: input.totalAmount,
        currency: input.currency ?? 'USD',
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

  async update(expenseId: string, userId: string, userRole: string, input: UpdateExpenseInput) {
    const expense = await this.getMutableExpense(expenseId, userId, userRole);
    if (
      expense.status !== ExpenseStatus.DRAFT &&
      expense.status !== ExpenseStatus.TO_SUBMIT &&
      expense.status !== ExpenseStatus.REJECTED
    ) {
      throw new BadRequestError('Can only update draft or rejected expenses');
    }

    return prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.totalAmount !== undefined && { totalAmount: input.totalAmount }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.expenseDate !== undefined && { expenseDate: new Date(input.expenseDate) }),
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

  async delete(expenseId: string, userId: string, userRole: string) {
    const expense = await this.getMutableExpense(expenseId, userId, userRole);
    if (
      expense.status !== ExpenseStatus.DRAFT &&
      expense.status !== ExpenseStatus.TO_SUBMIT &&
      expense.status !== ExpenseStatus.REJECTED
    ) {
      throw new BadRequestError('Can only delete draft or rejected expenses');
    }

    await prisma.expense.delete({ where: { id: expenseId } });
  }

  async submit(expenseId: string, userId: string, companyId: string) {
    return approvalEngineService.submitExpenseForApproval(expenseId, companyId, userId);
  }

  async addLine(expenseId: string, userId: string, input: ExpenseLineInput) {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        creatorId: userId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (
      expense.status !== ExpenseStatus.DRAFT &&
      expense.status !== ExpenseStatus.TO_SUBMIT &&
      expense.status !== ExpenseStatus.REJECTED
    ) {
      throw new BadRequestError('Can only add lines to draft or rejected expenses');
    }

    const line = await prisma.expenseLine.create({
      data: {
        expenseId,
        categoryId: input.categoryId ?? null,
        description: input.description,
        amount: input.amount,
        currency: input.currency ?? 'USD',
        vendor: input.vendor ?? null,
        lineDate: new Date(input.lineDate),
      },
      include: {
        category: true,
      },
    });

    await this.recalculateExpenseTotal(expenseId);
    return line;
  }

  async updateLine(lineId: string, userId: string, input: UpdateExpenseLineInput) {
    const line = await prisma.expenseLine.findUnique({
      where: { id: lineId },
      include: {
        expense: {
          select: {
            id: true,
            creatorId: true,
            status: true,
          },
        },
      },
    });

    if (!line || line.expense.creatorId !== userId) {
      throw new NotFoundError('Expense line not found');
    }

    if (
      line.expense.status !== ExpenseStatus.DRAFT &&
      line.expense.status !== ExpenseStatus.TO_SUBMIT &&
      line.expense.status !== ExpenseStatus.REJECTED
    ) {
      throw new BadRequestError('Can only update lines on draft or rejected expenses');
    }

    const updated = await prisma.expenseLine.update({
      where: { id: lineId },
      data: {
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.vendor !== undefined && { vendor: input.vendor }),
        ...(input.lineDate !== undefined && { lineDate: new Date(input.lineDate) }),
      },
      include: {
        category: true,
      },
    });

    await this.recalculateExpenseTotal(line.expenseId);
    return updated;
  }

  async deleteLine(lineId: string, userId: string) {
    const line = await prisma.expenseLine.findUnique({
      where: { id: lineId },
      include: {
        expense: {
          select: {
            id: true,
            creatorId: true,
            status: true,
          },
        },
      },
    });

    if (!line || line.expense.creatorId !== userId) {
      throw new NotFoundError('Expense line not found');
    }

    if (
      line.expense.status !== ExpenseStatus.DRAFT &&
      line.expense.status !== ExpenseStatus.TO_SUBMIT &&
      line.expense.status !== ExpenseStatus.REJECTED
    ) {
      throw new BadRequestError('Can only delete lines from draft or rejected expenses');
    }

    await prisma.expenseLine.delete({ where: { id: lineId } });
    await this.recalculateExpenseTotal(line.expenseId);
  }

  private async recalculateExpenseTotal(expenseId: string) {
    const lines = await prisma.expenseLine.findMany({
      where: { expenseId },
      select: { amount: true },
    });

    const total = lines.reduce((sum, line) => sum + Number(line.amount), 0);
    await prisma.expense.update({
      where: { id: expenseId },
      data: { totalAmount: total },
    });
  }

  private async getMutableExpense(expenseId: string, userId: string, userRole: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: {
        id: true,
        creatorId: true,
        status: true,
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    const role = userRole as UserRole;
    const isAdmin =
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.ADMIN ||
      role === UserRole.FINANCE;
    if (!isAdmin && expense.creatorId !== userId) {
      throw new NotFoundError('Expense not found');
    }

    return expense;
  }
}

export const expenseService = new ExpenseService();
