# DevP — Pillar 4: Frontend — Employee/Manager Mobile App

## Ownership
**All employee and manager-facing pages rendered in the MobileLayout (PWA).**

## Scope
- MobileLayout component (bottom nav bar + header)
- PWA setup (manifest.json, service worker)
- Camera/file-picker integration for receipt scanning

### Employee Pages
- **MyExpenses** — Expense list with summary header ($X to submit ▸ $X under validation ▸ $X to reimburse), status filter tabs
- **NewExpense** — Expense creation form (title, amount, currency selector, category, date, vendor, line items, receipt upload)
- **ExpenseDetail** — Full view with status pipeline, receipt preview panel, approval timeline, comment thread
- **SplitExpense** — Split modal (table: description, product, amount, tax, employee + "Add a line")
- **ScanReceipt** — Camera/upload → OCR → preview parsed data → confirm & auto-fill form

### Manager Pages
- **ApprovalQueue** — Pending expenses with employee info, amount, status
- **ApprovalDetail** — Expense detail view + approve/reject buttons + comment box
- **TeamExpenses** — All team expenses with filters

### Components
- ExpenseCard (mobile card layout)
- ExpenseForm (responsive)
- ExpenseLineItem (add/edit/delete line items)
- SplitExpenseModal
- ApprovalTimeline (vertical step tracker with approver names + status)
- ReceiptViewer (image/PDF viewer panel)
- CommentThread (Send message / Log note tabs)
- ExpenseSummaryHeader (dollar amounts with arrow flow)
- StatusPipeline (horizontal stepper: To Report → Done)
- BottomNavBar (Employee: Expenses | Scan | Profile; Manager: Approvals | Team | Profile)
- CurrencyDisplay (amount with currency code)
- FileUpload (drag-drop or camera)

## Key Files
```
client/src/layouts/MobileLayout.jsx
client/public/manifest.json
client/public/sw.js
client/src/pages/employee/*
client/src/pages/manager/*
client/src/components/expense/*
client/src/components/layout/BottomNavBar.jsx
client/src/hooks/useMediaQuery.js
client/src/hooks/useCurrency.js
client/src/api/expense.api.js
client/src/api/approval.api.js
client/src/api/payment.api.js
client/src/stores/expenseStore.js
client/src/stores/approvalStore.js
```

## Dependencies
- DevY APIs for: auth, expenses, receipts, OCR, currencies
- DevSK APIs for: approvals, comments, notifications

## Blocked By
- DevY (expense + receipt APIs)
- Can start with mock data while APIs are being built

## Blocks
- Nothing (DevSM works in parallel)

---

## Changelog

> **Format**: Each entry records date, what was done, files touched.
> AI agents: append to this section after every code session.

| Date | Action | Files Changed | Notes |
|------|--------|---------------|-------|
| | | | |
