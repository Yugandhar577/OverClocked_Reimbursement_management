---
name: postgres-prisma-data-layer
description: Repo-specific PostgreSQL guidance for OverClocked using Prisma and PostgreSQL. This file replaces the legacy pgvector import with rules for schema design, Prisma migrations, money handling, and reimbursement-domain relationships.
---

# PostgreSQL And Prisma Data Layer

## Important Note

This repository uses PostgreSQL with Prisma. It does not currently use pgvector.

Before changing the data layer, read:

- `.AI/AGENT.md`
- `.AI/Context/Architecture.md`
- `.AI/Context/Techstack.md`
- `docs/implementation_plan.md`

## Core Rules

- All schema changes go through `server/prisma/schema.prisma`
- Use Prisma Migrate for schema evolution
- Update `.AI/Context/Architecture.md` and `docs/implementation_plan.md` with every schema change
- Store money as `DECIMAL(12,2)`
- Keep status values aligned with the shared contract
- Give every new table an audit-log story

## Planned Core Tables

- `companies`
- `departments`
- `users`
- `expense_categories`
- `expenses`
- `expense_lines`
- `receipts`
- `approval_rules`
- `approval_rule_approvers`
- `approval_steps`
- `expense_comments`
- `notifications`
- `audit_log`

## Relationship Expectations

- `users.reports_to` models manager hierarchy
- `expenses` belongs to a submitter and links to receipts and line items
- `approval_rules` defines reusable routing rules
- `approval_steps` records the execution path for one expense
- `notifications` and `audit_log` mirror important workflow changes

## Prisma Modeling Guidance

Example money field:

```prisma
model ExpenseLine {
  id             String   @id @default(cuid())
  expenseId      String
  merchant       String?
  originalAmount Decimal  @db.Decimal(12, 2)
  baseAmount     Decimal? @db.Decimal(12, 2)
  currencyCode   String
}
```

## Data-Layer Do Nots

- Do not use floating point types for currency
- Do not bypass Prisma Migrate
- Do not introduce pgvector, embeddings, or unrelated search infrastructure into this repo without canonical approval
- Do not change table or enum names without updating the shared docs first
