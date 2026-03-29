import prisma from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validators/category.validator.js';

export class CategoryService {
  async getAll(companyId: string, includeInactive = false) {
    const categories = await prisma.expenseCategory.findMany({
      where: {
        companyId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        _count: { select: { children: true, expenses: true } },
      },
      orderBy: { code: 'asc' },
    });

    return categories;
  }

  async getById(categoryId: string, companyId: string) {
    const category = await prisma.expenseCategory.findFirst({
      where: { id: categoryId, companyId },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true, isActive: true } },
        _count: { select: { expenses: true } },
      },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async create(companyId: string, input: CreateCategoryInput) {
    // Check for unique code within company
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { companyId_code: { companyId, code: input.code } },
    });

    if (existingCategory) {
      throw new ConflictError('Category with this code already exists');
    }

    const category = await prisma.expenseCategory.create({
      data: {
        companyId,
        name: input.name,
        code: input.code,
        description: input.description,
        parentId: input.parentId,
        isActive: input.isActive,
      },
      include: {
        parent: { select: { id: true, name: true, code: true } },
      },
    });

    return category;
  }

  async update(categoryId: string, companyId: string, input: UpdateCategoryInput) {
    const existing = await prisma.expenseCategory.findFirst({
      where: { id: categoryId, companyId },
    });

    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    // Check for unique code if being updated
    if (input.code && input.code !== existing.code) {
      const codeExists = await prisma.expenseCategory.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
      });
      if (codeExists) {
        throw new ConflictError('Category with this code already exists');
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: input,
      include: {
        parent: { select: { id: true, name: true, code: true } },
      },
    });

    return category;
  }

  async delete(categoryId: string, companyId: string) {
    const category = await prisma.expenseCategory.findFirst({
      where: { id: categoryId, companyId },
      include: { _count: { select: { children: true, expenses: true } } },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category._count.expenses > 0) {
      throw new ConflictError('Cannot delete category with associated expenses');
    }

    if (category._count.children > 0) {
      throw new ConflictError('Cannot delete category with sub-categories');
    }

    await prisma.expenseCategory.delete({ where: { id: categoryId } });
  }

  async getHierarchy(companyId: string) {
    const categories = await prisma.expenseCategory.findMany({
      where: { companyId, isActive: true },
      orderBy: { code: 'asc' },
    });

    // Build hierarchy tree
    const catMap = new Map(categories.map((c) => [c.id, { ...c, children: [] as typeof categories }]));
    const roots: (typeof categories[0] & { children: typeof categories })[] = [];

    categories.forEach((cat) => {
      const catNode = catMap.get(cat.id)!;

      if (cat.parentId && catMap.has(cat.parentId)) {
        catMap.get(cat.parentId)!.children.push(catNode);
      } else {
        roots.push(catNode);
      }
    });

    return roots;
  }
}

export const categoryService = new CategoryService();
