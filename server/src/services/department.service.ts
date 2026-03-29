import prisma from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../validators/department.validator.js';

export class DepartmentService {
  async getAll(companyId: string) {
    const departments = await prisma.department.findMany({
      where: { companyId },
      include: {
        parent: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { users: true, children: true } },
      },
      orderBy: { name: 'asc' },
    });

    return departments;
  }

  async getById(departmentId: string, companyId: string) {
    const department = await prisma.department.findFirst({
      where: { id: departmentId, companyId },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        users: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return department;
  }

  async create(companyId: string, input: CreateDepartmentInput) {
    // Check for unique code within company
    if (input.code) {
      const existingDept = await prisma.department.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
      });
      if (existingDept) {
        throw new ConflictError('Department with this code already exists');
      }
    }

    const department = await prisma.department.create({
      data: {
        companyId,
        name: input.name,
        code: input.code,
        parentId: input.parentId,
        managerId: input.managerId,
      },
      include: {
        parent: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return department;
  }

  async update(departmentId: string, companyId: string, input: UpdateDepartmentInput) {
    const existing = await prisma.department.findFirst({
      where: { id: departmentId, companyId },
    });

    if (!existing) {
      throw new NotFoundError('Department not found');
    }

    // Check for unique code if being updated
    if (input.code && input.code !== existing.code) {
      const codeExists = await prisma.department.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
      });
      if (codeExists) {
        throw new ConflictError('Department with this code already exists');
      }
    }

    const department = await prisma.department.update({
      where: { id: departmentId },
      data: input,
      include: {
        parent: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return department;
  }

  async delete(departmentId: string, companyId: string) {
    const department = await prisma.department.findFirst({
      where: { id: departmentId, companyId },
      include: { _count: { select: { users: true, children: true } } },
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    if (department._count.users > 0) {
      throw new ConflictError('Cannot delete department with assigned users');
    }

    if (department._count.children > 0) {
      throw new ConflictError('Cannot delete department with sub-departments');
    }

    await prisma.department.delete({ where: { id: departmentId } });
  }

  async getHierarchy(companyId: string) {
    const departments = await prisma.department.findMany({
      where: { companyId },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { users: true } },
      },
    });

    // Build hierarchy tree
    const deptMap = new Map(departments.map((d) => [d.id, { ...d, children: [] as typeof departments }]));
    const roots: (typeof departments[0] & { children: typeof departments })[] = [];

    departments.forEach((dept) => {
      const deptNode = deptMap.get(dept.id)!;

      if (dept.parentId && deptMap.has(dept.parentId)) {
        deptMap.get(dept.parentId)!.children.push(deptNode);
      } else {
        roots.push(deptNode);
      }
    });

    return roots;
  }
}

export const departmentService = new DepartmentService();
