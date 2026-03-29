# OverClocked Reimbursement Management

Documentation-first planning repository for the Odoo reimbursement management hackathon.

## Product Summary

OverClocked is a reimbursement platform with one backend and one React application split into two surfaces:

- Desktop admin and finance experience for company setup, employee management, approval rules, expense oversight, analytics, and payment operations
- Mobile-first employee and manager experience for expense submission, receipt OCR, approvals, comments, and status tracking

The target implementation stack is Express + TypeScript + Prisma + PostgreSQL on the backend, and React 18 + Vite + Tailwind CSS v3 + Zustand on the frontend.

## Repository Map

- `AGENT.md` and `.AI/AGENT.md` define the working rules for repository-aware agents
- `.AI/Context/*.md` stores the living architecture, stack, scope, frontend, team, and gotcha references
- `.AI/Skills/*.md` stores helper implementation playbooks; these must defer to `.AI/AGENT.md`, `.AI/Context/*.md`, and `docs/implementation_plan.md`
- `.AI/Tasks/Dev*.md` stores pillar ownership and changelog history
- `docs/implementation_plan.md` is the shared interface and delivery contract
- `docs/*.pdf`, `docs/*.txt`, and `docs/img/*` store the source brief, extracted notes, and reference screenshots

## Current Status

The repository currently contains planning and documentation assets only. The planned `client/` and `server/` application directories have not been scaffolded in this working tree yet, so the markdown set is the active source of truth.

## Start Here

1. Read `.AI/AGENT.md`
2. Read `.AI/Context/Architecture.md` and `docs/implementation_plan.md`
3. Read the relevant `.AI/Context/*.md` file for your pillar and only then consult any `.AI/Skills/*.md` helper
4. Check the relevant `.AI/Tasks/Dev*.md` file before starting pillar-specific work
