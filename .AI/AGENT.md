# AI Agent Rules - Reimbursement Management System

## Project

- Name: OverClocked Reimbursement Management
- Repository: `Yugandhar577/OverClocked_Reimbursement_management`

## Canonical Documents

| File | Purpose |
|------|---------|
| `AGENT.md` | Repo-root pointer to this file |
| `.AI/Context/Architecture.md` | Target system architecture and domain model |
| `.AI/Context/Techstack.md` | Approved implementation stack and tooling |
| `.AI/Context/MVP.md` | P0, P1, and P2 scope tracking |
| `.AI/Context/Frontend_Reference.md` | UI patterns, components, and frontend conventions |
| `.AI/Context/TeamDetails.md` | Pillar ownership, handoffs, and documentation responsibilities |
| `.AI/Context/gotchas.md` | Edge cases and workflow traps |
| `.AI/Tasks/DevY.md` | Backend Core + Database changelog and scope |
| `.AI/Tasks/DevSK.md` | Approval Engine + Payments changelog and scope |
| `.AI/Tasks/DevSM.md` | Admin Dashboard changelog and scope |
| `.AI/Tasks/DevP.md` | Employee and Manager app changelog and scope |
| `.AI/Skills/*.md` | Optional implementation playbooks that must defer to the canonical context docs |
| `docs/implementation_plan.md` | Shared API, route, and delivery contract |

## Directory Structure Rules

```text
OverClocked_Reimbursement_management/
|-- AGENT.md
|-- README.md
|-- .AI/
|   |-- AGENT.md
|   |-- Context/
|   |   |-- Architecture.md
|   |   |-- Techstack.md
|   |   |-- MVP.md
|   |   |-- Frontend_Reference.md
|   |   |-- TeamDetails.md
|   |   `-- gotchas.md
|   `-- Tasks/
|       |-- DevY.md
|       |-- DevSK.md
|       |-- DevSM.md
|       `-- DevP.md
`-- docs/
    |-- implementation_plan.md
    |-- *.pdf
    |-- *.txt
    `-- img/
```

## Golden Rules

### 1. Auto-Update Changelogs

After every code or documentation session, append an entry to the relevant `Dev*.md` changelog table:

```markdown
| YYYY-MM-DD | Brief action description | `file1.ts`, `file2.jsx` | Notes |
```

Determine ownership from the files changed:

- `server/prisma/`, `server/src/` except approval, payment, notification, audit, and comments -> `DevY.md`
- Approval engine, approval rules, notifications, comments, payments, and audit logging -> `DevSK.md`
- `client/src/pages/admin/`, `client/src/components/admin/`, shared desktop layouts, auth flows, and admin-facing shared UI -> `DevSM.md`
- `client/src/pages/employee/`, `client/src/pages/manager/`, mobile layouts, receipt capture, and employee or manager shared UI -> `DevP.md`
- Shared files or planning docs -> update the pillar file for the area you clarified, plus any dependent pillar if the interface changed

### 2. Context Files Are Living Documents

Update the context docs whenever the design changes:

- New table or schema change -> `Architecture.md`
- New dependency, runtime, or tool -> `Techstack.md`
- New feature, priority shift, or completed milestone -> `MVP.md`
- New UI pattern, component contract, or frontend convention -> `Frontend_Reference.md`
- New risk, edge case, or workflow trap -> `gotchas.md`
- New API contract, route contract, or cross-pillar dependency -> `docs/implementation_plan.md`

### 3. Implementation Plan Is the Shared Contract

- All inter-pillar interfaces are defined in `docs/implementation_plan.md`.
- If a pillar needs another pillar's API before it exists, use mock data that matches the contract in the implementation plan.
- Do not invent new endpoints, route prefixes, or status values without updating the implementation plan first.

### 4. Skill Files Are Secondary Guidance

- `.AI/Skills/*.md` can provide execution help, but they are not canonical project rules.
- If a skill conflicts with `Architecture.md`, `Techstack.md`, `Frontend_Reference.md`, `TeamDetails.md`, or `docs/implementation_plan.md`, update the skill or ignore it.
- Do not import guidance from other stacks such as FastAPI, Redis, Celery, or pgvector unless the canonical docs are updated first.

### 5. Code Conventions

- Backend: TypeScript in strict mode with `routes -> controllers -> services`
- Frontend: React 18 functional components only
- Styling: Tailwind CSS v3 utilities only; no inline styles and no CSS modules
- API calls: always through `client/src/api/*.api.js`; never call axios directly inside components
- Validation: Zod schemas on every API endpoint
- State: Zustand for global state; no Redux and no Context API for app-wide state
- Auth: access token in Zustand memory, refresh token in `httpOnly` cookie, never in `localStorage`

### 6. Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| React component | `PascalCase.jsx` | `StatusBadge.jsx` |
| Hook | `camelCase.js` | `useAuth.js` |
| Store | `camelCase.js` | `authStore.js` |
| API file | `camelCase.api.js` | `expense.api.js` |
| Route file | `kebab-case.routes.ts` | `approval.routes.ts` |
| Service file | `kebab-case.service.ts` | `csv-import.service.ts` |
| Database table | `snake_case` | `expense_comments` |
| Env variable | `SCREAMING_SNAKE_CASE` | `DATABASE_URL` |

### 7. Pillar Boundaries

- Do not cross pillar boundaries without documenting the dependency in the relevant `Dev*.md` file.
- Foundation work starts with DevY, then DevSK layers approval and payment logic on top.
- DevSM and DevP consume the same backend APIs but own different route groups and layouts.

### 8. Database Rules

- Never modify `schema.prisma` without updating `Architecture.md` and `docs/implementation_plan.md`
- Use Prisma Migrate for schema changes; do not introduce raw SQL schema drift
- Use `DECIMAL(12,2)` for money values; never use floating point money columns
- Every new table needs an audit-log story

### 9. Error Handling

- Backend: use centralized `errorHandler.ts`; do not catch and swallow failures
- Frontend: show user-facing failures through toast or inline validation states
- All API calls must surface meaningful error messages to the UI

### 10. Testing and Verification

- Backend routes: verify with Thunder Client or Postman during development
- Approval engine: unit tests are required for sequential, percentage, VIP, required-veto, and escalation scenarios
- Frontend: manually verify desktop pages and Chrome mobile emulation for employee and manager flows
