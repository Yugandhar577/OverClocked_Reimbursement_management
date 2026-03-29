# DevSM - Pillar 3: Frontend - Admin Dashboard

## Ownership

Owns all admin-facing pages rendered inside the desktop experience, plus shared auth screens and admin-oriented shared UI.

## Scope

- React and Vite scaffold shared with DevP
- Desktop layout, header, sidebar, and auth layout
- Admin dashboard, employee management, CSV import, hierarchy, category, approval-rule, expense, report, and payment pages
- Shared desktop components such as tables, filters, modals, and analytics cards
- Auth store, notification store, and API wiring needed by desktop flows

## Admin Pages

- `DashboardPage` - analytics cards, spend breakdowns, and operational summaries
- `EmployeeManagement` - CRUD, role assignment, department assignment, and reporting-line management
- `CSVImportPage` - upload, preview, validation feedback, and import summary
- `HierarchyPage` - org tree visualization
- `ApprovalRulesPage` - ordered approver editing with threshold controls
- `CategoryManagement` - category CRUD
- `AllExpensesPage` - full company expense table with sidebar filters
- `ExpenseReports` - grouped report views
- `PaymentsPage` - approved expenses awaiting payment and payment-state updates

## Shared Components

- `Button`, `Input`, `Modal`, `DataTable`, `Select`
- `StatusBadge`
- `SidebarFilters`
- `OrgChart`
- `CSVUploader`
- `ApprovalRuleBuilder`
- `AnalyticsCards`
- `NotificationBell`

## Must Keep Synced

- `.AI/Context/Frontend_Reference.md`
- `.AI/Context/MVP.md`
- `docs/implementation_plan.md`
- `.AI/Tasks/DevSM.md`

## Changelog

| Date | Action | Files Changed | Notes |
|------|--------|---------------|-------|
| 2026-03-29 | Connected the admin client to the live Express and Prisma backend with auth guards, session bootstrap, axios token refresh, backend-backed resource adapters, and runtime validation fixes discovered during full-stack verification | `client/src/App.jsx`, `client/src/api/auth.api.js`, `client/src/api/http.js`, `client/src/api/notifications.api.js`, `client/src/api/transformers.js`, `client/src/api/users.api.js`, `client/src/api/expenses.api.js`, `client/src/api/reports.api.js`, `client/src/api/payments.api.js`, `client/src/api/dashboard.api.js`, `client/src/api/categories.api.js`, `client/src/api/company.api.js`, `client/src/api/approval-rules.api.js`, `client/src/stores/useAuthStore.js`, `client/src/stores/useAdminShellStore.js`, `client/src/components/auth/AuthGuard.jsx`, `client/src/pages/auth/AuthPage.jsx`, `client/src/components/admin/NotificationBell.jsx`, `client/src/components/layout/AdminLayout.jsx`, `client/src/components/layout/AdminSidebar.jsx`, `client/src/components/layout/AdminTopbar.jsx`, `client/src/components/ui/button.jsx`, `client/src/pages/admin/DashboardPage.jsx`, `.AI/Tasks/DevSM.md`, `.gitignore` | Verified with `npm run build` in `client/` and `server/`, Dockerized Postgres migrations, live signup/login refresh flow, and successful `200` responses across dashboard, employees, expenses, reports, approval rules, categories, hierarchy, and payments |
| 2026-03-29 | Scaffolded the React admin client and implemented the Figma-aligned desktop shell, shared UI primitives, mock API layer, and admin route set for dashboard, employees, expenses, reports, hierarchy, approval rules, categories, CSV import, and payments | `client/package.json`, `client/tailwind.config.js`, `client/src/main.jsx`, `client/src/App.jsx`, `client/src/index.css`, `client/src/data/adminData.js`, `client/src/api/*.api.js`, `client/src/stores/useAdminShellStore.js`, `client/src/hooks/useMockResource.js`, `client/src/components/layout/*.jsx`, `client/src/components/admin/*.jsx`, `client/src/components/shared/*.jsx`, `client/src/components/ui/*.jsx`, `client/src/pages/admin/*.jsx`, `.AI/Context/Techstack.md`, `.AI/Context/Frontend_Reference.md`, `docs/implementation_plan.md`, `.AI/Tasks/DevSM.md` | Verified with `npm run build`; backend integration still uses contract-accurate mock data |
| 2026-03-29 | Refreshed the admin frontend brief, shared UI guidance, and milestone scope to match the canonical repo rules | `.AI/Context/Frontend_Reference.md`, `.AI/Context/MVP.md`, `docs/implementation_plan.md`, `.AI/Tasks/DevSM.md` | Documentation-only update |
| 2026-03-29 | Rewrote frontend helper skills to match the admin dashboard contract, route groups, and repo-level documentation precedence rules | `AGENT.md`, `.AI/AGENT.md`, `README.md`, `.AI/Skills/frontend-design/SKILL.md`, `.AI/Skills/frontend-design/react-frontend.md`, `.AI/Skills/webapp-testing/SKILL.md`, `.AI/Tasks/DevSM.md` | Documentation-only update |
