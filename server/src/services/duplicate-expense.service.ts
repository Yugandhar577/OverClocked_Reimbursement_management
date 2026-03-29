import { ExpenseStatus } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export interface DuplicateExpenseMatch {
  id: string;
  title: string;
  totalAmount: number;
  currency: string;
  expenseDate: Date;
  status: ExpenseStatus;
  similarity: number;
}

export class DuplicateExpenseService {
  async findPotentialDuplicates(expenseId: string, companyId: string): Promise<DuplicateExpenseMatch[]> {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, companyId },
      select: {
        id: true,
        creatorId: true,
        totalAmount: true,
        expenseDate: true,
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    const targetAmount = Number(expense.totalAmount);
    const lowerBound = targetAmount * 0.9;
    const upperBound = targetAmount * 1.1;

    const startDate = new Date(expense.expenseDate);
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(expense.expenseDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(23, 59, 59, 999);

    const matches = await prisma.expense.findMany({
      where: {
        companyId,
        creatorId: expense.creatorId,
        id: { not: expense.id },
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [
            ExpenseStatus.TO_SUBMIT,
            ExpenseStatus.SUBMITTED,
            ExpenseStatus.APPROVED,
            ExpenseStatus.REJECTED,
            ExpenseStatus.DONE,
          ],
        },
      },
      select: {
        id: true,
        title: true,
        totalAmount: true,
        currency: true,
        expenseDate: true,
        status: true,
      },
      orderBy: { expenseDate: 'desc' },
    });

    return matches
      .filter((candidate) => {
        const candidateAmount = Number(candidate.totalAmount);
        return candidateAmount >= lowerBound && candidateAmount <= upperBound;
      })
      .map((candidate) => {
        const candidateAmount = Number(candidate.totalAmount);
        const distance = Math.abs(targetAmount - candidateAmount);
        const similarity = targetAmount === 0 ? 0 : Math.max(0, 1 - distance / targetAmount);

        return {
          id: candidate.id,
          title: candidate.title,
          totalAmount: candidateAmount,
          currency: candidate.currency,
          expenseDate: candidate.expenseDate,
          status: candidate.status,
          similarity: Number(similarity.toFixed(4)),
        };
      });
  }
}

export const duplicateExpenseService = new DuplicateExpenseService();
