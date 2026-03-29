# Team Details

## Team: OverClocked

| Dev ID | Pillar | Primary Scope | Must Keep In Sync |
|--------|--------|---------------|-------------------|
| `DevY` | Backend Core + Database | Prisma schema, auth, RBAC, CRUD APIs, CSV import, OCR integration points, email and currency services | `Architecture.md`, `Techstack.md`, `docs/implementation_plan.md`, `DevY.md` |
| `DevSK` | Approval Engine + Payments | Approval rules, approval execution, comments, notifications, audit logging, Razorpay payment flow | `gotchas.md`, `docs/implementation_plan.md`, `DevSK.md` |
| `DevSM` | Admin Dashboard | Desktop layouts, auth screens, admin pages, admin shared UI, desktop state and API wiring | `Frontend_Reference.md`, `MVP.md`, `docs/implementation_plan.md`, `DevSM.md` |
| `DevP` | Employee and Manager App | Mobile layouts, expense submission, OCR review flow, approval queue, comments, mobile shared UI, PWA concerns | `Frontend_Reference.md`, `MVP.md`, `docs/implementation_plan.md`, `DevP.md` |

## Delivery Order

1. DevY builds the schema, auth, and base APIs
2. DevSK builds approval, notifications, comments, and payment workflows on top of DevY foundations
3. DevSM and DevP work in parallel against the same API contracts, using mock data when endpoints are not ready yet

## Dependency Graph

```text
DevY ---> DevSK
  |         |
  +--> DevSM
  `--> DevP
```

## Cross-Pillar Rules

- `docs/implementation_plan.md` is the contract for API shapes, route prefixes, and shared status vocabularies
- `.AI/Context/endpoints.md` is the live endpoint and entrypoint inventory for both frontend and backend
- Shared client files must be documented in the modifier's `Dev*.md` changelog, and dependent pillars should be called out when the interface changes
- If a pillar needs another pillar's unfinished API, it should use contract-matching mock data rather than inventing new shapes
- Planning or documentation changes still count as work sessions and must be logged in the relevant `Dev*.md`
