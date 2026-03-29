import XLSX from 'xlsx';
import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../config/database.js';
import { hashPassword, generateRandomPassword } from '../utils/password.js';
import { BadRequestError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { emailService } from './email.service.js';

interface ImportFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType?: string;
}

interface ParsedImportRow {
  rowNumber: number;
  sourceSheet: string;
  employeeCode: string | null;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  sourceRole: string | null;
  platformRole: UserRole;
  position: string | null;
  department: string | null;
  reportsToRaw: string | null;
  phone: string | null;
  monthlyBudget: number | null;
  sourceStatus: string | null;
}

export interface ImportPreviewRow {
  email: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  sourceRole: string | null;
  platformRole: UserRole;
  position: string | null;
  department: string | null;
  reportsToRaw: string | null;
  reportsToEmail: string | null;
  reportsToLabel: string | null;
  phone: string | null;
  monthlyBudget: number | null;
  sourceStatus: string | null;
  rowNumber: number;
  sourceSheet: string;
}

interface ImportPreviewResult {
  rows: ImportPreviewRow[];
  positions: string[];
  departments: string[];
  managerOptions: Array<{
    email: string;
    label: string;
    position: string | null;
    source: 'existing' | 'upload';
  }>;
  warnings: string[];
  format: 'csv' | 'xlsx';
  sourceSheet: string;
}

interface FinalizeImportInput {
  rows: Array<{
    email: string;
    employeeCode?: string | null;
    firstName: string;
    lastName: string;
    platformRole?: UserRole | null;
    sourceRole?: string | null;
    position?: string | null;
    department?: string | null;
    reportsToEmail?: string | null;
    reportsToRaw?: string | null;
    phone?: string | null;
    monthlyBudget?: number | null;
  }>;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
  createdUsers: Array<{
    email: string;
    firstName: string;
    lastName: string;
    temporaryPassword: string;
    position: string | null;
  }>;
}

const EMPTY_VALUES = new Set(['', '-', '—', 'n/a', 'na', 'none', 'null']);

const HEADER_ALIASES: Record<string, string[]> = {
  employeeCode: ['user id', 'employee id', 'employee code', 'code'],
  fullName: ['full name', 'employee name', 'name'],
  firstName: ['first name', 'firstname', 'given name'],
  lastName: ['last name', 'lastname', 'surname', 'family name'],
  email: ['email', 'email address'],
  role: ['role', 'user role', 'platform role'],
  position: ['position', 'title', 'designation', 'job title'],
  department: ['department', 'team', 'function'],
  manager: ['manager', 'line manager'],
  reportsTo: ['reports to', 'reportsto', 'reports_to', 'reports-to'],
  phone: ['phone', 'phone number', 'mobile', 'contact number'],
  monthlyBudget: ['monthly budget', 'monthly budget (₹)', 'monthly budget (inr)', 'budget'],
  status: ['status'],
};

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const normalizeLookup = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@.]+/g, ' ')
    .replace(/\s+/g, ' ');

const normalizeMaybe = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  if (EMPTY_VALUES.has(normalized.toLowerCase())) {
    return null;
  }
  return normalized;
};

const parseMoney = (value: unknown) => {
  const normalized = normalizeMaybe(value);
  if (!normalized) {
    return null;
  }

  const negative = normalized.startsWith('(') && normalized.endsWith(')');
  const numeric = normalized.replace(/[^0-9.]/g, '');
  if (!numeric) {
    return null;
  }

  const parsed = Number.parseFloat(numeric);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return negative ? -parsed : parsed;
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' '),
  };
};

const derivePosition = (sourceRole: string | null, department: string | null, fullName: string) => {
  const role = sourceRole?.toLowerCase() ?? '';
  const dept = department ?? '';

  if (role.includes('admin')) {
    return 'Administrator';
  }

  if (/cfo/i.test(dept)) {
    return 'Chief Financial Officer';
  }

  if (/director/i.test(dept)) {
    return dept;
  }

  if (role.includes('manager')) {
    return dept ? `${dept} Manager` : `${fullName}'s Manager`;
  }

  if (role.includes('finance')) {
    return 'Finance Lead';
  }

  return dept ? `${dept} Specialist` : 'Employee';
};

