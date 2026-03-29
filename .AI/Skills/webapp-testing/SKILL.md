---
name: webapp-testing
description: Playwright-oriented testing guidance for the OverClocked web app. Use when validating admin desktop flows, shared auth flows, or the mobile-first employee and manager experience against the contracts defined in `.AI/Context/Frontend_Reference.md` and `docs/implementation_plan.md`.
license: Complete terms in LICENSE.txt
---

# Web Application Testing

## Read First

- `.AI/AGENT.md`
- `.AI/Context/Frontend_Reference.md`
- `docs/implementation_plan.md`

This repo may still be documentation-first. If `client/` or `server/` has not been scaffolded yet, say that plainly instead of inventing a runtime.

## What To Verify

### Shared Auth

- `/login`
- `/signup`
- `/forgot-password`

### Admin Desktop

- `/admin/dashboard`
- `/admin/employees`
- `/admin/import`
- `/admin/hierarchy`
- `/admin/approval-rules`
- `/admin/categories`
- `/admin/expenses`
- `/admin/reports`
- `/admin/payments`

### Employee And Manager Mobile

- `/expenses`
- `/expenses/new`
- `/expenses/:id`
- `/expenses/:id/split`
- `/scan`
- `/approvals`
- `/approvals/:id`
- `/team-expenses`

## Testing Expectations

- Verify admin screens at desktop widths
- Verify employee and manager flows in Chrome mobile emulation
- Check loading, empty, error, and confirmation states
- Check labels, required markers, status badges, and table or modal keyboard behavior
- Confirm API-backed screens use contract-accurate mock data when the backend is not ready yet

## Tooling Pattern

- Prefer Playwright
- Use the bundled `scripts/with_server.py` helper when local servers need orchestration
- Run helper scripts with `--help` first instead of reading their source by default

## Common Pitfalls

- Do not inspect a dynamic page before the app settles
- Do not verify only the happy path
- Do not skip responsive checks on employee or manager routes
- Do not mark a screen done without checking status, validation, and destructive-action behavior
