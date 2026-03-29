# AI Agent Rules — Reimbursement Management System

## Project: OverClocked Reimbursement Management
## Repo: `Yugandhar577/OverClocked_Reimbursement_management`

---

## Directory Structure Rules

```
.AI/
├── AGENT.md            ← THIS FILE — global rules for AI agents
├── Context/
│   ├── Architecture.md ← System architecture overview
│   ├── Techstack.md    ← Full tech stack reference
│   ├── MVP.md          ← Feature priorities (P0/P1/P2)
│   ├── Frontend_Reference.md ← Design system, components, patterns
│   ├── TeamDetails.md  ← 4-developer pillar breakdown
│   └── gotchas.md      ← Known edge cases and pitfalls
└── Tasks/
    ├── DevY.md          ← Backend Core + Database
    ├── DevSK.md         ← Approval Engine + Payments
    ├── DevSM.md         ← Admin Dashboard (Desktop)
    └── DevP.md          ← Employee/Manager Mobile App
```

## Golden Rules

### 1. Auto-Update Changelogs
After **every** code generation, modification, or deletion session, **append** an entry to the relevant `Dev*.md` changelog table:

```markdown
| YYYY-MM-DD | Brief action description | `file1.ts`, `file2.jsx` | Notes |
```

Determine which developer file to update based on the files changed:
- `server/prisma/`, `server/src/` (except approval/payment) → `DevY.md`
- Approval engine, payment, notifications, audit → `DevSK.md`
- `client/src/pages/admin/`, `client/src/components/admin/`, layouts, auth → `DevSM.md`
- `client/src/pages/employee/`, `client/src/pages/manager/`, mobile components → `DevP.md`
- Shared files (api client, stores) → update whichever Dev created/modified them

### 2. Context Files Are Living Documents
When making **architectural changes** (new tables, new APIs, new components), update the relevant Context files:
- New table → update `Architecture.md`
- New dependency → update `Techstack.md`
- New feature → update `MVP.md` (check/uncheck items)
- New component pattern → update `Frontend_Reference.md`
- New edge case discovered → update `gotchas.md`

### 3. Code Conventions
- **Backend**: TypeScript (strict), Express routes → controllers → services pattern
- **Frontend**: JSX (React 18), functional components only, Zustand stores
- **Styling**: Tailwind CSS v3 utility classes only — NO inline styles, NO CSS modules
- **API calls**: Through `client/src/api/*.api.js` layer — NEVER axios directly in components
- **Validation**: Zod schemas on every API endpoint
- **State**: Zustand — NO Redux, NO Context API for global state
- **Auth**: JWT in Zustand memory (access), httpOnly cookie (refresh) — NEVER localStorage

### 4. Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| React components | PascalCase.jsx | `StatusBadge.jsx` |
| Hooks | camelCase.js | `useAuth.js` |
| Stores | camelCase.js | `authStore.js` |
| API files | camelCase.api.js | `expense.api.js` |
| Routes | kebab-case.routes.ts | `approval.routes.ts` |
| Services | kebab-case.service.ts | `csv-import.service.ts` |
| DB tables | snake_case | `expense_comments` |
| Env variables | SCREAMING_SNAKE | `DATABASE_URL` |

### 5. Pillar Boundaries
- **Do NOT** cross pillar boundaries without documenting the dependency in the relevant Dev file
- If you need an API from another pillar, use mock data until it's available
- All inter-pillar interfaces are defined in the implementation plan

### 6. Database Rules
- **NEVER** modify `schema.prisma` without updating `Architecture.md`
- Always use Prisma Migrate (`npx prisma migrate dev`) — no raw SQL for schema changes
- Use `DECIMAL(12,2)` for money, NEVER `FLOAT`
- All new tables need audit_log integration

### 7. Error Handling
- Backend: Use centralized `errorHandler.ts` middleware — never catch-and-swallow
- Frontend: Use toast notifications for user-facing errors
- All API calls should have try/catch with meaningful error messages

### 8. Testing
- API testing via Thunder Client / Postman during dev
- Approval engine: unit tests required for each scenario (sequential, percentage, VIP, required veto)
- Frontend: manual testing with Chrome DevTools mobile viewport
