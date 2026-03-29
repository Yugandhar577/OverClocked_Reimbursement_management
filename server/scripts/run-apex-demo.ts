import assert from 'node:assert/strict';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import prisma from '../src/config/database.js';
import { config } from '../src/config/index.js';
import { seedApexDataset } from '../src/demo/apex-dataset.js';

const API_URL = process.env.API_URL || `http://localhost:${config.port}`;
const WORKBOOK_PATH = path.resolve(process.cwd(), '../db/apex_solutions_dataset.xlsx');
const OUTBOX_DIR = config.smtp.outboxDir;
const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6L4eQAAAAASUVORK5CYII=',
  'base64'
);

type Session = {
  accessToken: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: string };
  company: { id: string; name: string; baseCurrency: string };
};

async function apiRequest<T = any>(
  pathname: string,
  options: {
    method?: string;
    token?: string;
    body?: Record<string, unknown>;
    formData?: FormData;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${pathname}`, {
    method: options.method ?? 'GET',
    headers: options.formData ? headers : { ...headers, 'Content-Type': 'application/json' },
    body: options.formData ? options.formData : options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: T;
    pagination?: unknown;
    duplicateWarnings?: unknown;
  };

  if (!response.ok || payload.success === false) {
    throw new Error(`${pathname} failed: ${payload.message ?? response.statusText}`);
  }

  return payload.data as T;
}

async function snapshotOutbox() {
  try {
    return new Set(await fs.readdir(OUTBOX_DIR));
  } catch {
    return new Set<string>();
  }
}

async function readNewOutboxEntries(before: Set<string>) {
  const files = await fs.readdir(OUTBOX_DIR);
  const created = files.filter((file) => !before.has(file));

  const messages = await Promise.all(
    created.map(async (file) => {
      const raw = await fs.readFile(path.join(OUTBOX_DIR, file), 'utf-8');
      return JSON.parse(raw) as {
        to: string;
        subject: string;
        text?: string;
        html?: string;
      };
    })
  );

  return messages;
}

function extractTemporaryPassword(message: { text?: string; html?: string }) {
  const source = `${message.text ?? ''}\n${message.html ?? ''}`;
  const match = source.match(/Temporary Password:\s*([^\s<]+)/i);
  if (!match) {
    throw new Error(`Could not extract temporary password from message`);
  }

  return match[1].trim();
}

async function signupAdmin(): Promise<Session> {
  const unique = Date.now();
  return apiRequest<Session>('/api/auth/signup', {
    method: 'POST',
    body: {
      companyName: `Apex Solutions Demo ${unique}`,
      country: 'India',
      email: `apex.demo.admin+${unique}@example.com`,
      password: 'DemoPass123',
      firstName: 'Demo',
      lastName: 'Admin',
    },
  });
}

async function login(email: string, password: string): Promise<Session> {
  return apiRequest<Session>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

async function uploadWorkbookPreview(token: string) {
  const workbookBuffer = await fs.readFile(WORKBOOK_PATH);
  const formData = new FormData();
  formData.append(
    'file',
    new Blob([workbookBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    path.basename(WORKBOOK_PATH)
  );

  return apiRequest<{
    rows: any[];
    positions: string[];
    departments: string[];
    managerOptions: Array<{ email: string; label: string }>;
    warnings: string[];
  }>('/api/users/import/preview', {
    method: 'POST',
    token,
    formData,
  });
}

async function listUsers(token: string) {
  const response = await fetch(`${API_URL}/api/users?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = (await response.json()) as { data: any[]; success: boolean };
  if (!response.ok || payload.success === false) {
    throw new Error(`Unable to list users`);
  }
  return payload.data;
}

async function cleanupPreviousDemoRuns() {
  const seededAdmins = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'apex.demo.admin+',
        endsWith: '@example.com',
      },
    },
    select: { companyId: true },
  })

  const companyIds = [...new Set(seededAdmins.map((user) => user.companyId))]
  if (!companyIds.length) {
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.expenseComment.deleteMany({
      where: {
        OR: [
          { author: { companyId: { in: companyIds } } },
          { expense: { companyId: { in: companyIds } } },
        ],
      },
    })
    await tx.approvalStep.deleteMany({
      where: {
        expense: { companyId: { in: companyIds } },
      },
    })
    await tx.receipt.deleteMany({
      where: {
        expense: { companyId: { in: companyIds } },
      },
    })
    await tx.notification.deleteMany({
      where: {
        user: { companyId: { in: companyIds } },
      },
    })
    await tx.auditLog.deleteMany({
      where: {
        companyId: { in: companyIds },
      },
    })
    await tx.expense.deleteMany({
      where: {
        companyId: { in: companyIds },
      },
    })
    await tx.approvalRuleApprover.deleteMany({
      where: {
        rule: { companyId: { in: companyIds } },
      },
    })
    await tx.approvalRule.deleteMany({
      where: {
        companyId: { in: companyIds },
      },
    })
    await tx.expenseCategory.deleteMany({
      where: {
        companyId: { in: companyIds },
      },
    })
    await tx.department.deleteMany({
      where: {
        companyId: { in: companyIds },
      },
    })
    await tx.user.deleteMany({
      where: {
        companyId: { in: companyIds },
      },
    })
    await tx.company.deleteMany({
      where: {
        id: { in: companyIds },
      },
    })
  })
}

