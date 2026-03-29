import {
  ApprovalAction,
  ApprovalType,
  AuditAction,
  ExpenseStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import prisma from '../config/database.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import { currencyService } from './currency.service.js';
import { duplicateExpenseService } from './duplicate-expense.service.js';
import { notificationService } from './notification.service.js';
import { auditService } from './audit.service.js';
import {
  CreateApprovalRuleInput,
  PendingApprovalsQueryInput,
  UpdateApprovalRuleInput,
} from '../validators/approval.validator.js';

export interface DecisionStepState {
  action: ApprovalAction;
  isVipApprover: boolean;
  isRequired: boolean;
}

export interface EvaluateDecisionInput {
  approvalType: ApprovalType;
  percentageRequired?: number | null;
  steps: DecisionStepState[];
}

export type WorkflowDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export const evaluateApprovalOutcome = (input: EvaluateDecisionInput): WorkflowDecision => {
  if (input.steps.some((step) => step.isRequired && step.action === ApprovalAction.REJECTED)) {
    return 'REJECTED';
  }

  if (input.steps.some((step) => step.isVipApprover && step.action === ApprovalAction.APPROVED)) {
    return 'APPROVED';
  }

  if (input.approvalType === ApprovalType.ANY) {
    if (input.steps.some((step) => step.action === ApprovalAction.APPROVED)) return 'APPROVED';
    if (input.steps.some((step) => step.action === ApprovalAction.REJECTED)) return 'REJECTED';
    return 'PENDING';
  }

  if (input.approvalType === ApprovalType.PERCENTAGE) {
    const considered = input.steps.filter((step) => step.action !== ApprovalAction.SKIPPED);
    const total = considered.length;
    if (total === 0) return 'APPROVED';

    const required = Math.max(1, Math.ceil((total * (input.percentageRequired ?? 100)) / 100));
    const approved = considered.filter((step) => step.action === ApprovalAction.APPROVED).length;
    const pending = considered.filter((step) => step.action === ApprovalAction.PENDING).length;

    if (approved >= required) return 'APPROVED';
    if (approved + pending < required) return 'REJECTED';
    return 'PENDING';
  }

  if (input.steps.some((step) => step.action === ApprovalAction.REJECTED)) return 'REJECTED';
  if (input.steps.every((step) => step.action === ApprovalAction.APPROVED || step.action === ApprovalAction.SKIPPED)) {
    return 'APPROVED';
  }
  return 'PENDING';
};

interface StepDescriptor {
  userId: string;
  isRequired: boolean;
  isVipApprover: boolean;
  skipForEscalation: boolean;
  skipReason?: string;
}

type RuleWithApprovers = Prisma.ApprovalRuleGetPayload<{
  include: {
    approvers: {
      include: {
        user: {
          select: {
            id: true;
            companyId: true;
            isVipApprover: true;
            isRequiredApprover: true;
          };
        };
      };
    };
  };
}>;

export class ApprovalEngineService {
  async listRules(companyId: string, filters: { includeInactive?: boolean; departmentId?: string }) {
    return prisma.approvalRule.findMany({
      where: {
        companyId,
        ...(filters.includeInactive ? {} : { isActive: true }),
        ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      },
      include: {
        approvers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isVipApprover: true,
                isRequiredApprover: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createRule(companyId: string, actorUserId: string, input: CreateApprovalRuleInput) {
    await this.assertApproversInCompany(companyId, input.approvers.map((item) => item.userId));
    if (new Set(input.approvers.map((item) => item.userId)).size !== input.approvers.length) {
      throw new BadRequestError('Duplicate approvers are not allowed in a rule');
    }

    const sortedApprovers = [...input.approvers].sort((a, b) => a.sequence - b.sequence);

    const rule = await prisma.$transaction(async (tx) => {
      const created = await tx.approvalRule.create({
        data: {
          companyId,
          departmentId: input.departmentId ?? null,
          name: input.name,
          description: input.description ?? null,
          approvalType: input.approvalType ?? ApprovalType.SEQUENTIAL,
          percentageRequired: input.percentageRequired ?? null,
          minAmount: input.minAmount ?? null,
          maxAmount: input.maxAmount ?? null,
          priority: input.priority ?? 0,
        },
      });

      await tx.approvalRuleApprover.createMany({
        data: sortedApprovers.map((approver) => ({
          ruleId: created.id,
          userId: approver.userId,
          sequence: approver.sequence,
          isRequired: approver.isRequired ?? false,
        })),
      });

      await auditService.log(
        {
          companyId,
          userId: actorUserId,
          action: AuditAction.CREATE,
          entityType: 'approval_rule',
          entityId: created.id,
          newData: {
            name: created.name,
            approvalType: created.approvalType,
            approverCount: sortedApprovers.length,
          },
        },
        tx
      );

      return created;
    });

    return prisma.approvalRule.findUnique({
      where: { id: rule.id },
      include: {
        approvers: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  async updateRule(ruleId: string, companyId: string, actorUserId: string, input: UpdateApprovalRuleInput) {
    const existing = await prisma.approvalRule.findFirst({
      where: { id: ruleId, companyId },
      include: { approvers: true },
    });
    if (!existing) throw new NotFoundError('Approval rule not found');

    if (input.approvers) {
      await this.assertApproversInCompany(companyId, input.approvers.map((item: { userId: string }) => item.userId));
      if (new Set(input.approvers.map((item: { userId: string }) => item.userId)).size !== input.approvers.length) {
        throw new BadRequestError('Duplicate approvers are not allowed in a rule');
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.approvalRule.update({
        where: { id: ruleId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.departmentId !== undefined && { departmentId: input.departmentId }),
          ...(input.approvalType !== undefined && { approvalType: input.approvalType }),
          ...(input.percentageRequired !== undefined && { percentageRequired: input.percentageRequired }),
          ...(input.minAmount !== undefined && { minAmount: input.minAmount }),
          ...(input.maxAmount !== undefined && { maxAmount: input.maxAmount }),
          ...(input.priority !== undefined && { priority: input.priority }),
        },
      });

      if (input.approvers) {
        const sorted = [...input.approvers].sort((a, b) => a.sequence - b.sequence);
        await tx.approvalRuleApprover.deleteMany({ where: { ruleId } });
        await tx.approvalRuleApprover.createMany({
          data: sorted.map((approver) => ({
            ruleId,
            userId: approver.userId,
            sequence: approver.sequence,
            isRequired: approver.isRequired ?? false,
          })),
        });
      }

      await auditService.log(
        {
          companyId,
          userId: actorUserId,
          action: AuditAction.UPDATE,
          entityType: 'approval_rule',
          entityId: ruleId,
          oldData: {
            approvalType: existing.approvalType,
            percentageRequired: existing.percentageRequired,
          },
          newData: input as Prisma.InputJsonValue,
        },
        tx
      );
    });

    return prisma.approvalRule.findUnique({
      where: { id: ruleId },
      include: {
        approvers: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  async deactivateRule(ruleId: string, companyId: string, actorUserId: string) {
    const existing = await prisma.approvalRule.findFirst({
      where: { id: ruleId, companyId },
      select: { id: true, isActive: true },
    });
    if (!existing) throw new NotFoundError('Approval rule not found');
    if (!existing.isActive) return prisma.approvalRule.findUnique({ where: { id: ruleId } });

    return prisma.$transaction(async (tx) => {
      const updated = await tx.approvalRule.update({
        where: { id: ruleId },
        data: { isActive: false },
      });
      await auditService.log(
        {
          companyId,
          userId: actorUserId,
          action: AuditAction.DELETE,
          entityType: 'approval_rule',
          entityId: ruleId,
          oldData: { isActive: true },
          newData: { isActive: false },
        },
        tx
      );
      return updated;
    });
  }

  async submitExpenseForApproval(expenseId: string, companyId: string, submitterId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, companyId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            departmentId: true,
            reportsToId: true,
            companyId: true,
          },
        },
      },
    });

    if (!expense) throw new NotFoundError('Expense not found');
    if (expense.creatorId !== submitterId) throw new ForbiddenError('You can only submit your own expenses');
    if (expense.status !== ExpenseStatus.DRAFT && expense.status !== ExpenseStatus.TO_SUBMIT) {
      throw new BadRequestError('Expense cannot be submitted from its current status');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { baseCurrency: true },
    });
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const total = Number(expense.totalAmount);
    let convertedAmount = total;
    let exchangeRate = 1;
    if (expense.currency !== company.baseCurrency) {
      const conversion = await currencyService.convertCurrency(total, expense.currency, company.baseCurrency);
      convertedAmount = conversion.convertedAmount;
      exchangeRate = conversion.exchangeRate;
    }

    const rule = await this.getApplicableRule(companyId, expense.creator.departmentId, convertedAmount);
    const steps = await this.buildStepDescriptors(expense.creator, convertedAmount, rule);
    const duplicates = await duplicateExpenseService.findPotentialDuplicates(expense.id, companyId);

    if (steps.length === 0) {
      const autoApproved = await prisma.expense.update({
        where: { id: expense.id },
        data: {
          status: ExpenseStatus.APPROVED,
          submittedAt: new Date(),
          approvedAt: new Date(),
          convertedAmount,
          exchangeRate,
        },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvalSteps: {
            include: { approver: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { sequence: 'asc' },
          },
        },
      });

      await notificationService.createNotification({
        userId: expense.creatorId,
        type: NotificationType.EXPENSE_APPROVED,
        title: 'Expense approved',
        message: `Your expense "${expense.title}" was auto-approved.`,
        data: { expenseId: expense.id },
      });

      await auditService.log({
        companyId,
        userId: submitterId,
        action: AuditAction.SUBMIT,
        entityType: 'expense',
        entityId: expense.id,
        oldData: { status: expense.status },
        newData: { status: ExpenseStatus.APPROVED, autoApproved: true },
      });

      return { expense: autoApproved, duplicateWarnings: duplicates, appliedRuleId: rule?.id ?? null };
    }

    await prisma.$transaction(async (tx) => {
      await tx.approvalStep.deleteMany({ where: { expenseId: expense.id } });

      const now = new Date();
      const data = steps.map((step, index) => ({
        expenseId: expense.id,
        approverId: step.userId,
        sequence: index + 1,
        action: step.skipForEscalation ? ApprovalAction.SKIPPED : ApprovalAction.PENDING,
        comment: step.skipForEscalation ? step.skipReason ?? 'Auto-escalated by approval limit' : null,
        actionAt: step.skipForEscalation ? now : null,
      }));

      if (data.every((row) => row.action === ApprovalAction.SKIPPED)) {
        data[data.length - 1].action = ApprovalAction.PENDING;
        data[data.length - 1].comment = null;
        data[data.length - 1].actionAt = null;
      }

      await tx.approvalStep.createMany({ data });

      await tx.expense.update({
        where: { id: expense.id },
        data: {
          status: ExpenseStatus.SUBMITTED,
          submittedAt: now,
          approvedAt: null,
          rejectedAt: null,
          convertedAmount,
          exchangeRate,
        },
      });

      await auditService.log(
        {
          companyId,
          userId: submitterId,
          action: AuditAction.SUBMIT,
          entityType: 'expense',
          entityId: expense.id,
          oldData: { status: expense.status },
          newData: { status: ExpenseStatus.SUBMITTED, appliedRuleId: rule?.id ?? null, approvalStepCount: data.length },
        },
        tx
      );
    });

    const refreshed = await this.getExpenseForApproval(expense.id, companyId);
    await this.notifyNextApprover(refreshed);

    return { expense: refreshed, duplicateWarnings: duplicates, appliedRuleId: rule?.id ?? null };
  }

  async getPendingApprovals(approverId: string, companyId: string, filters: PendingApprovalsQueryInput) {
    const steps = await prisma.approvalStep.findMany({
      where: {
        approverId,
        action: ApprovalAction.PENDING,
        expense: { companyId, status: ExpenseStatus.SUBMITTED },
      },
      include: {
        expense: {
          include: {
            creator: { select: { id: true, firstName: true, lastName: true, email: true } },
            approvalSteps: { orderBy: { sequence: 'asc' } },
          },
        },
      },
      orderBy: { expense: { submittedAt: 'asc' } },
    });

    const actionable = steps.filter((step) => this.findFirstPending(step.expense.approvalSteps)?.id === step.id);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const start = (page - 1) * limit;
    const items = actionable.slice(start, start + limit);

    return {
      data: items.map((step) => ({ stepId: step.id, sequence: step.sequence, expense: step.expense })),
      pagination: {
        page,
        limit,
        total: actionable.length,
        totalPages: Math.ceil(actionable.length / limit),
      },
    };
  }

  async approveExpense(expenseId: string, approverId: string, companyId: string, comment?: string | null) {
    return this.handleDecision(expenseId, approverId, companyId, ApprovalAction.APPROVED, comment);
  }

  async rejectExpense(expenseId: string, approverId: string, companyId: string, comment?: string | null) {
    return this.handleDecision(expenseId, approverId, companyId, ApprovalAction.REJECTED, comment);
  }

  private async handleDecision(
    expenseId: string,
    approverId: string,
    companyId: string,
    action: ApprovalAction,
    comment?: string | null
  ) {
    const expense = await this.getExpenseForApproval(expenseId, companyId);
    if (expense.status !== ExpenseStatus.SUBMITTED) throw new BadRequestError('Expense is not pending approval');
    if (expense.creatorId === approverId) throw new BadRequestError('Self-approval is not allowed');

    const step = expense.approvalSteps.find((row) => row.approverId === approverId && row.action === ApprovalAction.PENDING);
    if (!step) throw new NotFoundError('No pending approval step found for this user');
    if (this.findFirstPending(expense.approvalSteps)?.id !== step.id) {
      throw new BadRequestError('This expense is waiting on a different approver');
    }

    const rule = await this.getApplicableRule(companyId, expense.creator.departmentId, Number(expense.convertedAmount ?? expense.totalAmount));
    const requiredApprovers = new Set((rule?.approvers ?? []).filter((row) => row.isRequired).map((row) => row.userId));

    const updated = await prisma.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id: step.id },
        data: { action, comment: comment ?? null, actionAt: new Date() },
      });

      const latest = await this.getExpenseForApproval(expense.id, companyId, tx);
      const decision = this.resolveDecision(latest, rule, requiredApprovers);

      if (decision === 'APPROVED') {
        await tx.expense.update({
          where: { id: expense.id },
          data: { status: ExpenseStatus.APPROVED, approvedAt: new Date(), rejectedAt: null },
        });
        await tx.approvalStep.updateMany({
          where: { expenseId: expense.id, action: ApprovalAction.PENDING },
          data: { action: ApprovalAction.SKIPPED, comment: 'Closed after final decision', actionAt: new Date() },
        });
      }

      if (decision === 'REJECTED') {
        await tx.expense.update({
          where: { id: expense.id },
          data: { status: ExpenseStatus.REJECTED, rejectedAt: new Date() },
        });
        await tx.approvalStep.updateMany({
          where: { expenseId: expense.id, action: ApprovalAction.PENDING },
          data: { action: ApprovalAction.SKIPPED, comment: 'Closed after rejection', actionAt: new Date() },
        });
      }

      await auditService.log(
        {
          companyId,
          userId: approverId,
          action: action === ApprovalAction.APPROVED ? AuditAction.APPROVE : AuditAction.REJECT,
          entityType: 'approval_step',
          entityId: step.id,
          oldData: { action: ApprovalAction.PENDING },
          newData: { action, decision },
        },
        tx
      );

      return this.getExpenseForApproval(expense.id, companyId, tx);
    });

    if (updated.status === ExpenseStatus.APPROVED) {
      await notificationService.createNotification({
        userId: updated.creatorId,
        type: NotificationType.EXPENSE_APPROVED,
        title: 'Expense approved',
        message: `Your expense "${updated.title}" has been approved.`,
        data: { expenseId: updated.id },
      });
    } else if (updated.status === ExpenseStatus.REJECTED) {
      await notificationService.createNotification({
        userId: updated.creatorId,
        type: NotificationType.EXPENSE_REJECTED,
        title: 'Expense rejected',
        message: `Your expense "${updated.title}" has been rejected.`,
        data: { expenseId: updated.id },
      });
    } else {
      await this.notifyNextApprover(updated);
    }

    return updated;
  }

  private resolveDecision(expense: any, rule: RuleWithApprovers | null, requiredApprovers: Set<string>): WorkflowDecision {
    return evaluateApprovalOutcome({
      approvalType: rule?.approvalType ?? ApprovalType.SEQUENTIAL,
      percentageRequired: rule?.percentageRequired,
      steps: expense.approvalSteps.map((row: any) => ({
        action: row.action,
        isVipApprover: row.approver.isVipApprover,
        isRequired: requiredApprovers.has(row.approverId) || row.approver.isRequiredApprover,
      })),
    });
  }

  private async notifyNextApprover(expense: any) {
    const next = this.findFirstPending(expense.approvalSteps);
    if (!next || !next.approverId) return;
    await notificationService.createNotification({
      userId: next.approverId,
      type: NotificationType.APPROVAL_REQUIRED,
      title: 'Approval required',
      message: `Expense "${expense.title}" is waiting for your approval.`,
      data: { expenseId: expense.id, stepId: next.id },
    });
  }

  private findFirstPending(steps: Array<{ id: string; action: ApprovalAction; sequence?: number; approverId?: string }>) {
    return [...steps]
      .sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0))
      .find((step) => step.action === ApprovalAction.PENDING);
  }

  private async buildStepDescriptors(
    submitter: { id: string; companyId: string; departmentId: string | null; reportsToId: string | null },
    amount: number,
    rule: RuleWithApprovers | null
  ): Promise<StepDescriptor[]> {
    const managers = await this.resolveManagerChain(submitter, amount);
    const steps: StepDescriptor[] = managers.map((manager) => {
      const limit = manager.approvalLimit === null ? null : Number(manager.approvalLimit);
      const skipForEscalation = limit !== null && amount > limit;
      return {
        userId: manager.id,
        isRequired: manager.isRequiredApprover,
        isVipApprover: manager.isVipApprover,
        skipForEscalation,
        skipReason: skipForEscalation
          ? `Auto-escalated because amount exceeds ${manager.firstName} ${manager.lastName}'s approval limit`
          : undefined,
      };
    });

    if (rule) {
      const sorted = [...rule.approvers].sort((a, b) => a.sequence - b.sequence);
      sorted.forEach((approver) => {
        if (approver.userId === submitter.id) return;
        const existing = steps.find((step) => step.userId === approver.userId);
        if (existing) {
          existing.isRequired = existing.isRequired || approver.isRequired || approver.user.isRequiredApprover;
          existing.isVipApprover = existing.isVipApprover || approver.user.isVipApprover;
          return;
        }
        steps.push({
          userId: approver.userId,
          isRequired: approver.isRequired || approver.user.isRequiredApprover,
          isVipApprover: approver.user.isVipApprover,
          skipForEscalation: false,
        });
      });
    }

    return steps.filter((step) => step.userId !== submitter.id);
  }

  private async resolveManagerChain(
    submitter: { id: string; companyId: string; departmentId: string | null; reportsToId: string | null },
    amount: number
  ) {
    const chain: any[] = [];
    const visited = new Set<string>([submitter.id]);
    let cursor = submitter.reportsToId;
    let depth = 0;

    while (cursor && depth < 12) {
      const manager = await prisma.user.findUnique({
        where: { id: cursor },
        select: {
          id: true,
          companyId: true,
          firstName: true,
          lastName: true,
          reportsToId: true,
          departmentId: true,
          approvalLimit: true,
          isVipApprover: true,
          isRequiredApprover: true,
          role: true,
        },
      });

      if (!manager || manager.companyId !== submitter.companyId || visited.has(manager.id)) break;
      visited.add(manager.id);
      depth += 1;

      if (chain.length === 0 && submitter.departmentId && manager.departmentId !== submitter.departmentId) {
        cursor = manager.reportsToId;
        continue;
      }

      chain.push(manager);
      const limit = manager.approvalLimit === null ? null : Number(manager.approvalLimit);
      if (limit === null || amount <= limit) break;
      cursor = manager.reportsToId;
    }

    if (chain.length === 0 && submitter.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: submitter.departmentId },
        select: { managerId: true },
      });
      if (department?.managerId && department.managerId !== submitter.id) {
        const manager = await prisma.user.findUnique({
          where: { id: department.managerId },
          select: {
            id: true,
            companyId: true,
            firstName: true,
            lastName: true,
            reportsToId: true,
            departmentId: true,
            approvalLimit: true,
            isVipApprover: true,
            isRequiredApprover: true,
            role: true,
          },
        });
        if (manager && manager.companyId === submitter.companyId) chain.push(manager);
      }
    }

    return chain;
  }

  private async getApplicableRule(companyId: string, departmentId: string | null, amount: number): Promise<RuleWithApprovers | null> {
    const rules = await prisma.approvalRule.findMany({
      where: {
        companyId,
        isActive: true,
        OR: [{ departmentId: null }, ...(departmentId ? [{ departmentId }] : [])],
      },
      include: {
        approvers: {
          include: {
            user: {
              select: {
                id: true,
                companyId: true,
                isVipApprover: true,
                isRequiredApprover: true,
              },
            },
          },
        },
      },
    });

    const matched = rules.filter((rule) => {
      const minCheck = rule.minAmount === null || amount >= Number(rule.minAmount);
      const maxCheck = rule.maxAmount === null || amount <= Number(rule.maxAmount);
      return minCheck && maxCheck;
    });

    matched.sort((a, b) => {
      const deptA = a.departmentId && a.departmentId === departmentId ? 1 : 0;
      const deptB = b.departmentId && b.departmentId === departmentId ? 1 : 0;
      if (deptA !== deptB) return deptB - deptA;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return matched[0] ?? null;
  }

  private async assertApproversInCompany(companyId: string, approverIds: string[]) {
    const users = await prisma.user.findMany({
      where: { id: { in: approverIds }, companyId },
      select: { id: true },
    });
    if (users.length !== approverIds.length) {
      throw new BadRequestError('One or more approvers do not belong to this company');
    }
  }

  private async getExpenseForApproval(
    expenseId: string,
    companyId: string,
    db: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    const expense = await db.expense.findFirst({
      where: { id: expenseId, companyId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            departmentId: true,
            reportsToId: true,
          },
        },
        approvalSteps: {
          include: {
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isVipApprover: true,
                isRequiredApprover: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });
    if (!expense) throw new NotFoundError('Expense not found');
    return expense;
  }
}

export const approvalEngineService = new ApprovalEngineService();
