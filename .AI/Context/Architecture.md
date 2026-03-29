# System Architecture

## Overview

OverClocked Reimbursement Management is centered on an Express + Prisma backend with PostgreSQL as the system of record. The backend owns authentication, company setup, receipts/OCR, currency utilities, expense CRUD, and the supporting approval/payment modules layered on top.

## Repository Structure

```text
.AI/                         # AI agent rules, architecture notes, changelogs
docs/                        # Problem statement and implementation notes
server/
  prisma/
    schema.prisma            # Prisma schema source of truth
    migrations/              # Prisma migration history
  src/
    config/                  # Env, DB, and app configuration
    controllers/             # Express request handlers
    middleware/              # Auth, RBAC, validation, upload, error handling
    routes/                  # Route registration
    services/                # Business logic
    utils/                   # JWT, password, OCR parsing, logging helpers
    validators/              # Zod schemas
  uploads/                   # Receipt files in local development
```

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

## Key API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/companies`
- `GET /api/companies/currencies`
- `POST /api/receipts/:id/ocr`

## Backend API Modules (Implemented)

- `/api/approvals` - pending approvals and manager approve/reject actions
- `/api/approval-rules` - approval rules CRUD for admin configuration
- `/api/payments` - Razorpay order creation and signature verification
- `/api/notifications` - list and mark-read notification endpoints
- `/api/comments` - threaded expense comments and replies

## External Integrations

- RestCountries API: country name/code to currency resolution.
- ExchangeRate API: base-currency exchange rates with in-memory caching.
- Mindee: primary OCR extraction for receipts.
- OCR.space: fallback OCR provider with regex-based post-processing.
- Razorpay: reimbursement payouts.
- SMTP via Nodemailer: welcome and password reset emails.
