import prisma from '../config/database.js';
import { hashPassword, generateRandomPassword } from '../utils/password.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { CreateUserInput, UpdateUserInput } from '../validators/auth.validator.js';
import { UserStatus } from '@prisma/client';

export class UserService {
  async getAll(companyId: string, filters?: {
    departmentId?: string;
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { departmentId, role, status, search, page = 1, limit = 20 } = filters || {};

    const where = {
      companyId,
      ...(departmentId && { departmentId }),
      ...(role && { role: role as any }),
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          reportsTo: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        department: user.department,
        reportsTo: user.reportsTo,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
      include: {
        department: true,
        reportsTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        directReports: { select: { id: true, firstName: true, lastName: true, email: true } },
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
      department: user.department,
      reportsTo: user.reportsTo,
      directReports: user.directReports,
      createdAt: user.createdAt,
    };
  }

  async create(companyId: string, input: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const temporaryPassword = generateRandomPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const user = await prisma.user.create({
      data: {
        companyId,
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        status: UserStatus.PENDING,
        departmentId: input.departmentId,
        reportsToId: input.reportsToId,
        phone: input.phone,
        approvalLimit: input.approvalLimit,
        isVipApprover: input.isVipApprover,
        isRequiredApprover: input.isRequiredApprover,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
      temporaryPassword,
    };
  }

  async update(userId: string, companyId: string, input: UpdateUserInput) {
    const existingUser = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being changed
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...input,
        approvalLimit: input.approvalLimit !== undefined ? input.approvalLimit : undefined,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };
  }

  async delete(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Soft delete by setting status to INACTIVE
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.INACTIVE },
    });
  }

  async getHierarchy(companyId: string) {
    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        departmentId: true,
        reportsToId: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Build hierarchy tree
    const userMap = new Map(users.map((u) => [u.id, { ...u, children: [] as typeof users }]));
    const roots: (typeof users[0] & { children: typeof users })[] = [];

    users.forEach((user) => {
      const userNode = userMap.get(user.id)!;

      if (user.reportsToId && userMap.has(user.reportsToId)) {
        userMap.get(user.reportsToId)!.children.push(userNode);
      } else {
        roots.push(userNode);
      }
    });

    return roots;
  }
}

export const userService = new UserService();
