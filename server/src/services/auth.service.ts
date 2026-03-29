import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateTokenPair, verifyRefreshToken, TokenPayload } from '../utils/jwt.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';
import {
  SignupInput,
  LoginInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator.js';
import { UserRole, UserStatus } from '@prisma/client';
import crypto from 'crypto';
import { currencyService } from './currency.service.js';
import { emailService } from './email.service.js';
import { config } from '../config/index.js';

export class AuthService {
  async signup(input: SignupInput) {
    const { companyName, country, email, password, firstName, lastName } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const baseCurrency =
      (await currencyService.getCurrencyByCountry(country))?.code ||
      config.defaults.baseCurrency;

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          country,
          baseCurrency,
          settings: {},
        },
      });

      const passwordHash = await hashPassword(password);

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email,
          passwordHash,
          firstName,
          lastName,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });

      return { company, user };
    });

    const payload: TokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      companyId: result.company.id,
    };

    const tokens = generateTokenPair(payload);

    // Store refresh token
    await prisma.user.update({
      where: { id: result.user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        baseCurrency: result.company.baseCurrency,
      },
      tokens,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashResetToken(rawToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    const resetLink = `${config.clientUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await emailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);
  }

  async resetPassword(input: ResetPasswordInput) {
    const hashedToken = this.hashResetToken(input.token);
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        refreshToken: null,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const tokens = generateTokenPair(payload);

    // Update refresh token and last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokens.refreshToken,
        lastLoginAt: new Date(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        baseCurrency: user.company.baseCurrency,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const tokens = generateTokenPair(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return { tokens };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        department: true,
        reportsTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      approvalLimit: user.approvalLimit,
      isVipApprover: user.isVipApprover,
      isRequiredApprover: user.isRequiredApprover,
      company: {
        id: user.company.id,
        name: user.company.name,
        baseCurrency: user.company.baseCurrency,
      },
      department: user.department,
      reportsTo: user.reportsTo,
    };
  }

  private hashResetToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const authService = new AuthService();
