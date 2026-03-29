# System Architecture

## Overview

OverClocked Reimbursement Management is a full-stack system with a React + Vite frontend and an Express + Prisma backend backed by PostgreSQL. The backend owns authentication, company setup, receipts/OCR, currency utilities, expense CRUD, approvals, notifications, comments, and payment orchestration.

## Repository Structure

```text
.AI/                         # AI agent rules, architecture notes, changelogs
docs/                        # Problem statement and implementation notes
client/
  src/
    api/                     # Frontend API layer
    components/              # Shared and feature UI components
    pages/                   # Admin and mobile route screens
    stores/                  # Zustand client state
  public/                    # PWA files (manifest + service worker)
server/
  dev-outbox/                # Local captured emails when SMTP is left in demo mode
  prisma/
    schema.prisma            # Prisma schema source of truth
    migrations/              # Prisma migration history
  scripts/                   # One-off automation for workbook imports and demo verification
  src/
    config/                  # Env, DB, and app configuration
    controllers/             # Express request handlers
    demo/                    # Workbook-to-Postgres seed utilities used by demo scripts
    middleware/              # Auth, RBAC, validation, upload, error handling
    routes/                  # Route registration
    services/                # Business logic
    utils/                   # JWT, password, OCR parsing, logging helpers
    validators/              # Zod schemas
  uploads/                   # Receipt files in local development
```

## Runtime Entrypoints

- Frontend app bootstrap: `client/src/main.jsx`
- Frontend route tree: `client/src/App.jsx`
- Backend process bootstrap: `server/src/index.ts`
- Backend health check: `GET /health`
- Backend static uploads: `GET /uploads/*`

## Layers

1. API Gateway: Express routes apply auth, RBAC, validation, and upload middleware before delegating to controllers.
2. Controllers: Controllers normalize HTTP concerns and call services.
3. Services: Services own auth, company, expense, OCR, receipt, approval, payment, notification, comment, currency, and email logic.
4. Data Layer: Prisma persists the domain model to PostgreSQL through versioned migrations.

## Database

The Prisma schema currently defines 13 domain tables:

- `companies`
- `departments`
- `users`
- `expense_categories`
- `expenses`
- `expense_lines`
- `receipts`
- `expense_comments`
- `approval_rules`
- `approval_rule_approvers`
- `approval_steps`
- `notifications`
- `audit_log`

Notable auth fields on `users`:

- `refresh_token` supports refresh-token rotation/logout.
- `reset_token` and `reset_token_expiry` support one-time password reset links.
- `employee_code`, `position`, and `monthly_budget` preserve workbook import metadata for hierarchy setup and approvals.

## API Surface

The canonical route and entrypoint inventory is maintained in `.AI/Context/endpoints.md`.

Implemented route groups include:

- `/api/auth`
- `/api/companies`
- `/api/users`
- `/api/departments`
- `/api/categories`
- `/api/expenses`
- `/api/receipts`
- `/api/approvals`
- `/api/approval-rules`
- `/api/payments`
- `/api/notifications`
- `/api/comments`

The onboarding import flow is now two-step:

1. `POST /api/users/import/preview` parses an uploaded CSV/XLSX roster, extracts positions, departments, and manager references, and returns editable rows without writing to Postgres.
2. `POST /api/users/import/finalize` persists the confirmed hierarchy, creates accounts, and triggers welcome credential delivery.

## External Integrations

- RestCountries API: country name/code to currency resolution.
- ExchangeRate API: base-currency exchange rates with in-memory caching.
- Mindee: primary OCR extraction for receipts.
- OCR.space: fallback OCR provider with regex-based post-processing.
- Razorpay: reimbursement payouts.
- SMTP via Nodemailer: welcome and password reset emails.

Local demo fallbacks are available when placeholder secrets are left in `.env`:

- Email falls back to JSON files in `server/dev-outbox/`.
- OCR can return deterministic demo fixtures for known Apex receipt filenames.
- Payments can use a mock Razorpay-compatible order/signature flow for repeatable local verification.
