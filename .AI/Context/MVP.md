# MVP Feature Breakdown

## Contract Reference

- The live endpoint and route inventory is documented in `.AI/Context/endpoints.md`.

## P0 - Must Have (Demo-Critical)

### Auth & Onboarding
- [x] Company signup (name, country -> auto currency)
- [x] Login / JWT auth
- [x] Forgot / reset password flow (email token)
- [x] CSV employee import -> auto-generate accounts + hierarchy
- [x] Welcome email with credentials

### Expense Management
- [x] Create expense (title, amount, currency, category, date)
- [ ] Add line items (description, amount, vendor, date)
- [x] Upload receipt image
- [x] OCR scan -> pre-fill expense form (Mindee API)
- [x] Submit expense -> triggers approval
- [ ] View own expenses with status filters
- [ ] Status pipeline: Draft -> To Submit -> Submitted -> Approved -> Done

### Approval Workflow
- [x] Manager sees pending approvals
- [x] Approve / Reject with comments
- [x] Sequential multi-level approval chain
- [x] Department-scoped hierarchy (employees report to own managers)
- [x] Manager cannot self-approve

### Admin Dashboard
- [ ] View all expenses (filterable by status + employee)
- [x] Manage employees (CRUD + role assignment)
- [ ] Manage departments
- [x] Manage expense categories (with codes like Odoo)
- [x] Configure approval rules (approvers + sequence + % threshold)
- [ ] Set approval limits per position
- [x] View org hierarchy tree

## P1 - Should Have (Strong Demo)

### Advanced Approval
- [x] Percentage-based approval (60% of approvers = approved)
- [x] VIP auto-approve (CFO approves -> instant approve)
- [x] Required approver veto (Finance Head rejects -> instant reject)
- [x] Auto-escalation when expense exceeds manager's limit

### Expense Features
- [ ] Expense splitting (like Odoo -> split into sub-line-items)
- [x] Multi-currency with live conversion
- [x] Currency display in company's base currency
- [x] Duplicate expense detection (same date + similar amount)
- [ ] Expense reports -> group multiple expenses into period-based reports

### UX
- [x] Threaded comments on expenses (Send message / Log note)
- [x] In-app notifications (bell icon with badge)
- [ ] Receipt preview panel (side view like Odoo)
- [ ] Status badges (color-coded pills)
- [ ] Horizontal status pipeline component

### Payments
- [x] Razorpay integration for reimbursement payouts
- [x] Payment status tracking (Unpaid -> In Payment -> Paid)

## Validation Notes

- The Apex Solutions workbook onboarding and expense story was exercised end-to-end on 2026-03-29 through `server/scripts/run-apex-demo.ts`.
- That run covered signup, India -> INR currency defaulting, XLSX preview/finalize import, manager hierarchy confirmation, welcome credential delivery, OCR-assisted submissions, percentage approval, VIP approval shortcut, rejection/resubmission, hierarchy retrieval, company stats, and payment verification.

## P2 - Could Have (Polish)

- [ ] Analytics dashboard (spend by category, by department, trends)
- [ ] Dark mode toggle
- [x] Audit log viewer (admin)
- [ ] Email notifications on status changes
- [ ] PWA offline support (queue receipts)
- [ ] Bulk approval for managers
- [ ] Receipt integrity (SHA-256 checksums after approval)
