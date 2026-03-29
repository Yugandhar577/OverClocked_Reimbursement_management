import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: config.smtp.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      logger.info(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email', error);
      return false;
    }
  }

  async sendWelcomeEmail(
    to: string,
    firstName: string,
    companyName: string,
    temporaryPassword: string
  ): Promise<boolean> {
    const subject = `Welcome to ${companyName} - Reimbursement Portal`;
    const html = `
      <h1>Welcome to ${companyName}!</h1>
      <p>Dear ${firstName},</p>
      <p>Your account has been created on the Reimbursement Management System.</p>
      <p>Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${to}</li>
        <li><strong>Temporary Password:</strong> ${temporaryPassword}</li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <p><a href="${config.clientUrl}/login">Click here to login</a></p>
      <p>Best regards,<br>${companyName} Team</p>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendExpenseSubmittedEmail(
    to: string,
    approverName: string,
    expenseTitle: string,
    expenseAmount: string,
    submitterName: string
  ): Promise<boolean> {
    const subject = `Expense Approval Required: ${expenseTitle}`;
    const html = `
      <h2>New Expense Pending Approval</h2>
      <p>Dear ${approverName},</p>
      <p><strong>${submitterName}</strong> has submitted an expense that requires your approval:</p>
      <ul>
        <li><strong>Title:</strong> ${expenseTitle}</li>
        <li><strong>Amount:</strong> ${expenseAmount}</li>
      </ul>
      <p><a href="${config.clientUrl}/approvals">Review Pending Approvals</a></p>
      <p>Best regards,<br>Reimbursement System</p>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendExpenseApprovedEmail(
    to: string,
    employeeName: string,
    expenseTitle: string,
    expenseAmount: string
  ): Promise<boolean> {
    const subject = `Expense Approved: ${expenseTitle}`;
    const html = `
      <h2>Your Expense Has Been Approved</h2>
      <p>Dear ${employeeName},</p>
      <p>Good news! Your expense has been approved:</p>
      <ul>
        <li><strong>Title:</strong> ${expenseTitle}</li>
        <li><strong>Amount:</strong> ${expenseAmount}</li>
      </ul>
      <p><a href="${config.clientUrl}/expenses">View Your Expenses</a></p>
      <p>Best regards,<br>Reimbursement System</p>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendExpenseRejectedEmail(
    to: string,
    employeeName: string,
    expenseTitle: string,
    reason?: string
  ): Promise<boolean> {
    const subject = `Expense Rejected: ${expenseTitle}`;
    const html = `
      <h2>Your Expense Has Been Rejected</h2>
      <p>Dear ${employeeName},</p>
      <p>Unfortunately, your expense has been rejected:</p>
      <ul>
        <li><strong>Title:</strong> ${expenseTitle}</li>
        ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ''}
      </ul>
      <p>You may modify and resubmit the expense if applicable.</p>
      <p><a href="${config.clientUrl}/expenses">View Your Expenses</a></p>
      <p>Best regards,<br>Reimbursement System</p>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

export const emailService = new EmailService();
