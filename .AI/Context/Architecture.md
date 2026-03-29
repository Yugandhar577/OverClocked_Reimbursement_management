# System Architecture

## Overview

Monorepo containing two packages — `client/` (React SPA) and `server/` (Express API) — sharing a PostgreSQL database via Prisma ORM.

## Repository Structure

```
odooxvit/
├── .AI/                      # AI agent configs (do NOT modify manually)
├── docs/                     # Problem statement, wireframes, Odoo screenshots
├── client/                   # React 18 + Vite + Tailwind CSS v3
│   ├── src/
│   │   ├── api/              # Axios API layer
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # DesktopLayout, MobileLayout, AuthLayout
│   │   ├── pages/            # Route-level page components
│   │   ├── stores/           # Zustand state stores
│   │   └── utils/            # Helpers (currency, dates, constants)
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                   # Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma     # Database schema (source of truth)
│   ├── src/
│   │   ├── config/           # DB, env, email config
│   │   ├── middleware/       # auth, rbac, validate, upload, errorHandler
│   │   ├── routes/           # Express route definitions
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (approval engine, OCR, CSV import, payments)
│   │   ├── validators/       # Zod schemas
│   │   └── utils/            # JWT, password, logger
│   └── uploads/              # Receipt images (local dev)
└── package.json              # Root workspace config
```

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│  CLIENT (React SPA)                             │
│  ├── Desktop Layout (Admin/Finance)             │
│  └── Mobile Layout (Employee/Manager)           │
├─────────────────────────────────────────────────┤
│  API GATEWAY (Express)                          │
│  ├── Auth Middleware (JWT)                       │
│  ├── RBAC Middleware (role guards)               │
│  └── Validation Middleware (Zod)                 │
├─────────────────────────────────────────────────┤
│  SERVICES (Business Logic)                      │
│  ├── Approval Engine (sequential, %, VIP)       │
│  ├── OCR Pipeline (Mindee → OCR.space fallback) │
│  ├── CSV Import (hierarchy builder)             │
│  ├── Currency Service (rate cache)              │
│  ├── Payment Service (Razorpay)                 │
│  └── Email Service (Nodemailer)                 │
├─────────────────────────────────────────────────┤
│  DATA LAYER (Prisma ORM)                        │
│  └── PostgreSQL (12 tables)                     │
└─────────────────────────────────────────────────┘
```

## Database (12 Tables)

`companies` → `departments` → `users` (with `reports_to` self-ref)
`expense_categories` → `expenses` → `expense_lines`
`receipts` (with OCR data) → `expense_comments` (threaded)
`approval_rules` → `approval_rule_approvers` → `approval_steps`
`notifications` + `audit_log`

## Two-Surface Frontend

| Surface | Route prefix | Layout | Users |
|---------|-------------|--------|-------|
| Desktop website | `/admin/*` | DesktopLayout (sidebar + header) | Admin, Finance |
| Mobile web app | `/expenses/*`, `/approvals/*` | MobileLayout (bottom nav + header) | Employee, Manager |

Both share the same React codebase, differentiated by React Router route groups and responsive layouts.

## External Integrations

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Mindee API | Receipt OCR → structured JSON | 250 pages/month |
| OCR.space API | Fallback OCR → raw text | 500 req/day |
| RestCountries API | Country → currency mapping | Unlimited |
| ExchangeRate API | Currency conversion rates | Unlimited |
| Razorpay | Reimbursement payouts | Sandbox free |
| Gmail SMTP | Email notifications | Free |
