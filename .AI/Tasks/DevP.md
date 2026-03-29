# DevP - Pillar 4: Frontend - Employee and Manager App

## Ownership

Owns all employee and manager-facing mobile-first routes, receipt capture flows, and mobile shared components.

## Scope

- `MobileLayout` and bottom navigation
- Employee expense list, create, detail, split, and receipt-scan pages
- Manager approval queue, approval detail, and team-expense pages
- Mobile-first shared components such as expense cards, forms, timelines, pipelines, and receipt viewers
- PWA-oriented concerns such as manifest, service worker, and camera or file-picker UX

## Core Screens

- `MyExpenses` - employee list plus summary header and status filtering
- `NewExpense` - draft creation with currency, category, line items, and upload
- `ExpenseDetail` - status pipeline, receipt preview, comments, and history
- `SplitExpense` - split flow for itemized receipts
- `ScanReceipt` - camera or upload to OCR review flow
- `ApprovalQueue` - manager pending approvals
- `ApprovalDetail` - manager action view with approve or reject path
- `TeamExpenses` - team-wide expense visibility

## Shared Components

- `ExpenseCard`
- `ExpenseForm`
- `ExpenseLineItem`
- `SplitExpenseModal`
- `ApprovalTimeline`
- `ReceiptViewer`
- `CommentThread`
- `ExpenseSummaryHeader`
- `StatusPipeline`
- `BottomNavBar`
- `CurrencyDisplay`
- `FileUpload`

## Must Keep Synced

- `.AI/Context/Frontend_Reference.md`
- `.AI/Context/MVP.md`
- `docs/implementation_plan.md`
- `.AI/Tasks/DevP.md`

## Changelog

| Date | Action | Files Changed | Notes |
|------|--------|---------------|-------|
| 2026-03-29 | Updated the mobile app brief and shared scope docs to align with the canonical agent rules and implementation plan | `.AI/Context/Frontend_Reference.md`, `.AI/Context/MVP.md`, `docs/implementation_plan.md`, `.AI/Tasks/DevP.md` | Documentation-only update |
| 2026-03-29 | Rewrote mobile and shared frontend helper skills so they follow the employee and manager route contract, testing expectations, and canonical doc precedence | `AGENT.md`, `.AI/AGENT.md`, `README.md`, `.AI/Skills/frontend-design/SKILL.md`, `.AI/Skills/frontend-design/react-frontend.md`, `.AI/Skills/webapp-testing/SKILL.md`, `.AI/Tasks/DevP.md` | Documentation-only update |
