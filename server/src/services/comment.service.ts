import {
  AuditAction,
  CommentType,
  NotificationType,
  Prisma,
  UserRole,
} from '@prisma/client';
import prisma from '../config/database.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { notificationService } from './notification.service.js';
import { auditService } from './audit.service.js';
import { CreateCommentInput } from '../validators/comment.validator.js';

type ExpenseCommentWithAuthor = Prisma.ExpenseCommentGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
  };
}>;

export interface ThreadedComment extends ExpenseCommentWithAuthor {
  replies: ThreadedComment[];
}

interface CommentActor {
  userId: string;
  companyId: string;
  role: string;
}

export class CommentService {
  async listExpenseComments(expenseId: string, actor: CommentActor) {
    const expense = await this.assertExpenseAccess(expenseId, actor);

    const comments = await prisma.expenseComment.findMany({
      where: { expenseId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      expenseId: expense.id,
      comments: this.toThread(comments),
    };
  }

  async createComment(expenseId: string, actor: CommentActor, input: CreateCommentInput) {
    const expense = await this.assertExpenseAccess(expenseId, actor);

    if (input.parentId) {
      const parent = await prisma.expenseComment.findFirst({
        where: {
          id: input.parentId,
          expenseId,
        },
        select: { id: true },
      });

      if (!parent) {
        throw new NotFoundError('Parent comment not found');
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const comment = await tx.expenseComment.create({
        data: {
          expenseId,
          authorId: actor.userId,
          parentId: input.parentId ?? null,
          content: input.content,
          commentType: input.commentType ?? CommentType.MESSAGE,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      await auditService.log(
        {
          companyId: actor.companyId,
          userId: actor.userId,
          action: AuditAction.CREATE,
          entityType: 'expense_comment',
          entityId: comment.id,
          oldData: null,
          newData: {
            expenseId,
            parentId: comment.parentId,
            commentType: comment.commentType,
          },
        },
        tx
      );

      return comment;
    });

    await this.notifyCommentParticipants(expenseId, actor.userId, expense.creatorId);

    return created;
  }

  async deleteComment(commentId: string, actor: CommentActor) {
    const comment = await prisma.expenseComment.findUnique({
      where: { id: commentId },
      include: {
        expense: {
          select: {
            id: true,
            companyId: true,
            creatorId: true,
            approvalSteps: {
              select: { approverId: true },
            },
          },
        },
      },
    });

    if (!comment || comment.expense.companyId !== actor.companyId) {
      throw new NotFoundError('Comment not found');
    }

    const role = actor.role as UserRole;
    const isAdmin =
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.ADMIN ||
      role === UserRole.FINANCE;
    const isAuthor = comment.authorId === actor.userId;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenError('You are not allowed to delete this comment');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const deletedComment = await tx.expenseComment.update({
        where: { id: commentId },
        data: {
          content: '[deleted]',
          commentType: CommentType.SYSTEM,
        },
      });

      await auditService.log(
        {
          companyId: actor.companyId,
          userId: actor.userId,
          action: AuditAction.DELETE,
          entityType: 'expense_comment',
          entityId: deletedComment.id,
          oldData: {
            content: comment.content,
            commentType: comment.commentType,
          },
          newData: {
            content: '[deleted]',
            commentType: CommentType.SYSTEM,
          },
        },
        tx
      );

      return deletedComment;
    });

    return updated;
  }

  private async assertExpenseAccess(expenseId: string, actor: CommentActor) {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        companyId: actor.companyId,
      },
      select: {
        id: true,
        creatorId: true,
        approvalSteps: {
          select: {
            approverId: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    const role = actor.role as UserRole;
    const isAdmin =
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.ADMIN ||
      role === UserRole.FINANCE;
    const isOwner = expense.creatorId === actor.userId;
    const isApprover = expense.approvalSteps.some((step) => step.approverId === actor.userId);

    if (!isAdmin && !isOwner && !isApprover) {
      throw new ForbiddenError('You are not allowed to view this expense thread');
    }

    return expense;
  }

  private toThread(comments: ExpenseCommentWithAuthor[]): ThreadedComment[] {
    const commentMap = new Map<string, ThreadedComment>();
    const roots: ThreadedComment[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    commentMap.forEach((comment) => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return roots;
  }

  private async notifyCommentParticipants(
    expenseId: string,
    actorUserId: string,
    expenseCreatorId: string
  ) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: {
        id: true,
        title: true,
        approvalSteps: {
          select: {
            approverId: true,
          },
        },
      },
    });

    if (!expense) {
      return;
    }

    const recipientIds = new Set<string>([
      expenseCreatorId,
      ...expense.approvalSteps.map((step) => step.approverId),
    ]);
    recipientIds.delete(actorUserId);

    const payloads = Array.from(recipientIds).map((userId) => ({
      userId,
      type: NotificationType.COMMENT_ADDED,
      title: 'New comment on expense',
      message: `A new comment was added to "${expense.title}".`,
      data: { expenseId },
    }));

    await notificationService.createBulkNotifications(payloads);
  }
}

export const commentService = new CommentService();
