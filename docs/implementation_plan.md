# Reimbursement Management System - Implementation Plan

## Purpose

This file is the shared delivery contract for the four development pillars. If route groups, API shapes, status vocabularies, or pillar boundaries change, update this file together with the relevant `.AI/Context/*.md` documents.

## Current Repository State

The current working tree now contains a scaffolded `client/` admin frontend with contract-accurate mock APIs, shared layout primitives, and the desktop admin route group. The `server/` directory is still pending, so this document remains the source of truth for backend and cross-pillar contracts.

## Product Goals

- Replace manual reimbursement tracking with a structured, auditable workflow
- Support multi-level approvals with manager-first, percentage, VIP, required-veto, and escalation rules
- Support multi-currency expenses with company-base reporting
- Provide OCR-assisted receipt capture without removing user review
- Deliver one desktop admin experience and one mobile-first employee or manager experience from a shared codebase

## Non-Negotiable Technical Rules

- Frontend: React 18 + Vite + Tailwind CSS v3 + Zustand
- Backend: Express + TypeScript strict mode + Prisma + PostgreSQL
- API access only through `client/src/api/*.api.js`
- Validation on every endpoint with Zod
- Access token in Zustand memory, refresh token in `httpOnly` cookie
- Money stored as `DECIMAL(12,2)`
- OCR providers: Mindee primary, OCR.space fallback
- No Firebase, Supabase, MongoDB, or static JSON as production persistence

## Planned Repository Layout

```text
client/
|-- public/
|   |-- manifest.json
|   `-- sw.js
`-- src/
    |-- api/
    |-- components/
    |   |-- admin/
    |   |-- layout/
    |   |-- shared/
    |   `-- ui/
    |-- hooks/
    |-- pages/
    |   `-- admin/
    |-- stores/
    `-- utils/

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

## Pillar Ownership

| Pillar | Owner | Primary Responsibility |
|--------|-------|------------------------|
| Backend Core + Database | DevY | Schema, auth, CRUD APIs, CSV import, OCR integration points, currency and email services |
| Approval Engine + Payments | DevSK | Approval routing, comments, notifications, audit logging, Razorpay |
| Admin Dashboard | DevSM | Desktop admin pages, auth screens, admin shared UI, admin API wiring |
| Employee and Manager App | DevP | Mobile layouts, employee expense flow, manager approvals, receipt capture, mobile shared UI |

## Domain Model

### Core Tables

| Table | Owner | Notes |
|-------|-------|-------|
| `companies` | DevY | Stores company identity and base currency |
| `departments` | DevY | Supports hierarchy and scoped routing |
| `users` | DevY | Includes role, `reports_to`, and approval limit |
| `expense_categories` | DevY | Admin-managed categories |
| `expenses` | DevY | Core reimbursement record |
| `expense_lines` | DevY | Itemized details per expense |
| `receipts` | DevY | File metadata plus OCR output |
| `approval_rules` | DevSK | Admin-configured routing rules |
| `approval_rule_approvers` | DevSK | Ordered approvers and rule metadata |
| `approval_steps` | DevSK | Per-expense execution log |
| `expense_comments` | DevSK | Discussion thread on expenses |
| `notifications` | DevSK | In-app notification queue |
| `audit_log` | DevSK | Immutable workflow history |

### Required Status Vocabulary

Use the same values in database enums, backend responses, and frontend badges:

- Expense lifecycle: `draft`, `to_submit`, `submitted`, `pending_approval`, `approved`, `rejected`, `in_payment`, `paid`, `done`
- Approval step lifecycle: `pending`, `approved`, `rejected`, `skipped`
- Notification read state: `read` boolean flag

## API Contract

### Auth and Onboarding

| Method | Endpoint | Owner | Consumer |
|--------|----------|-------|----------|
| `POST` | `/api/auth/signup` | DevY | DevSM |
| `POST` | `/api/auth/login` | DevY | DevSM, DevP |
| `POST` | `/api/auth/refresh` | DevY | DevSM, DevP |
| `POST` | `/api/auth/forgot-password` | DevY | DevSM |
| `POST` | `/api/company/import-csv` | DevY | DevSM |
| `GET` | `/api/company/hierarchy` | DevY | DevSM |
| `GET` | `/api/company/currencies` | DevY | DevSM, DevP |

### Admin CRUD

| Method | Endpoint | Owner | Consumer |
|--------|----------|-------|----------|
| `GET` | `/api/users` | DevY | DevSM |
| `POST` | `/api/users` | DevY | DevSM |
| `PUT` | `/api/users/:id` | DevY | DevSM |
| `PUT` | `/api/users/:id/approval-limit` | DevY | DevSM |
| `DELETE` | `/api/users/:id` | DevY | DevSM |
| `GET` | `/api/departments` | DevY | DevSM |
| `POST` | `/api/departments` | DevY | DevSM |
| `PUT` | `/api/departments/:id` | DevY | DevSM |
| `GET` | `/api/categories` | DevY | DevSM, DevP |
| `POST` | `/api/categories` | DevY | DevSM |
| `PUT` | `/api/categories/:id` | DevY | DevSM |

### Expense Flow

