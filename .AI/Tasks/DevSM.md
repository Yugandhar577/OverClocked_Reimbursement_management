# DevSM — Pillar 3: Frontend — Admin Dashboard (Desktop)

## Ownership
**All admin-facing pages rendered in the DesktopLayout.**

## Scope
- React + Vite project setup (shared with DevP)
- Tailwind CSS configuration
- DesktopLayout component (sidebar + header + content area)
- AuthLayout + Login/Signup pages (shared with DevP)
- Axios API client with JWT interceptor (shared with DevP)
- Zustand stores (auth, notifications — shared with DevP)

### Admin Pages
- **DashboardPage** — Analytics cards, spend-by-category chart, spend-by-department, trends
- **EmployeeManagement** — DataTable with CRUD, role dropdown, department assignment, reports_to picker
- **CSVImportPage** — CSV upload component, preview table, import summary
- **HierarchyPage** — Interactive org chart (tree visualization)
- **ApprovalRulesPage** — Create/edit rules: add approvers with drag-order, set % threshold, VIP/required toggles
- **CategoryManagement** — Category CRUD with code + name
- **AllExpensesPage** — Full expense table with Odoo-style sidebar filters (Status checkboxes + Employee list)
- **ExpenseReports** — Grouped view of expense reports with date ranges
- **PaymentsPage** — Approved expenses pending payment, Razorpay trigger, payment status tracking

### Shared Components
- Button, Input, Modal, DataTable, Select
- StatusBadge (color-coded pills)
- SidebarFilters (status + employee checkboxes)
- OrgChart (tree visualization)
- CSVUploader (drag-drop + preview)
- ApprovalRuleBuilder (step builder with user picker)
- AnalyticsCards
- NotificationBell

## Key Files
```
client/src/App.jsx
client/src/index.css
client/tailwind.config.js
client/src/layouts/DesktopLayout.jsx
client/src/layouts/AuthLayout.jsx
client/src/api/client.js
client/src/stores/authStore.js
client/src/pages/auth/*
client/src/pages/admin/*
client/src/components/common/*
client/src/components/admin/*
client/src/components/layout/Sidebar.jsx
client/src/components/layout/Header.jsx
client/src/components/layout/NotificationBell.jsx
```

## Dependencies
- DevY APIs for: auth, company, users, departments, categories, expenses
- DevSK APIs for: approval rules, notifications, payments

## Blocked By
- DevY (auth API for login/signup flow)
- Can start with mock data while APIs are being built

## Blocks
- Nothing (DevP works in parallel)

---

## Changelog

> **Format**: Each entry records date, what was done, files touched.
> AI agents: append to this section after every code session.

| Date | Action | Files Changed | Notes |
|------|--------|---------------|-------|
| | | | |
