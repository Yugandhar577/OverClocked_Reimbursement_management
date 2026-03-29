import { AuditAction, ExpenseStatus, NotificationType, PaymentStatus } from '@prisma/client';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/errors.js';
import { auditService } from './audit.service.js';
import { notificationService } from './notification.service.js';
import { CreatePaymentOrderInput, VerifyPaymentInput } from '../validators/payment.validator.js';

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
}

export class PaymentService {
  async createOrder(companyId: string, actorUserId: string, input: CreatePaymentOrderInput) {
    this.assertRazorpayConfigured();

    const expense = await prisma.expense.findFirst({
      where: {
        id: input.expenseId,
        companyId,
      },
      include: {
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

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.APPROVED) {
      throw new BadRequestError('Only approved expenses can be sent to payment');
    }

    if (expense.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestError('Expense is already paid');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { baseCurrency: true },
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const amount = Number(expense.convertedAmount ?? expense.totalAmount);
    const amountInMinorUnit = Math.round(amount * 100);

    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getRazorpayAuthHeader(),
      },
      body: JSON.stringify({
        amount: amountInMinorUnit,
        currency: company.baseCurrency,
        receipt: expense.id,
        notes: {
          expenseId: expense.id,
          companyId,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      throw new InternalServerError(`Razorpay order creation failed: ${errorText || orderResponse.status}`);
    }

    const order = (await orderResponse.json()) as RazorpayOrderResponse;

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: { id: expense.id },
        data: {
          paymentStatus: PaymentStatus.IN_PAYMENT,
        },
      });

      await notificationService.createNotification(
        {
          userId: expense.creatorId,
          type: NotificationType.PAYMENT_PROCESSED,
          title: 'Payment initiated',
          message: `Payment has been initiated for "${expense.title}".`,
          data: {
            expenseId: expense.id,
            razorpayOrderId: order.id,
          },
        },
        tx
      );

      await auditService.log(
        {
          companyId,
          userId: actorUserId,
          action: AuditAction.PAYMENT,
          entityType: 'expense',
          entityId: expense.id,
          oldData: { paymentStatus: expense.paymentStatus },
          newData: {
            paymentStatus: PaymentStatus.IN_PAYMENT,
            razorpayOrderId: order.id,
            amount: order.amount,
            currency: order.currency,
          },
        },
        tx
      );
    });

    return {
      expenseId: expense.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      keyId: config.payment.razorpayKeyId,
    };
  }

  async verifyPayment(companyId: string, actorUserId: string, input: VerifyPaymentInput) {
    this.assertRazorpayConfigured();

    const expense = await prisma.expense.findFirst({
      where: {
        id: input.expenseId,
        companyId,
      },
      select: {
        id: true,
        title: true,
        creatorId: true,
        paymentStatus: true,
        status: true,
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status !== ExpenseStatus.APPROVED) {
      throw new BadRequestError('Payment can be verified only for approved expenses');
    }

    if (expense.paymentStatus === PaymentStatus.PAID) {
      return prisma.expense.findUnique({ where: { id: expense.id } });
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.payment.razorpayKeySecret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest('hex');

    if (!this.timingSafeEqual(expectedSignature, input.razorpaySignature)) {
      throw new BadRequestError('Invalid Razorpay signature');
    }

    const updatedExpense = await prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id: expense.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      await notificationService.createNotification(
        {
          userId: expense.creatorId,
          type: NotificationType.PAYMENT_PROCESSED,
          title: 'Payment completed',
          message: `Payment for "${expense.title}" has been completed.`,
          data: {
            expenseId: expense.id,
            razorpayOrderId: input.razorpayOrderId,
            razorpayPaymentId: input.razorpayPaymentId,
          },
        },
        tx
      );

      await auditService.log(
        {
          companyId,
          userId: actorUserId,
          action: AuditAction.PAYMENT,
          entityType: 'expense',
          entityId: expense.id,
          oldData: { paymentStatus: expense.paymentStatus },
          newData: {
            paymentStatus: PaymentStatus.PAID,
            razorpayOrderId: input.razorpayOrderId,
            razorpayPaymentId: input.razorpayPaymentId,
          },
        },
        tx
      );

      return updated;
    });

    return updatedExpense;
  }

  private assertRazorpayConfigured() {
    if (!config.payment.razorpayKeyId || !config.payment.razorpayKeySecret) {
      throw new BadRequestError('Razorpay is not configured');
    }
  }

  private getRazorpayAuthHeader() {
    const token = Buffer.from(`${config.payment.razorpayKeyId}:${config.payment.razorpayKeySecret}`).toString('base64');
    return `Basic ${token}`;
  }

  private timingSafeEqual(a: string, b: string) {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    if (aBuffer.length !== bBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(aBuffer, bBuffer);
  }
}

export const paymentService = new PaymentService();