export class CsvImportService {
  async previewUsers(companyId: string, file: ImportFileInput): Promise<ImportPreviewResult> {
    const parsed = this.parseImportFile(file);
    if (!parsed.rows.length) {
      throw new BadRequestError('No valid employee rows were found in the uploaded file');
    }

    const existingUsers = await prisma.user.findMany({
      where: { companyId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        position: true,
      },
    });

    const managerOptions = [
      ...existingUsers.map((user) => ({
        email: user.email,
        label: `${user.firstName} ${user.lastName}`.trim(),
        position: user.position,
        source: 'existing' as const,
      })),
      ...parsed.rows.map((row) => ({
        email: row.email,
        label: row.fullName,
        position: row.position,
        source: 'upload' as const,
      })),
    ].filter((option, index, array) => array.findIndex((item) => item.email === option.email) === index);

    const lookupByEmail = new Map(managerOptions.map((option) => [option.email.toLowerCase(), option]));
    const lookupByName = new Map(
      managerOptions.map((option) => [normalizeLookup(option.label), option])
    );

    const warnings: string[] = [];
    const seenEmails = new Set<string>();
    const previewRows = parsed.rows.map((row) => {
      const duplicate = seenEmails.has(row.email.toLowerCase());
      seenEmails.add(row.email.toLowerCase());

      let matchedManager = null;
      if (row.reportsToRaw) {
        if (row.reportsToRaw.includes('@')) {
          matchedManager = lookupByEmail.get(row.reportsToRaw.toLowerCase()) ?? null;
        } else {
          matchedManager = lookupByName.get(normalizeLookup(row.reportsToRaw)) ?? null;
        }
      }

      if (duplicate) {
        warnings.push(`Duplicate email detected in upload: ${row.email}`);
      }

      if (row.reportsToRaw && !matchedManager) {
        warnings.push(`No manager match found for ${row.fullName} (${row.reportsToRaw})`);
      }

      return {
        email: row.email,
        employeeCode: row.employeeCode,
        firstName: row.firstName,
        lastName: row.lastName,
        fullName: row.fullName,
        sourceRole: row.sourceRole,
        platformRole: row.platformRole,
        position: row.position,
        department: row.department,
        reportsToRaw: row.reportsToRaw,
        reportsToEmail: matchedManager?.email ?? null,
        reportsToLabel: matchedManager?.label ?? row.reportsToRaw ?? null,
        phone: row.phone,
        monthlyBudget: row.monthlyBudget,
        sourceStatus: row.sourceStatus,
        rowNumber: row.rowNumber,
        sourceSheet: row.sourceSheet,
      };
    });

    return {
      rows: previewRows,
      positions: [...new Set(previewRows.map((row) => row.position).filter((value): value is string => Boolean(value)))].sort(),
      departments: [...new Set(previewRows.map((row) => row.department).filter((value): value is string => Boolean(value)))].sort(),
      managerOptions,
      warnings: [...new Set(warnings)],
      format: parsed.format,
      sourceSheet: parsed.sourceSheet,
    };
  }

  async finalizeUsersImport(companyId: string, input: FinalizeImportInput): Promise<ImportResult> {
    if (!input.rows?.length) {
      throw new BadRequestError('At least one row is required to finalize the import');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    if (!company) {
      throw new BadRequestError('Company not found');
    }

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      createdUsers: [],
    };

    const departmentMap = new Map<string, string>();
    const existingDepts = await prisma.department.findMany({
      where: { companyId },
      select: { id: true, name: true },
    });

    existingDepts.forEach((dept) => {
      departmentMap.set(dept.name.toLowerCase(), dept.id);
    });

    for (const row of input.rows) {
      const department = normalizeMaybe(row.department);
      if (department && !departmentMap.has(department.toLowerCase())) {
        const created = await prisma.department.create({
          data: {
            companyId,
            name: department,
            code: department.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 20),
          },
        });
        departmentMap.set(department.toLowerCase(), created.id);
      }
    }

    const existingUsers = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const emailToUserId = new Map(existingUsers.map((user) => [user.email.toLowerCase(), user.id]));
    const nameToUserId = new Map(
      existingUsers.map((user) => [normalizeLookup(`${user.firstName} ${user.lastName}`), user.id])
    );

    const reportingAssignments: Array<{ userId: string; reportsToEmail?: string | null; reportsToRaw?: string | null }> = [];