async function createReceiptExpense(
  token: string,
  input: {
    title: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    categoryId: string;
    fileName?: string;
  }
) {
  const expense = await apiRequest<any>('/api/expenses', {
    method: 'POST',
    token,
    body: {
      title: input.title,
      description: input.description,
      totalAmount: input.amount,
      currency: input.currency,
      categoryId: input.categoryId,
      expenseDate: `${input.date}T00:00:00.000Z`,
    },
  });

  if (input.fileName) {
    const formData = new FormData();
    formData.append('file', new Blob([ONE_PIXEL_PNG], { type: 'image/png' }), input.fileName);
    const receipt = await apiRequest<any>(`/api/receipts/expense/${expense.id}`, {
      method: 'POST',
      token,
      formData,
    });
    const ocr = await apiRequest<any>(`/api/receipts/${receipt.id}/ocr`, {
      method: 'POST',
      token,
      body: {},
    });

    await apiRequest(`/api/expenses/${expense.id}`, {
      method: 'PUT',
      token,
      body: {
        title: ocr?.vendor ? `Receipt from ${ocr.vendor}` : input.title,
        description: input.description,
        totalAmount: ocr?.total ?? ocr?.amount ?? input.amount,
        currency: ocr?.currency ?? input.currency,
        categoryId: input.categoryId,
        expenseDate: ocr?.date ? new Date(ocr.date).toISOString() : `${input.date}T00:00:00.000Z`,
      },
    });
  }

  return expense;
}

async function attachReceiptToExpense(
  token: string,
  expenseId: string,
  fileName: string
) {
  const formData = new FormData();
  formData.append('file', new Blob([ONE_PIXEL_PNG], { type: 'image/png' }), fileName);
  const receipt = await apiRequest<any>(`/api/receipts/expense/${expenseId}`, {
    method: 'POST',
    token,
    formData,
  });

  return apiRequest<any>(`/api/receipts/${receipt.id}/ocr`, {
    method: 'POST',
    token,
    body: {},
  });
}

