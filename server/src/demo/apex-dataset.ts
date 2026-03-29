import fs from 'fs/promises';
import XLSX from 'xlsx';
import { ApprovalAction, ApprovalType, CommentType, ExpenseStatus, OcrStatus, PaymentStatus, Prisma, UserRole } from '@prisma/client';
import prisma from '../config/database.js';
import { csvImportService } from '../services/csv-import.service.js';

interface SeedOptions {
  companyId: string;
  workbookPath: string;
  includeUsers?: boolean;
  seedApprovalRules?: boolean;
}

interface SeedSummary {
  usersImported: number;
  categoriesSeeded: number;
  expensesSeeded: number;
  approvalLogsSeeded: number;
}

type Matrix = Array<Array<string | number | null>>;

const EMPTY_MARKERS = new Set(['', '-', '—', 'n/a', 'na', 'none', 'null']);

const normalize = (value: unknown) => String(value ?? '').trim();

const cleanValue = (value: unknown) => {
  const stringValue = normalize(value);
  return EMPTY_MARKERS.has(stringValue.toLowerCase()) ? null : stringValue;
};

const parseMoney = (value: unknown) => {
  const cleaned = cleanValue(value);
  if (!cleaned) return null;

  const negative = cleaned.startsWith('(') && cleaned.endsWith(')');
  const numeric = cleaned.replace(/[^0-9.]/g, '');
  if (!numeric) return null;

  const parsed = Number.parseFloat(numeric);
  return Number.isFinite(parsed) ? (negative ? -parsed : parsed) : null;
};

const monthMap: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const parseWorkbookDate = (value: unknown) => {
  const cleaned = cleanValue(value);
  if (!cleaned) {
    return null;
  }

  const match = cleaned.match(
    /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/
  );
  if (!match) {
    const parsed = new Date(cleaned);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const [, day, month, year, hours = '0', minutes = '0'] = match;
  const monthIndex = monthMap[month.toLowerCase()];
  if (monthIndex === undefined) {
    return null;
  }

  return new Date(
    Number.parseInt(year, 10),
    monthIndex,
    Number.parseInt(day, 10),
    Number.parseInt(hours, 10),
    Number.parseInt(minutes, 10)
  );
};

const toMatrix = (sheet: XLSX.WorkSheet) =>
  XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });

const tableToObjects = (matrix: Matrix, headerRowIndex: number) => {
  const headers = matrix[headerRowIndex].map((header) => normalize(header));

  return matrix
    .slice(headerRowIndex + 1)
    .filter((row) => row.some((cell) => cleanValue(cell)))
    .map((row) =>
      headers.reduce<Record<string, string | number | null>>((record, header, index) => {
        record[header] = row[index] ?? null;
        return record;
      }, {})
    );
};

const extractStepNumber = (value: unknown) => {
  const match = normalize(value).match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 1;
};

const normalizePersonName = (value: string) =>
  value
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const extractNamedApprover = (value: unknown) => {
  const cleaned = cleanValue(value);
  if (!cleaned) {
    return null;
  }

  if (/direct manager|department director/i.test(cleaned)) {
    return null;
  }

  return cleaned.replace(/\([^)]*\)/g, '').trim();
};

const mapRuleType = (value: unknown) => {
  const cleaned = normalize(value).toLowerCase();
  if (cleaned.includes('parallel') || cleaned.includes('hybrid')) {
    return { approvalType: ApprovalType.PERCENTAGE, percentageRequired: 60 };
  }

  if (cleaned.includes('specific')) {
    return { approvalType: ApprovalType.ANY, percentageRequired: null };
  }

  return { approvalType: ApprovalType.SEQUENTIAL, percentageRequired: null };
};