    for (let index = 0; index < input.rows.length; index += 1) {
      const row = input.rows[index];
      const email = normalizeMaybe(row.email)?.toLowerCase();
      const firstName = normalizeMaybe(row.firstName);
      const lastName = normalizeMaybe(row.lastName);

      try {
        if (!email || !firstName || !lastName) {
          throw new BadRequestError('Email, first name, and last name are required');
        }

        if (emailToUserId.has(email)) {
          throw new BadRequestError('User with this email already exists');
        }

        const temporaryPassword = generateRandomPassword();
        const passwordHash = await hashPassword(temporaryPassword);
        const departmentName = normalizeMaybe(row.department);
        const created = await prisma.user.create({
          data: {
            companyId,
            employeeCode: normalizeMaybe(row.employeeCode),
            email,
            passwordHash,
            firstName,
            lastName,
            position: normalizeMaybe(row.position),
            role: row.platformRole ?? this.mapRole(row.sourceRole),
            status: UserStatus.ACTIVE,
            departmentId: departmentName ? departmentMap.get(departmentName.toLowerCase()) ?? null : null,
            phone: normalizeMaybe(row.phone),
            monthlyBudget: row.monthlyBudget ?? null,
          },
        });

        emailToUserId.set(email, created.id);
        nameToUserId.set(normalizeLookup(`${firstName} ${lastName}`), created.id);
        reportingAssignments.push({
          userId: created.id,
          reportsToEmail: normalizeMaybe(row.reportsToEmail),
          reportsToRaw: normalizeMaybe(row.reportsToRaw),
        });
        result.createdUsers.push({
          email,
          firstName,
          lastName,
          temporaryPassword,
          position: normalizeMaybe(row.position),
        });
        result.success += 1;
      } catch (error) {
        logger.error(`Failed to import user ${row.email}`, error);
        result.errors.push({
          row: index + 1,
          email: row.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        result.failed += 1;
      }
    }

    for (const assignment of reportingAssignments) {
      let reportsToId: string | null = null;

      if (assignment.reportsToEmail) {
        reportsToId = emailToUserId.get(assignment.reportsToEmail.toLowerCase()) ?? null;
      } else if (assignment.reportsToRaw) {
        reportsToId = nameToUserId.get(normalizeLookup(assignment.reportsToRaw)) ?? null;
      }

      if (reportsToId) {
        await prisma.user.update({
          where: { id: assignment.userId },
          data: { reportsToId },
        });
      }
    }

    for (const createdUser of result.createdUsers) {
      await emailService.sendWelcomeEmail(
        createdUser.email,
        createdUser.firstName,
        company.name,
        createdUser.temporaryPassword
      );
    }

    return result;
  }

  generateTemplateCsv(): string {
    const headers = [
      'employeeCode',
      'fullName',
      'email',
      'role',
      'position',
      'department',
      'reportsTo',
      'phone',
      'monthlyBudget',
      'status',
    ];
    const exampleRows = [
      'USR001,Shashank Kakad,admin@apexsolutions.in,Admin,Administrator,Executive,,+919999999999,,Active',
      'USR002,Yugandhar Paulbudhe,yug.paulbudhe@gmail.com,Manager,Chief Financial Officer,Finance & CFO,Shashank Kakad,+919999999998,50000,Active',
      'USR003,Priya Nambiar,priya.nambiar@apexsolutions.in,Employee,Operations Specialist,Operations,Vikram Nair,+919999999997,,Active',
    ];

    return [headers.join(','), ...exampleRows].join('\n');
  }

  parseImportFile(file: ImportFileInput) {
    const extension = file.originalName.split('.').pop()?.toLowerCase();
    if (extension === 'xlsx' || extension === 'xls') {
      return this.parseWorkbook(file.buffer);
    }

    return this.parseCsv(file.buffer.toString('utf-8'));
  }

  private parseWorkbook(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const preferredSheetName =
      workbook.SheetNames.find((name) => /users|roles|employees/i.test(name)) ?? workbook.SheetNames[0];

    if (!preferredSheetName) {
      throw new BadRequestError('The workbook does not contain any sheets');
    }

    const worksheet = workbook.Sheets[preferredSheetName];
    const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    });