async function main() {
  await prisma.$connect();
  await cleanupPreviousDemoRuns()
  const outboxBefore = await snapshotOutbox();

  const admin = await signupAdmin();
  assert.equal(admin.company.baseCurrency, 'INR', 'Signup should default India companies to INR');

  await apiRequest('/api/companies', {
    method: 'PUT',
    token: admin.accessToken,
    body: {
      name: 'Apex Solutions',
      country: 'India',
      baseCurrency: 'INR',
    },
  });

  await apiRequest('/api/companies/settings', {
    method: 'PUT',
    token: admin.accessToken,
    body: {
      fiscalYearStart: 'April',
      expenseReportingPeriod: 'MONTHLY',
    },
  });

  const preview = await uploadWorkbookPreview(admin.accessToken);
  assert.ok(preview.rows.length >= 30, 'Workbook preview should detect the employee roster');
  assert.ok(preview.positions.length > 0, 'Preview should extract positions');

  const finalize = await apiRequest<any>('/api/users/import/finalize', {
    method: 'POST',
    token: admin.accessToken,
    body: {
      rows: preview.rows.map((row) => ({
        email: row.email,
        employeeCode: row.employeeCode,
        firstName: row.firstName,
        lastName: row.lastName,
        sourceRole: row.sourceRole,
        platformRole: row.platformRole,
        position: row.position,
        department: row.department,
        reportsToEmail: row.reportsToEmail,
        reportsToRaw: row.reportsToRaw,
        phone: row.phone,
        monthlyBudget: row.monthlyBudget,
      })),
    },
  });

  assert.equal(finalize.failed, 0, 'All imported employees should finalize cleanly');
  const welcomeMessages = await readNewOutboxEntries(outboxBefore);
  assert.equal(
    welcomeMessages.length,
    finalize.success,
    'Each imported employee should receive one credential email in the dev outbox'
  );

  const passwordsByEmail = new Map(
    welcomeMessages.map((message) => [message.to.toLowerCase(), extractTemporaryPassword(message)])
  );

  const users = await listUsers(admin.accessToken);
  const findUser = (name: string) =>
    users.find(
      (user) => `${user.firstName} ${user.lastName}`.trim().toLowerCase() === name.toLowerCase()
    );

  const priya = findUser('Priya Nambiar');
  const vikram = findUser('Vikram Nair');
  const soham = findUser('Soham Moholkar');
  const yugandhar = findUser('Yugandhar Paulbudhe');
  const arjun = findUser('Arjun Mehta');
  const prithviraj = findUser('Prithviraj Tandel');
  const gaurav = findUser('Gaurav Tiwari');

  assert.ok(priya && vikram && soham && yugandhar && arjun && prithviraj && gaurav, 'Key demo users should exist after import');

  await apiRequest(`/api/users/${yugandhar.id}`, {
    method: 'PUT',
    token: admin.accessToken,
    body: {
      role: 'FINANCE',
      position: 'Chief Financial Officer',
      isVipApprover: true,
    },
  });

  await seedApexDataset({
    companyId: admin.company.id,
    workbookPath: WORKBOOK_PATH,
    includeUsers: false,
    seedApprovalRules: false,
  });

  const refreshedUsers = await listUsers(admin.accessToken);
  const usersByName = new Map(
    refreshedUsers.map((user) => [`${user.firstName} ${user.lastName}`.trim().toLowerCase(), user])
  );
  const categoryResponse = await fetch(`${API_URL}/api/categories`, {
    headers: { Authorization: `Bearer ${admin.accessToken}` },
  });
  const categoryPayload = (await categoryResponse.json()) as { data: any[]; success: boolean };
  if (!categoryResponse.ok || categoryPayload.success === false) {
    throw new Error('Unable to list categories');
  }
  const categories = new Map(categoryPayload.data.map((category) => [category.name.toLowerCase(), category]));

  const getCategoryId = (name: string) => {
    const category = categories.get(name.toLowerCase());
    if (!category) {
      throw new Error(`Missing category ${name}`);
    }
    return category.id;
  };

  await apiRequest('/api/approval-rules', {
    method: 'POST',
    token: admin.accessToken,
    body: {
      name: 'Apex Demo - Operations 60 Percent Or CFO',
      departmentId: usersByName.get('priya nambiar')?.department?.id,
      approvalType: 'PERCENTAGE',
      percentageRequired: 60,
      minAmount: 10000,
      maxAmount: 49999,
      approvers: [
        { userId: usersByName.get('soham moholkar').id, sequence: 1 },
        { userId: usersByName.get('yugandhar paulbudhe').id, sequence: 2 },
      ],
    },
  });

  await apiRequest('/api/approval-rules', {
    method: 'POST',
    token: admin.accessToken,
    body: {
      name: 'Apex Demo - QA CFO Shortcut',
      departmentId: usersByName.get('arjun mehta')?.department?.id,
      approvalType: 'SEQUENTIAL',
      minAmount: 25000,
      maxAmount: 999999,
      approvers: [{ userId: usersByName.get('yugandhar paulbudhe').id, sequence: 1 }],
    },
  });

  const priyaSession = await login(priya.email, passwordsByEmail.get(priya.email.toLowerCase())!);
  const vikramSession = await login(vikram.email, passwordsByEmail.get(vikram.email.toLowerCase())!);
  const sohamSession = await login(soham.email, passwordsByEmail.get(soham.email.toLowerCase())!);
  const yugandharSession = await login(
    yugandhar.email,
    passwordsByEmail.get(yugandhar.email.toLowerCase())!
  );
  const arjunSession = await login(arjun.email, passwordsByEmail.get(arjun.email.toLowerCase())!);
  const gauravSession = await login(gaurav.email, passwordsByEmail.get(gaurav.email.toLowerCase())!);

  const priyaExpense = await createReceiptExpense(priyaSession.accessToken, {
    title: 'Dubai client dinner',
    description: 'Business dinner at Nobu, Dubai',
    amount: 850,
    currency: 'AED',
    date: '2026-03-15',
    categoryId: getCategoryId('Meals'),
    fileName: 'priya-dubai-dinner.png',
  });
  const submittedPriya = await apiRequest<any>(`/api/expenses/${priyaExpense.id}/submit`, {
    method: 'POST',
    token: priyaSession.accessToken,
    body: {},
  });
  assert.equal(submittedPriya.status, 'SUBMITTED', 'Priya expense should enter approvals');

  await apiRequest(`/api/approvals/${priyaExpense.id}/approve`, {
    method: 'POST',
    token: vikramSession.accessToken,
    body: { comment: 'Verified client dinner.' },
  });

  const priyaAfterSecondApproval = await apiRequest<any>(`/api/approvals/${priyaExpense.id}/approve`, {
    method: 'POST',
    token: sohamSession.accessToken,
    body: { comment: '60 percent threshold reached.' },
  });
  assert.equal(priyaAfterSecondApproval.status, 'APPROVED', 'Percentage rule should auto-approve after two of three approvers');

  const arjunExpense = await createReceiptExpense(arjunSession.accessToken, {
    title: 'Emergency hardware',
    description: 'Emergency server hardware for client crisis',
    amount: 45000,
    currency: 'INR',
    date: '2026-03-18',
    categoryId: getCategoryId('Equipment'),
    fileName: 'arjun-emergency-hardware.png',
  });
  await apiRequest(`/api/expenses/${arjunExpense.id}/submit`, {
    method: 'POST',
    token: arjunSession.accessToken,
    body: {},
  });
  const arjunAfterCfo = await apiRequest<any>(`/api/approvals/${arjunExpense.id}/approve`, {
    method: 'POST',
    token: yugandharSession.accessToken,
    body: { comment: 'Urgent client issue, approved directly.' },
  });
  assert.equal(arjunAfterCfo.status, 'APPROVED', 'VIP approver should be able to short-circuit the flow');

  const rejectedExpense = await apiRequest<any>('/api/expenses', {
    method: 'POST',
    token: gauravSession.accessToken,
    body: {
      title: 'Team lunch',
      description: 'Lunch',
      totalAmount: 12000,
      currency: 'INR',
      categoryId: getCategoryId('Meals'),
      expenseDate: '2026-03-21T00:00:00.000Z',
    },
  });
  await apiRequest(`/api/expenses/${rejectedExpense.id}/submit`, {
    method: 'POST',
    token: gauravSession.accessToken,
    body: {},
  });
  const rejected = await apiRequest<any>(`/api/approvals/${rejectedExpense.id}/reject`, {
    method: 'POST',
    token: arjunSession.accessToken,
    body: { comment: 'No receipt attached. Description insufficient. Please resubmit with proper documentation.' },
  });
  assert.equal(rejected.status, 'REJECTED', 'Manager rejection should close the expense');

  await attachReceiptToExpense(gauravSession.accessToken, rejectedExpense.id, 'gaurav-team-lunch.png');
  await apiRequest(`/api/expenses/${rejectedExpense.id}`, {
    method: 'PUT',
    token: gauravSession.accessToken,
    body: {
      title: 'Team lunch with receipt',
      description: 'Client team lunch with full documentation',
      totalAmount: 12000,
      currency: 'INR',
      categoryId: getCategoryId('Meals'),
      expenseDate: '2026-03-21T00:00:00.000Z',
    },
  });
  await apiRequest(`/api/expenses/${rejectedExpense.id}/submit`, {
    method: 'POST',
    token: gauravSession.accessToken,
    body: {},
  });
  const resubmitted = await apiRequest<any>(`/api/approvals/${rejectedExpense.id}/approve`, {
    method: 'POST',
    token: arjunSession.accessToken,
    body: { comment: 'Receipt added, approving.' },
  });
  assert.equal(resubmitted.status, 'APPROVED', 'Rejected expense should be editable and resubmittable');

  const paymentOrder = await apiRequest<any>('/api/payments/order', {
    method: 'POST',
    token: admin.accessToken,
    body: { expenseId: priyaExpense.id },
  });
  const paymentId = `pay_${Date.now()}`;
  const razorpaySignature = crypto
    .createHmac('sha256', config.payment.mockSecret)
    .update(`${paymentOrder.orderId}|${paymentId}`)
    .digest('hex');

  const paidExpense = await apiRequest<any>('/api/payments/verify', {
    method: 'POST',
    token: admin.accessToken,
    body: {
      expenseId: priyaExpense.id,
      razorpayOrderId: paymentOrder.orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature,
    },
  });
  assert.equal(paidExpense.paymentStatus, 'PAID', 'Mock payment verification should mark the expense as paid');

  const companyStats = await apiRequest<any>('/api/companies/stats', {
    token: admin.accessToken,
  });
  assert.ok(companyStats.users >= finalize.success, 'Admin stats should include imported users');

  const hierarchy = await apiRequest<any[]>('/api/users/hierarchy', {
    token: admin.accessToken,
  });
  assert.ok(hierarchy.length > 0, 'Hierarchy endpoint should return imported reporting structure');

  console.log(
    JSON.stringify(
      {
        companyId: admin.company.id,
        importedUsers: finalize.success,
        priyaExpenseId: priyaExpense.id,
        arjunExpenseId: arjunExpense.id,
        rejectedExpenseId: rejectedExpense.id,
        paymentOrderId: paymentOrder.orderId,
        message: 'Apex demo workflow passed',
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
