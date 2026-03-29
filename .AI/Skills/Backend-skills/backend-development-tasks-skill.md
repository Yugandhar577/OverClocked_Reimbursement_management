---
name: backend-development-tasks
description: Use when implementing or modifying backend components in the OverClocked reimbursement system using Express, TypeScript, Prisma, PostgreSQL, Zod, Multer, Nodemailer, and the integrations defined in `docs/implementation_plan.md`.
---

# Backend Development Tasks

## Canonical References

- `.AI/AGENT.md`
- `.AI/Context/Architecture.md`
- `.AI/Context/Techstack.md`
- `.AI/Context/gotchas.md`
- `docs/implementation_plan.md`

If this guide conflicts with those docs, the canonical docs win.

## Stack Reminder

- Node.js LTS
- Express
- TypeScript strict mode
- Prisma + PostgreSQL
- Zod validation
- Multer for file upload plumbing
- Nodemailer for email delivery
- Mindee primary OCR, OCR.space fallback

## Planned Server Structure

```text
server/
|-- prisma/
|   `-- schema.prisma
`-- src/
    |-- config/
    |-- controllers/
    |-- middleware/
    |-- routes/
    |-- services/
    |-- utils/
    `-- validators/
```

## Module Responsibility Rules

- Routes register endpoints and middleware only
- Controllers translate HTTP input or output and delegate to services
- Services hold business logic and Prisma access
- Validators define Zod request and response contracts
- Middleware handles auth, RBAC, upload, and shared error or request concerns
- Utilities stay small and cross-domain

If a file does more than one of those jobs, split it.

## Core Backend Domains

### DevY-owned foundations

- Auth and token refresh
- Company signup and base-currency lookup
- CSV import and hierarchy building
- Users, departments, categories, and expenses CRUD
- Receipt upload and OCR orchestration
- Currency conversion support
- Email sending for onboarding and workflow notices

### DevSK-owned workflow layers

- Approval rules and approval execution
- Comments and notifications
- Audit logging
- Payment initiation and verification

Do not reimplement DevSK-owned workflow logic inside DevY-owned services.

## Database Rules

- Prisma schema changes must update `.AI/Context/Architecture.md` and `docs/implementation_plan.md`
- Use `DECIMAL(12,2)` for money values
- Never introduce schema drift outside Prisma Migrate
- Every new table must have an audit-log story
- Use the status vocabulary already defined in `docs/implementation_plan.md`

## Request Flow Pattern

```ts
// routes/expenses.routes.ts
router.post(
  "/api/expenses",
  requireAuth,
  validate(createExpenseSchema),
  createExpenseController
)
```

```ts
// controllers/expenses.controller.ts
export async function createExpenseController(req, res, next) {
  try {
    const expense = await createExpenseService(req.user.id, req.body)
    res.status(201).json(expense)
  } catch (error) {
    next(error)
  }
}
```

```ts
// services/expenses.service.ts
export async function createExpenseService(userId, input) {
  return prisma.expense.create({
    data: {
      submitterId: userId,
      ...input,
    },
  })
}
```

## Validation And Errors

- Put Zod schemas beside the route domain in `validators/`
- Reject invalid money, currency, date, and approval-state transitions early
- Use centralized Express error handling
- Never catch and swallow backend failures
- User-facing errors should still be understandable to the frontend

## File Upload And OCR

- Receipt uploads store file metadata first
- OCR is assistive only and must never auto-submit an expense
- Preserve original receipts for auditability
- Return actionable warnings for low-quality OCR inputs

## Backend Do Nots

- Do not introduce FastAPI, Celery, Redis, or pgvector into this repo without updating the canonical docs first
- Do not bypass the `routes -> controllers -> services` pattern
- Do not store access tokens in persistent browser storage
- Do not use floating point money fields
- Do not invent new statuses, endpoints, or route prefixes outside the implementation plan
