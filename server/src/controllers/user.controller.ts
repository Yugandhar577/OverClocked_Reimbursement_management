import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { csvImportService } from '../services/csv-import.service.js';
import { emailService } from '../services/email.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = {
      departmentId: req.query.departmentId as string | undefined,
      role: req.query.role as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await userService.getAll(req.user!.companyId, filters);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getById(req.params.id, req.user!.companyId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await userService.create(req.user!.companyId, req.body);

    // Send welcome email with temporary password
    const company = await prisma.company.findUnique({
      where: { id: req.user!.companyId },
      select: { name: true },
    });

    if (company) {
      await emailService.sendWelcomeEmail(
        result.user.email,
        result.user.firstName,
        company.name,
        result.temporaryPassword
      );
    }

    res.status(201).json({
      success: true,
      data: result.user,
      message: 'User created. Welcome email sent with temporary password.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.update(
      req.params.id,
      req.user!.companyId,
      req.body
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.delete(req.params.id, req.user!.companyId);

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getHierarchy = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hierarchy = await userService.getHierarchy(req.user!.companyId);

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};

export const importUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const preview = await csvImportService.previewUsers(req.user!.companyId, {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });
    const result = await csvImportService.finalizeUsersImport(req.user!.companyId, {
      rows: preview.rows,
    });

    res.json({
      success: true,
      data: {
        success: result.success,
        failed: result.failed,
        errors: result.errors,
      },
      message: `Imported ${result.success} users. ${result.failed} failed.`,
    });
  } catch (error) {
    next(error);
  }
};

export const previewUserImport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await csvImportService.previewUsers(req.user!.companyId, {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    res.json({
      success: true,
      data: result,
      message: `Preview generated for ${result.rows.length} employees.`,
    });
  } catch (error) {
    next(error);
  }
};

export const finalizeUserImport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await csvImportService.finalizeUsersImport(req.user!.companyId, req.body);

    res.json({
      success: true,
      data: {
        success: result.success,
        failed: result.failed,
        errors: result.errors,
        createdUsers: result.createdUsers.map((user) => ({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          position: user.position,
        })),
      },
      message: `Finalized import for ${result.success} employees.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getImportTemplate = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const template = csvImportService.generateTemplateCsv();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="user_import_template.csv"');
    res.send(template);
  } catch (error) {
    next(error);
  }
};

// Import prisma for company lookup
import prisma from '../config/database.js';