    const rows = this.parseMatrixRows(matrix, preferredSheetName);
    return {
      rows,
      format: 'xlsx' as const,
      sourceSheet: preferredSheetName,
    };
  }

  private parseCsv(csvContent: string) {
    const lines = csvContent
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.trim());

    if (lines.length < 2) {
      throw new BadRequestError('CSV file must have a header row and at least one data row');
    }

    const matrix = lines.map((line) => this.parseCsvLine(line));
    const rows = this.parseMatrixRows(matrix, 'CSV Import');

    return {
      rows,
      format: 'csv' as const,
      sourceSheet: 'CSV Import',
    };
  }

  private parseMatrixRows(matrix: Array<Array<string | number | null>>, sheetName: string) {
    const headerRowIndex = this.findHeaderRowIndex(matrix);
    if (headerRowIndex === -1) {
      throw new BadRequestError('Unable to find a header row with employee columns');
    }

    const rawHeaders = matrix[headerRowIndex].map((cell) => String(cell ?? ''));
    const headers = rawHeaders.map((header) => this.matchHeaderKey(header));

    if (!headers.includes('email')) {
      throw new BadRequestError('Missing required column: email');
    }

    const rows: ParsedImportRow[] = [];
    for (let rowIndex = headerRowIndex + 1; rowIndex < matrix.length; rowIndex += 1) {
      const values = matrix[rowIndex];
      const record: Record<string, string> = {};

      headers.forEach((header, index) => {
        if (!header) {
          return;
        }

        record[header] = String(values[index] ?? '').trim();
      });

      const email = normalizeMaybe(record.email);
      if (!email) {
        continue;
      }

      const fullName = normalizeMaybe(record.fullName);
      const firstName = normalizeMaybe(record.firstName);
      const lastName = normalizeMaybe(record.lastName);
      const nameParts = fullName ? splitFullName(fullName) : null;
      const resolvedFirstName = firstName ?? nameParts?.firstName ?? null;
      const resolvedLastName = lastName ?? nameParts?.lastName ?? null;

      if (!resolvedFirstName || !resolvedLastName) {
        throw new BadRequestError(`Unable to determine a full name for row ${rowIndex + 1}`);
      }

      const sourceRole = normalizeMaybe(record.role);
      const department = normalizeMaybe(record.department);
      rows.push({
        rowNumber: rowIndex + 1,
        sourceSheet: sheetName,
        employeeCode: normalizeMaybe(record.employeeCode),
        email: email.toLowerCase(),
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        fullName: `${resolvedFirstName} ${resolvedLastName}`.trim(),
        sourceRole,
        platformRole: this.mapRole(sourceRole, department),
        position: normalizeMaybe(record.position) ?? derivePosition(sourceRole, department, `${resolvedFirstName} ${resolvedLastName}`.trim()),
        department,
        reportsToRaw: normalizeMaybe(record.reportsTo) ?? normalizeMaybe(record.manager),
        phone: normalizeMaybe(record.phone),
        monthlyBudget: parseMoney(record.monthlyBudget),
        sourceStatus: normalizeMaybe(record.status),
      });
    }

    return rows;
  }

  private findHeaderRowIndex(matrix: Array<Array<string | number | null>>) {
    let bestIndex = -1;
    let bestScore = 0;

    matrix.forEach((row, index) => {
      const normalized = row.map((cell) => normalizeHeader(cell)).filter(Boolean);
      const score = normalized.reduce((total, header) => {
        const matched = Object.values(HEADER_ALIASES).some((aliases) => aliases.includes(header));
        return total + (matched ? 1 : 0);
      }, 0);

      if (score > bestScore && normalized.some((header) => HEADER_ALIASES.email.includes(header))) {
        bestIndex = index;
        bestScore = score;
      }
    });

    return bestScore >= 3 ? bestIndex : -1;
  }

  private matchHeaderKey(header: string) {
    const normalized = normalizeHeader(header);
    return Object.entries(HEADER_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] ?? null;
  }

  private mapRole(roleString?: string | null, department?: string | null): UserRole {
    const normalizedRole = roleString?.toLowerCase() ?? '';
    const normalizedDepartment = department?.toLowerCase() ?? '';

    if (normalizedRole.includes('admin')) {
      return UserRole.ADMIN;
    }

    if (normalizedRole.includes('finance') || normalizedDepartment.includes('finance & cfo')) {
      return UserRole.FINANCE;
    }

    if (normalizedRole.includes('manager')) {
      return UserRole.MANAGER;
    }

    return UserRole.EMPLOYEE;
  }

  private parseCsvLine(line: string) {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    result.push(current);
    return result;
  }
}

export const csvImportService = new CsvImportService();
