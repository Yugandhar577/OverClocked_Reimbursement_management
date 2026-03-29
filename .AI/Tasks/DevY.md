# DevY — Pillar 1: Backend Core + Database

## Ownership
**Everything under `server/`** except approval engine and payment service.

## Scope
- Prisma schema design + migrations
- Express server setup + middleware
- Auth system (signup, login, JWT, refresh tokens)
- RBAC middleware
- Company CRUD + settings API
- User CRUD API
- Department CRUD API
- Expense Categories CRUD API
- Expenses CRUD API (without approval logic)
- Expense lines API
- Receipt upload + storage
- CSV import service (parse, validate, bulk insert, hierarchy builder)
- Email service (Nodemailer + Gmail SMTP — credential emails)
- Currency service (RestCountries + ExchangeRate API + caching)
- Error handling middleware
- Zod validation schemas

## Key Files
```
server/prisma/schema.prisma
server/src/index.ts
server/src/config/*
server/src/middleware/*
server/src/routes/auth.routes.ts
server/src/routes/company.routes.ts
server/src/routes/user.routes.ts
server/src/routes/department.routes.ts
server/src/routes/category.routes.ts
server/src/routes/expense.routes.ts
server/src/routes/receipt.routes.ts
server/src/controllers/* (matching routes)
server/src/services/auth.service.ts
server/src/services/company.service.ts
server/src/services/user.service.ts
server/src/services/expense.service.ts
server/src/services/csv-import.service.ts
server/src/services/currency.service.ts
server/src/services/email.service.ts
server/src/services/ocr.service.ts
server/src/validators/*
server/src/utils/*
```

## Dependencies
- None (DevY is the foundation)

## Blocked By
- Nothing

## Blocks
- DevSK (needs schema + user/expense tables)
- DevSM + DevP (need APIs to be live)

---

## Changelog

> **Format**: Each entry records date, what was done, files touched.
> AI agents: append to this section after every code session.

| Date | Action | Files Changed | Notes |
|------|--------|---------------|-------|
| 2026-03-29 | Initial backend setup - package.json, tsconfig, env | `server/package.json`, `server/tsconfig.json`, `server/.env.example`, `server/.gitignore` | Node.js + Express + TypeScript + Prisma dependencies |
| 2026-03-29 | Created Prisma schema with all 12 tables | `server/prisma/schema.prisma` | companies, departments, users, expense_categories, expenses, expense_lines, receipts, expense_comments, approval_rules, approval_rule_approvers, approval_steps, notifications, audit_log |
| 2026-03-29 | Created config files | `server/src/config/index.ts`, `server/src/config/database.ts` | Environment config + Prisma client singleton |
| 2026-03-29 | Created utility modules | `server/src/utils/jwt.ts`, `server/src/utils/password.ts`, `server/src/utils/errors.ts`, `server/src/utils/logger.ts` | JWT token handling, bcrypt password hashing, custom error classes, console logger |
| 2026-03-29 | Created middleware stack | `server/src/middleware/errorHandler.ts`, `server/src/middleware/auth.ts`, `server/src/middleware/rbac.ts`, `server/src/middleware/validate.ts`, `server/src/middleware/upload.ts` | Error handling, JWT auth, role-based access control, Zod validation, Multer file upload |
| 2026-03-29 | Created Zod validation schemas | `server/src/validators/auth.validator.ts`, `server/src/validators/company.validator.ts`, `server/src/validators/department.validator.ts`, `server/src/validators/category.validator.ts`, `server/src/validators/expense.validator.ts` | All input validation for API endpoints |
| 2026-03-29 | Created services layer | `server/src/services/auth.service.ts`, `server/src/services/company.service.ts`, `server/src/services/user.service.ts`, `server/src/services/department.service.ts`, `server/src/services/category.service.ts`, `server/src/services/expense.service.ts`, `server/src/services/email.service.ts`, `server/src/services/currency.service.ts`, `server/src/services/csv-import.service.ts`, `server/src/services/receipt.service.ts` | Business logic for all entities |
| 2026-03-29 | Created controllers | `server/src/controllers/auth.controller.ts`, `server/src/controllers/company.controller.ts`, `server/src/controllers/user.controller.ts`, `server/src/controllers/department.controller.ts`, `server/src/controllers/category.controller.ts`, `server/src/controllers/expense.controller.ts`, `server/src/controllers/receipt.controller.ts` | Request handlers for all routes |
| 2026-03-29 | Created routes | `server/src/routes/auth.routes.ts`, `server/src/routes/company.routes.ts`, `server/src/routes/user.routes.ts`, `server/src/routes/department.routes.ts`, `server/src/routes/category.routes.ts`, `server/src/routes/expense.routes.ts`, `server/src/routes/receipt.routes.ts` | Express router definitions |
| 2026-03-29 | Created main server entry point | `server/src/index.ts` | Express app with CORS, middleware stack, route mounting, health check |
| 2026-03-29 | Created OCR service | `server/src/services/ocr.service.ts` | Receipt OCR using Mindee API with OCR.space fallback |
