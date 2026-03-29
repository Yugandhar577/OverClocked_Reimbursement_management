# Frontend Reference

## Design System (Tailwind CSS v3)

### Color Palette (in `tailwind.config.js`)
```js
colors: {
  primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a5f' },
  accent:  { 400: '#22d3ee', 500: '#06b6d4' },
  success: { 500: '#10b981', 600: '#059669' },
  warning: { 500: '#f59e0b', 600: '#d97706' },
  danger:  { 500: '#ef4444', 600: '#dc2626' },
  slate:   { 50: '#f8fafc', 100: '#f1f5f9', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }
}
```

### Typography
- Font: `Inter` (Google Fonts)
- Headings: `font-bold text-slate-900 dark:text-slate-100`
- Body: `text-sm text-slate-600 dark:text-slate-300`

### Status Badge Colors (matching Odoo pills)
| Status | Tailwind Classes |
|--------|-----------------|
| Draft | `bg-slate-100 text-slate-600` |
| To Submit | `bg-blue-100 text-blue-700` |
| Submitted | `bg-teal-100 text-teal-700` |
| Pending Approval | `bg-amber-100 text-amber-700` |
| Approved | `bg-green-100 text-green-700` |
| Posted | `bg-green-200 text-green-800` |
| Done | `bg-green-500 text-white` |
| Rejected | `bg-red-100 text-red-700` |
| Refused | `bg-red-500 text-white` |
| In Payment | `bg-emerald-100 text-emerald-700` |
| Paid | `bg-emerald-500 text-white` |

## Component Conventions

### File Naming
- Components: `PascalCase.jsx` (e.g. `StatusBadge.jsx`)
- Hooks: `camelCase.js` (e.g. `useAuth.js`)
- Stores: `camelCase.js` (e.g. `authStore.js`)
- API files: `camelCase.api.js` (e.g. `expense.api.js`)

### Component Structure
```jsx
// imports
// constants
// component
export default function ComponentName({ prop1, prop2 }) {
  // hooks
  // state
  // handlers
  // render
}
```

### API Layer Pattern
```jsx
// api/expense.api.js
import client from './client';

export const getExpenses = (params) => client.get('/expenses', { params });
export const createExpense = (data) => client.post('/expenses', data);
export const submitExpense = (id) => client.post(`/expenses/${id}/submit`);
```

## Odoo-Inspired UI Patterns to Implement

1. **Status Pipeline** — Horizontal stepper at top of expense detail: `To Report ▸ To Submit ▸ Submitted ▸ Approved ▸ Done`
2. **Sidebar Filters** — Left sidebar with checkbox filters for Status + Employee (like Odoo's expense reports page)
3. **Receipt Preview Panel** — Right-side panel showing PDF/image preview alongside expense form
4. **Comment Thread** — Below expense detail: "Send message" | "Log note" | "Activities" tabs
5. **Expense Split Modal** — Table showing line items with description, product, total, tax, employee columns + "Add a line" + "Split Expense" button
6. **Summary Header** — Dollar amounts with arrows: `$X to submit ▸ $X under validation ▸ $X to be reimbursed`
7. **Action Buttons** — Top-left with primary actions: "Create Report" (teal), "Attach Receipt" (outline), "Split Expense" (outline)

## Responsive Strategy

| Viewport | Layout | Navigation |
|----------|--------|------------|
| Desktop (≥1024px) | DesktopLayout — left sidebar + top header | Sidebar links |
| Tablet (768–1023px) | DesktopLayout — collapsible sidebar | Hamburger menu |
| Mobile (<768px) | MobileLayout — bottom nav bar + header | Bottom tab bar |
