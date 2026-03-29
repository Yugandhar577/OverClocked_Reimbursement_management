# Frontend Reference

## Experience Goals

- Admin and finance screens should feel like an Odoo-inspired operations workspace: dense information, strong filters, clear primary actions, and fast table workflows
- Employee and manager screens should be mobile-first: single-column flows, large touch targets, and camera-first receipt capture
- Clarity beats decoration: every important field needs a visible label, every workflow needs explicit status and error feedback, and every page needs empty and loading states

## Styling Rules

- Use Tailwind CSS v3 utilities only
- Do not use inline style objects or CSS modules
- Default to a light enterprise palette built around warm neutrals, mauve brand surfaces, aqua success states, and amber exception states; dark mode is optional P2 work
- Prefer semantic utility groupings and reusable component wrappers over repeated one-off class lists
- Use Framer Motion sparingly for page reveals, card hover lift, and route transitions; avoid decorative motion loops

## Suggested Color Direction

| Token | Usage | Value |
|------|-------|-------|
| `brand` | Main actions, active nav, priority surfaces | `#6D4262` |
| `brand-soft` | Hover and selected backgrounds | `#F1E6EC` |
| `aqua` | Positive progress and validation states | `#0F8F8A` |
| `amber` | Review, finance, and exception emphasis | `#A05A1F` |
| `canvas` | App background | `#F8F4F2` |
| `panel` | Cards, tables, sidebars | `#FFFFFF` |
| `border` | Table and form outlines | `#E8DDDE` |
| `text-strong` | Headings and key values | `#1F1A1C` |
| `text-muted` | Secondary labels | `#6D6467` |
| `success` | Approved and paid states | `#15803D` |
| `danger` | Rejected or destructive states | `#DC2626` |

## Layout Patterns

| Surface | Layout | Notes |
|---------|--------|-------|
| Admin desktop | `AdminLayout` | Left sidebar, floating topbar, content width optimized for tables and filters |
| Auth | `AuthLayout` | Shared login, signup, and reset flows |
| Employee and manager mobile | `MobileLayout` | Sticky header and bottom nav, one-column forms, card-first lists |

## Contract Sources

- Frontend route entrypoints and role gates are defined in `client/src/App.jsx`
- Frontend API modules are defined in `client/src/api/*.api.js`
- Canonical frontend route map to backend endpoints is maintained in `.AI/Context/endpoints.md`

## Shared UI Components

| Component | Responsibility |
|-----------|----------------|
| `Button` | Primary, secondary, outline, destructive actions |
| `Input` and `Select` | Labeled form controls with inline validation states |
| `Modal` | Confirm destructive actions and focused edits |
| `DataTable` | Sortable and filterable desktop data views |
| `StatusBadge` | Color-coded state pill with readable text contrast |
| `PageHeader` | Dense page title area with actions and section copy |
| `PageTransition` | Route-level reveal wrapper with reduced-motion fallback |
| `MetricCard` | KPI surfaces for admin summaries |
| `ConfigurationTabs` | Shared switcher across admin configuration routes |
| `SidebarFilters` | Odoo-style status and employee filter groups |
| `CSVUploader` | Drag-drop CSV/XLSX upload, preview, validation summary |
| `ApprovalRuleBuilder` | Ordered approver steps, toggles, and thresholds |
| `OrgChart` | Hierarchy visualization for admin pages |
| `NotificationBell` | In-app unread indicator and dropdown summary |
| `ExpenseSummaryHeader` | Employee totals such as to submit, under review, and to reimburse |
| `StatusPipeline` | Horizontal lifecycle component on detail views |
| `ApprovalTimeline` | Vertical approval history for mobile detail views |
| `ReceiptViewer` | Image or PDF preview next to form or detail content |
| `CommentThread` | Send message, log note, and activity tabs |
| `BottomNavBar` | Role-aware mobile navigation for employee and manager routes |
| `FileUpload` | Receipt capture hand-off that supports camera or file-picker UX |
| `SplitExpenseModal` | Mobile-friendly split flow that duplicates one line into multiple reviewable entries |

## Mobile Workflow Notes

- `ScanReceipt` creates a lightweight draft before OCR because the backend receipt upload endpoint requires an existing `expenseId`
- Mobile expense screens should prefer card stacks, sticky bottom actions, and one-column forms over desktop table patterns
- Manager mobile routes should reuse the same expense detail components as employees wherever possible, then layer approval actions on top
- Keep receipt parsing confidence and warnings visible near the form fields that were auto-filled from OCR

## Access Rules To Preserve

- Admin configuration screens (`/admin/approval-rules`, `/admin/import`) are admin-only surfaces
- Finance users stay in dashboard, expenses, reports, and payments surfaces
- Keep role-aware desktop navigation aligned with backend RBAC restrictions

## Admin Import Flow

- The admin import page is a two-step preview/finalize workflow, not a blind one-click import.
- Uploads must accept both `.csv` and Excel workbooks so the Apex demo roster can be used directly.
- Preview should surface extracted positions, platform-role defaults, department hints, and manager matches before any users are created.
- Admins must be able to correct positions and choose each employee's reporting line before finalization.
- Finalization should clearly communicate that employee credentials have been queued for email delivery.

## Form Rules

- Never rely on placeholder-only labels
- Group related fields under clear section headings such as "Expense Details" and "Receipt Details"
- Mark required inputs consistently
- Validate early and show inline errors close to the relevant field
- Disable submit actions only when the form state makes the reason obvious
- For currency fields, show both original amount and company-base conversion clearly

## Status Badge Mapping

| Status | Tailwind Direction |
|--------|--------------------|
| `draft` | muted gray |
| `to_submit` | blue |
| `submitted` | teal |
| `pending_approval` | amber |
| `approved` | green |
| `rejected` | red |
| `in_payment` | emerald tint |
| `paid` | strong emerald |

## Frontend Conventions

- Components: `PascalCase.jsx`
- Hooks: `camelCase.js`
- Stores: `camelCase.js`
- API files: `camelCase.api.js`
- Desktop layout files live in `client/src/components/layout/`
- Admin route files live in `client/src/pages/admin/`
- Keep business logic out of route components when it can live in stores, hooks, or API helpers
- All API access goes through `client/src/api/*.api.js`
- Global state goes through Zustand stores only

## Odoo-Inspired Patterns To Preserve

1. Sidebar filter stacks for status, employee, and department slices
2. Dense summary headers with operational totals
3. Status pipelines at the top of detail pages
4. Receipt preview beside the form on larger screens
5. Comment and activity sections under the expense detail
6. Fast top-level action buttons such as create, attach receipt, split, approve, and pay
7. KPI cards with restrained motion and prominent number hierarchy

## Accessibility and Responsive Baseline

- Use real labels and helper text for custom controls
- Keep text contrast high enough for status pills and table text
- Ensure keyboard navigation works for tables, menus, and modals
- Collapse desktop multi-column forms into one mobile column below tablet widths
- Keep primary mobile actions within thumb reach and use touch targets that are easy to hit