const mapExpenseStatus = (value: unknown): ExpenseStatus => {
  const cleaned = normalize(value).toLowerCase();
  if (cleaned.includes('approved')) return ExpenseStatus.APPROVED;
  if (cleaned.includes('rejected')) return ExpenseStatus.REJECTED;
  if (cleaned.includes('pending')) return ExpenseStatus.SUBMITTED;
  return ExpenseStatus.DRAFT;
};

export async function seedApexDataset(options: SeedOptions): Promise<SeedSummary> {
  const workbookBuffer = await fs.readFile(options.workbookPath);
  const workbook = XLSX.read(workbookBuffer, { type: 'buffer' });

  if (options.includeUsers) {
    const preview = await csvImportService.previewUsers(options.companyId, {
      buffer: workbookBuffer,
      originalName: options.workbookPath,
    });
    await csvImportService.finalizeUsersImport(options.companyId, { rows: preview.rows });
  }

  const companyInfoSheet = workbook.Sheets['Company Info'];
  const budgetSheet = workbook.Sheets['Budget Tracker'];
  const dashboardSheet = workbook.Sheets['CFO Dashboard'];
  const approvalsSheet = workbook.Sheets['Approval Rules'];
  const expensesSheet = workbook.Sheets['Expense Submissions'];
  const approvalLogSheet = workbook.Sheets['Approval Log'];

  const companyInfoRows = toMatrix(companyInfoSheet).slice(3);
  const companyInfo = companyInfoRows.reduce<Record<string, string>>((record, row) => {
    const key = cleanValue(row[0]);
    const value = cleanValue(row[1]);
    if (key && value) {
      record[key] = value;
    }
    return record;
  }, {});

  const budgetRows = tableToObjects(toMatrix(budgetSheet), 1);
  const alertRows = tableToObjects(toMatrix(dashboardSheet), 3);
  const summaryRows = tableToObjects(toMatrix(dashboardSheet), 12);
  const approvalRuleRows = tableToObjects(toMatrix(approvalsSheet), 1);
  const expenseRows = tableToObjects(toMatrix(expensesSheet), 1);
  const approvalLogRows = tableToObjects(toMatrix(approvalLogSheet), 1);

  const company = await prisma.company.findUnique({
    where: { id: options.companyId },
    select: { settings: true },
  });

  const currentSettings = (company?.settings as Prisma.JsonObject | null) ?? {};
  const nextSettings: Prisma.InputJsonObject = {
    ...currentSettings,
    dataset: {
      ...(currentSettings.dataset as Prisma.JsonObject | undefined),
      companyInfo,
      budgetTracker: budgetRows,
      cfoDashboard: {
        alerts: alertRows,
        summary: summaryRows,
      },
      rawApprovalRules: approvalRuleRows,
      importedAt: new Date().toISOString(),
    },
  };

  await prisma.company.update({
    where: { id: options.companyId },
    data: {
      settings: nextSettings as Prisma.InputJsonValue,
    },
  });

  const users = await prisma.user.findMany({
    where: { companyId: options.companyId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      departmentId: true,
      department: { select: { id: true, name: true } },
      position: true,
    },
  });

  const usersByName = new Map(
    users.map((user) => [normalizePersonName(`${user.firstName} ${user.lastName}`), user])
  );
  const departmentsByName = new Map(
    users
      .map((user) => user.department)
      .filter((department): department is { id: string; name: string } => Boolean(department))
      .map((department) => [department.name.toLowerCase(), department])
  );

  const categories = new Map<string, string>();
  const existingCategories = await prisma.expenseCategory.findMany({
    where: { companyId: options.companyId },
    select: { id: true, name: true },
  });

  existingCategories.forEach((category) => {
    categories.set(category.name.toLowerCase(), category.id);
  });

  for (const row of expenseRows) {
    const categoryName = cleanValue(row['Category']);
    if (!categoryName || categories.has(categoryName.toLowerCase())) {
      continue;
    }

    const created = await prisma.expenseCategory.create({
      data: {
        companyId: options.companyId,
        name: categoryName,
        code: categoryName.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 20),
        description: `${categoryName} imported from Apex workbook`,
      },
    });
    categories.set(categoryName.toLowerCase(), created.id);
  }

  const importedExpenseMap = new Map<string, string>();
  let expensesSeeded = 0;

  for (const row of expenseRows) {
    const workbookExpenseId = cleanValue(row['Expense ID']);
    const employeeName = cleanValue(row['Employee']);
    const user = employeeName ? usersByName.get(normalizePersonName(employeeName)) : null;
    if (!workbookExpenseId || !user) {
      continue;
    }

    const existingExpense = await prisma.expense.findFirst({
      where: {
        companyId: options.companyId,
        creatorId: user.id,
        description: { contains: workbookExpenseId },
      },
      select: { id: true },
    });

    if (existingExpense) {
      importedExpenseMap.set(workbookExpenseId, existingExpense.id);
      continue;
    }

    const status = mapExpenseStatus(row['Status']);
    const expenseDate = parseWorkbookDate(row['Date']) ?? new Date();
    const title = cleanValue(row['Description']) ?? `${cleanValue(row['Category']) ?? 'Expense'} claim`;
    const createdExpense = await prisma.expense.create({
      data: {
        companyId: options.companyId,
        creatorId: user.id,
        categoryId: cleanValue(row['Category'])
          ? categories.get(cleanValue(row['Category'])!.toLowerCase()) ?? null
          : null,
        title,
        description: `Workbook ${workbookExpenseId}: ${cleanValue(row['Description']) ?? ''}`.trim(),
        totalAmount: parseMoney(row['Amount (Original)']) ?? parseMoney(row['Amount (INR ₹)']) ?? 0,
        currency: cleanValue(row['Currency']) ?? 'INR',
        convertedAmount: parseMoney(row['Amount (INR ₹)']) ?? null,
        exchangeRate: parseMoney(row['Exchange Rate']) ?? null,
        expenseDate,
        status,
        submittedAt: expenseDate,
        approvedAt: status === ExpenseStatus.APPROVED ? expenseDate : null,
        rejectedAt: status === ExpenseStatus.REJECTED ? expenseDate : null,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    if ((cleanValue(row['Receipt Attached']) ?? '').toLowerCase() === 'yes') {
      await prisma.receipt.create({
        data: {
          expenseId: createdExpense.id,
          fileName: `${workbookExpenseId}.pdf`,
          filePath: 'uploads/.gitkeep',
          fileSize: 0,
          mimeType: 'application/pdf',
          ocrStatus:
            (cleanValue(row['OCR Used']) ?? '').toLowerCase() === 'yes'
              ? OcrStatus.COMPLETED
              : OcrStatus.PENDING,
          ocrRawText:
            (cleanValue(row['OCR Used']) ?? '').toLowerCase() === 'yes'
              ? `Workbook OCR placeholder for ${workbookExpenseId}`
              : null,
        },
      });
    }

    importedExpenseMap.set(workbookExpenseId, createdExpense.id);
    expensesSeeded += 1;
  }

  let approvalLogsSeeded = 0;
  for (const row of approvalLogRows) {
    const workbookExpenseId = cleanValue(row['Expense ID']);
    const expenseId = workbookExpenseId ? importedExpenseMap.get(workbookExpenseId) : null;
    const approverName = cleanValue(row['Approver']);
    const approver = approverName ? usersByName.get(normalizePersonName(approverName)) : null;

    if (!expenseId || !approver) {
      continue;
    }

    const sequence = extractStepNumber(row['Step']);
    const existingStep = await prisma.approvalStep.findFirst({
      where: { expenseId, approverId: approver.id, sequence },
      select: { id: true },
    });

    if (!existingStep) {
      await prisma.approvalStep.create({
        data: {
          expenseId,
          approverId: approver.id,
          sequence,
          action:
            normalize(row['Action']).toLowerCase() === 'rejected'
              ? ApprovalAction.REJECTED
              : ApprovalAction.APPROVED,
          comment: cleanValue(row['Comment']),
          actionAt: parseWorkbookDate(row['Date & Time']) ?? new Date(),
        },
      });
      approvalLogsSeeded += 1;
    }

    const comment = cleanValue(row['Comment']);
    if (comment) {
      await prisma.expenseComment.create({
        data: {
          expenseId,
          authorId: approver.id,
          content: comment,
          commentType: CommentType.LOG_NOTE,
        },
      });
    }
  }

  const rawRulesKey = 'datasetRules';
  const unsupportedRules = approvalRuleRows.filter((row) =>
    /cumulative/i.test(normalize(row['Rule Type']))
  );

  await prisma.company.update({
    where: { id: options.companyId },
    data: {
      settings: {
        ...(nextSettings as object),
        [rawRulesKey]: {
          unsupported: unsupportedRules,
        },
      } as Prisma.InputJsonValue,
    },
  });

  if (options.seedApprovalRules ?? true) {
    for (const row of approvalRuleRows) {
      if (/cumulative/i.test(normalize(row['Rule Type']))) {
        continue;
      }

      const ruleName = cleanValue(row['Rule Name']);
      if (!ruleName) {
        continue;
      }

      const approverNames = ['Step 1', 'Step 2', 'Step 3']
        .map((key) => extractNamedApprover(row[key]))
        .filter((value): value is string => Boolean(value));

      const approverUsers = approverNames
        .map((name) => usersByName.get(normalizePersonName(name)))
        .filter((user): user is NonNullable<typeof user> => Boolean(user));

      if (!approverUsers.length) {
        continue;
      }

      const departmentName = cleanValue(row['Department']);
      const department =
        departmentName && departmentName.toLowerCase() !== 'all'
          ? departmentsByName.get(departmentName.toLowerCase()) ?? null
          : null;

      const existingRule = await prisma.approvalRule.findFirst({
        where: { companyId: options.companyId, name: ruleName },
        select: { id: true },
      });

      const mappedType = mapRuleType(row['Rule Type']);
      const minAmount = parseMoney(row['Min Amount (₹)']);
      const maxAmount = parseMoney(row['Max Amount (₹)']);

      const ruleId = existingRule
        ? existingRule.id
        : (
            await prisma.approvalRule.create({
              data: {
                companyId: options.companyId,
                departmentId: department?.id ?? null,
                name: ruleName,
                description: cleanValue(row['Condition / Notes']),
                approvalType: mappedType.approvalType,
                percentageRequired: mappedType.percentageRequired,
                minAmount,
                maxAmount,
                priority: 100,
              },
            })
          ).id;

      await prisma.approvalRule.update({
        where: { id: ruleId },
        data: {
          departmentId: department?.id ?? null,
          description: cleanValue(row['Condition / Notes']),
          approvalType: mappedType.approvalType,
          percentageRequired: mappedType.percentageRequired,
          minAmount,
          maxAmount,
          isActive: true,
          priority: 100,
        },
      });

      await prisma.approvalRuleApprover.deleteMany({ where: { ruleId } });
      await prisma.approvalRuleApprover.createMany({
        data: approverUsers.map((user, index) => ({
          ruleId,
          userId: user.id,
          sequence: index + 1,
          isRequired: false,
        })),
      });

      if (approverUsers.some((user) => /cfo/i.test(user.position ?? ''))) {
        await prisma.user.updateMany({
          where: {
            id: { in: approverUsers.map((user) => user.id) },
            position: { contains: 'Financial', mode: 'insensitive' },
          },
          data: { isVipApprover: true, role: UserRole.FINANCE },
        });
      }
    }
  }

  return {
    usersImported: options.includeUsers ? users.length : 0,
    categoriesSeeded: categories.size,
    expensesSeeded,
    approvalLogsSeeded,
  };
}
