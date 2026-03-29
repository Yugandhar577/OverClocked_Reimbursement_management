# Team Details

## Team: OverClocked

| Dev ID | File | Pillar | Scope |
|--------|------|--------|-------|
| DevY | `.AI/Tasks/DevY.md` | **Pillar 1: Backend Core + Database** | Prisma schema, Express setup, auth, RBAC, all CRUD APIs, CSV import, email service |
| DevSK | `.AI/Tasks/DevSK.md` | **Pillar 2: Approval Engine + Payments** | Approval workflow engine, approval rules API, Razorpay integration, notification system, audit logging |
| DevSM | `.AI/Tasks/DevSM.md` | **Pillar 3: Frontend — Admin Dashboard (Desktop)** | All admin pages, org chart, CSV upload UI, approval rule builder, expense list with filters, analytics, payment management |
| DevP | `.AI/Tasks/DevP.md` | **Pillar 4: Frontend — Employee/Manager Mobile App** | All employee/manager pages, expense form, OCR scan flow, approval queue, comment thread, receipt viewer, status pipeline, PWA |

## Work Distribution Rationale

Each developer owns an **entire vertical slice** — they are responsible for the complete feature set within their pillar, from data layer to UI or from API to business logic. This minimizes cross-dependencies and allows parallel development.

### Dependency Graph
```
DevY (Backend Core) ──→ DevSK (Approval + Payments)
       ↓                        ↓
DevSM (Admin Frontend)    DevP (Mobile Frontend)
```

- DevY builds the foundation first (schema, auth, basic APIs)
- DevSK depends on DevY's user/expense tables to build approval engine
- DevSM and DevP depend on completed APIs from DevY and DevSK
- DevSM and DevP work in parallel on different layouts/routes

## Communication Protocol

- All API contracts are defined in the implementation plan
- If an API isn't ready yet, frontend devs should use mock data that matches the schema
- All devs update their Dev*.md changelog after each coding session
