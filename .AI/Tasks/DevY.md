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
| | | | |
