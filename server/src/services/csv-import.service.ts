import prisma from '../config/database.js';
import { hashPassword, generateRandomPassword } from '../utils/password.js';
import { BadRequestError } from '../utils/errors.js';
import { UserRole, UserStatus } from '@prisma/client';
import { logger } from '../utils/logger.js';

interface CsvUserRow {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  department?: string;
  reportsTo?: string;
  phone?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
  createdUsers: Array<{ email: string; temporaryPassword: string }>;
}

export class CsvImportService {
  async parseCsv(csvContent: string): Promise<CsvUserRow[]> {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new BadRequestError('CSV file must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['email', 'firstname', 'lastname'];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new BadRequestError(`Missing required column: ${required}`);
      }
    }

    const rows: CsvUserRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);

      if (values.length !== headers.length) {
        throw new BadRequestError(`Row ${i + 1} has incorrect number of columns`);
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index].trim();
      });

      rows.push({
        email: row.email,
        firstName: row.firstname,
        lastName: row.lastname,
        role: row.role,
        department: row.department,
        reportsTo: row.reportsto,
        phone: row.phone,
      });
    }

    return rows;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  async importUsers(companyId: string, csvContent: string): Promise<ImportResult> {
    const rows = await this.parseCsv(csvContent);
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      createdUsers: [],
    };

    // First pass: create departments if needed
    const departmentMap = new Map<string, string>();
    const existingDepts = await prisma.department.findMany({
      where: { companyId },
      select: { id: true, name: true },
    });

    for (const dept of existingDepts) {
      departmentMap.set(dept.name.toLowerCase(), dept.id);
    }

    for (const row of rows) {
      if (row.department && !departmentMap.has(row.department.toLowerCase())) {
        const newDept = await prisma.department.create({
          data: {
            companyId,
            name: row.department,
            code: row.department.toUpperCase().replace(/\s+/g, '_').slice(0, 10),
          },
        });
        departmentMap.set(row.department.toLowerCase(), newDept.id);
      }
    }

    // Map email to user for reportsTo lookup
    const emailToUserId = new Map<string, string>();
    const existingUsers = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, email: true },
    });

    for (const user of existingUsers) {
      emailToUserId.set(user.email.toLowerCase(), user.id);
    }

    // Second pass: create users without reportsTo
    const usersToCreateReporting: Array<{ userId: string; reportsToEmail: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        if (emailToUserId.has(row.email.toLowerCase())) {
          result.errors.push({
            row: i + 2,
            email: row.email,
            error: 'User with this email already exists',
          });
          result.failed++;
          continue;
        }

        const role = this.mapRole(row.role);
        const departmentId = row.department
          ? departmentMap.get(row.department.toLowerCase())
          : null;

        const temporaryPassword = generateRandomPassword();
        const passwordHash = await hashPassword(temporaryPassword);

        const user = await prisma.user.create({
          data: {
            companyId,
            email: row.email,
            passwordHash,
            firstName: row.firstName,
            lastName: row.lastName,
            role,
            status: UserStatus.PENDING,
            departmentId,
            phone: row.phone || null,
          },
        });

        emailToUserId.set(row.email.toLowerCase(), user.id);

        if (row.reportsTo) {
          usersToCreateReporting.push({
            userId: user.id,
            reportsToEmail: row.reportsTo,
          });
        }

        result.createdUsers.push({ email: row.email, temporaryPassword });
        result.success++;
      } catch (error) {
        logger.error(`Failed to import user ${row.email}`, error);
        result.errors.push({
          row: i + 2,
          email: row.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        result.failed++;
      }
    }

    // Third pass: set up reporting relationships
    for (const { userId, reportsToEmail } of usersToCreateReporting) {
      const reportsToId = emailToUserId.get(reportsToEmail.toLowerCase());
      if (reportsToId) {
        await prisma.user.update({
          where: { id: userId },
          data: { reportsToId },
        });
      }
    }

    return result;
  }

  private mapRole(roleString?: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      admin: UserRole.ADMIN,
      finance: UserRole.FINANCE,
      manager: UserRole.MANAGER,
      employee: UserRole.EMPLOYEE,
    };

    return roleMap[roleString?.toLowerCase() || ''] || UserRole.EMPLOYEE;
  }

  generateTemplateCsv(): string {
    const headers = 'email,firstName,lastName,role,department,reportsTo,phone';
    const exampleRows = [
      'john.doe@company.com,John,Doe,Manager,Engineering,,+1234567890',
      'jane.smith@company.com,Jane,Smith,Employee,Engineering,john.doe@company.com,+1234567891',
    ];

    return [headers, ...exampleRows].join('\n');
  }
}

export const csvImportService = new CsvImportService();
