# System Architecture

## Overview

OverClocked Reimbursement Management is organized around an Express + Prisma backend with PostgreSQL as the system of record. The backend owns authentication, company setup, receipts/OCR, currency utilities, and the base expense domain that the approval and payment layers build on top of.

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
3. Services: Services own business logic for auth, company data, expenses, OCR, receipts, currency lookup/conversion, and email delivery.
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

## External Integrations

- RestCountries API: country name/code to currency resolution.
- ExchangeRate API: base-currency exchange rates with in-memory caching.
- Mindee: primary OCR extraction for receipts.
- OCR.space: fallback OCR provider with regex-based post-processing.
- SMTP via Nodemailer: welcome and password reset emails.