| Method | Endpoint | Owner | Consumer |
|--------|----------|-------|----------|
| `GET` | `/api/expenses` | DevY | DevSM, DevP |
| `GET` | `/api/expenses/:id` | DevY with DevSK data joins | DevSM, DevP |
| `POST` | `/api/expenses` | DevY | DevP |
| `PUT` | `/api/expenses/:id` | DevY | DevP |
| `DELETE` | `/api/expenses/:id` | DevY | DevP |
| `POST` | `/api/expenses/:id/lines` | DevY | DevP |
| `POST` | `/api/expenses/:id/receipts` | DevY | DevP |
| `POST` | `/api/receipts/:id/ocr` | DevY | DevP |
| `POST` | `/api/expenses/:id/submit` | DevY calling DevSK approval logic | DevP |

### Approval, Comments, and Notifications

| Method | Endpoint | Owner | Consumer |
|--------|----------|-------|----------|
| `GET` | `/api/approvals/pending` | DevSK | DevP |
| `POST` | `/api/approvals/:expenseId/approve` | DevSK | DevP |
| `POST` | `/api/approvals/:expenseId/reject` | DevSK | DevP |
| `GET` | `/api/approval-rules` | DevSK | DevSM |
| `POST` | `/api/approval-rules` | DevSK | DevSM |
| `PUT` | `/api/approval-rules/:id` | DevSK | DevSM |
| `DELETE` | `/api/approval-rules/:id` | DevSK | DevSM |
| `GET` | `/api/expenses/:id/comments` | DevSK | DevP, DevSM |
| `POST` | `/api/expenses/:id/comments` | DevSK | DevP, DevSM |
| `GET` | `/api/notifications` | DevSK | DevSM, DevP |
| `PUT` | `/api/notifications/:id/read` | DevSK | DevSM, DevP |

### Payments

| Method | Endpoint | Owner | Consumer |
|--------|----------|-------|----------|
| `GET` | `/api/payments/pending` | DevSK | DevSM |
| `POST` | `/api/payments/:expenseId/create-order` | DevSK | DevSM |
| `POST` | `/api/payments/:expenseId/verify` | DevSK | DevSM |

## Frontend Route Contract

### Shared Auth

- `/login`
- `/signup`
- `/forgot-password`

### Admin Routes

- `/admin/dashboard`
- `/admin/employees`
- `/admin/import`
- `/admin/hierarchy`
- `/admin/approval-rules`
- `/admin/categories`
- `/admin/expenses`
- `/admin/reports`
- `/admin/payments`

Current implementation note:

- These admin routes already exist in the scaffolded frontend and are backed by mock loaders in `client/src/api/*.api.js` until the corresponding backend endpoints are available.

### Employee Routes

- `/expenses`
- `/expenses/new`
- `/expenses/:id`
- `/expenses/:id/split`
- `/scan`

### Manager Routes

- `/approvals`
- `/approvals/:id`
- `/team-expenses`

## Shared Component Contract

### Admin Shared Components

- `Button`
- `Input`
- `Modal`
- `DataTable`
- `Select`
- `StatusBadge`
- `SidebarFilters`
- `CSVUploader`
- `ApprovalRuleBuilder`
- `OrgChart`
- `AnalyticsCards`
- `NotificationBell`

### Mobile Shared Components

- `ExpenseCard`
- `ExpenseForm`
- `ExpenseLineItem`
- `SplitExpenseModal`
- `ApprovalTimeline`
- `ReceiptViewer`
- `CommentThread`
- `ExpenseSummaryHeader`
- `StatusPipeline`
- `BottomNavBar`
- `CurrencyDisplay`
- `FileUpload`

## Delivery Sequence

### Milestone 1 - Foundation

Owner: DevY

Exit criteria:

- Schema locked for the core tables
- Auth, company, user, department, category, and expense draft APIs available
- CSV import and base currency flows defined

### Milestone 2 - Workflow Engine

Owner: DevSK

Exit criteria:

- Approval rules can be created and evaluated
- Manager approval actions work against seeded data
- Notifications, comments, audit logging, and payment verification contracts are defined

### Milestone 3 - Admin Surface

Owner: DevSM

Exit criteria:

- Admin route shell and auth screens are live
- User management, hierarchy, categories, and approval rule pages consume real or contract-accurate data
- Expense oversight and payment operations screens are wired

### Milestone 4 - Employee and Manager Surface

Owner: DevP

Exit criteria:

- Employee can create, edit, review, and submit expenses
- Manager can review and action pending approvals
- Receipt OCR review, comments, and status pipelines are visible in mobile layouts

### Milestone 5 - Integration and Verification

Shared ownership

Exit criteria:

- Full flow works from signup through payment
- Approval edge cases are tested
- Desktop and mobile responsive checks pass
- Documentation is updated in `.AI/Context/*.md` and `.AI/Tasks/*.md`

## Key Edge Cases That Must Survive Implementation

- Manager self-approval is never allowed
- Percentage rules round up
- Duplicate detection warns but does not hard-stop submission
- OCR never bypasses user review
- Approval-limit escalation routes forward instead of rejecting
- Required-approver rejection overrides VIP approval
- Payment success requires server-side Razorpay verification

## Documentation Sync Checklist

- Schema change -> update `.AI/Context/Architecture.md` and this file
- New dependency -> update `.AI/Context/Techstack.md`
- Scope change -> update `.AI/Context/MVP.md`
- New component or UI pattern -> update `.AI/Context/Frontend_Reference.md`
- New edge case -> update `.AI/Context/gotchas.md`
- Every work session -> append the relevant `.AI/Tasks/Dev*.md` changelog row
