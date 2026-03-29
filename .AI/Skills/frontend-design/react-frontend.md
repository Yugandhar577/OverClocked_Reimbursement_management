---
name: react-frontend-development
description: Use when building or modifying the OverClocked React frontend with React 18, Vite, Tailwind CSS v3, React Router v6, Zustand, and the shared `client/src/api/*.api.js` contract. This guide enforces route structure, component boundaries, state usage, and desktop or mobile UI rules for the reimbursement system.
---

# React Frontend Development

## Canonical References

- `.AI/AGENT.md`
- `.AI/Context/Frontend_Reference.md`
- `.AI/Context/MVP.md`
- `docs/implementation_plan.md`

This file is a helper guide. The canonical docs above win on any conflict.

## Approved Stack

- React 18 functional components only
- Vite
- Tailwind CSS v3 utilities only
- React Router v6
- Zustand for shared client state
- Axios through `client/src/api/*.api.js`

## Planned Frontend Structure

```text
client/
|-- public/
|   |-- manifest.json
|   `-- sw.js
`-- src/
    |-- api/
    |   |-- auth.api.js
    |   |-- company.api.js
    |   |-- users.api.js
    |   |-- departments.api.js
    |   |-- categories.api.js
    |   |-- expenses.api.js
    |   |-- approvals.api.js
    |   |-- comments.api.js
    |   |-- notifications.api.js
    |   `-- payments.api.js
    |-- components/
    |   |-- admin/
    |   |-- mobile/
    |   `-- shared/
    |-- hooks/
    |-- layouts/
    |   |-- AuthLayout.jsx
    |   |-- DesktopLayout.jsx
    |   `-- MobileLayout.jsx
    |-- pages/
    |   |-- admin/
    |   |-- employee/
    |   `-- manager/
    |-- stores/
    `-- utils/
```

## Route Groups

- Shared auth: `/login`, `/signup`, `/forgot-password`
- Admin desktop: `/admin/*`
- Employee mobile: `/expenses/*`, `/scan`
- Manager mobile: `/approvals/*`, `/team-expenses`

Match these route groups before adding new pages or layouts.

## Component Boundaries

- Page components are thin wrappers that assemble layouts, route params, and page-level composition
- Reusable UI belongs in `components/`
- Shared business logic belongs in hooks, stores, or API modules, not inside page files
- Admin-only components stay under `components/admin/`
- Employee or manager shared mobile components stay under `components/mobile/`
- Cross-surface primitives such as `Button`, `Input`, `Modal`, and `StatusBadge` live under `components/shared/`

## Naming Rules

- Components: `PascalCase.jsx`
- Hooks: `camelCase.js` with `use` prefix
- Stores: `camelCase.js`
- API files: `camelCase.api.js`

## State Rules

- Shared auth, notification, and cross-route UI state can live in Zustand
- Route-local form state, modal state, and temporary UI state should stay local to the component tree
- Do not use Redux
- Do not use Context API for app-wide state
- Do not persist access tokens in `localStorage`

## API Rules

- All HTTP calls go through `client/src/api/*.api.js`
- Components and pages should never call axios directly
- Keep API modules grouped by backend contract, not by screen name
- Match the endpoint and status vocabulary defined in `docs/implementation_plan.md`

Example:

```jsx
// src/api/expenses.api.js
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export async function getExpenses(params = {}) {
  const response = await api.get("/api/expenses", { params })
  return response.data
}
```

```jsx
// src/pages/employee/MyExpensesPage.jsx
import { useEffect, useState } from "react"
import { getExpenses } from "../../api/expenses.api"

export default function MyExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    let active = true

    getExpenses()
      .then((data) => {
        if (!active) return
        setExpenses(data.items ?? [])
        setStatus("ready")
      })
      .catch(() => {
        if (!active) return
        setStatus("error")
      })

    return () => {
      active = false
    }
  }, [])

  if (status === "loading") return <div>Loading expenses...</div>
  if (status === "error") return <div>Could not load expenses.</div>

  return <div>{expenses.length} expenses</div>
}
```

## UI Rules By Surface

### Admin Desktop

- Use `DesktopLayout`
- Favor tables, filters, summary cards, drill-down actions, and quick navigation
- Keep sidebar filters and status badges consistent across admin pages
- Expense and payment operations should feel audit-friendly and explicit

### Employee And Manager Mobile

- Use `MobileLayout`
- Keep lists card-first and actions touch-friendly
- Make receipt preview, OCR review, and approval history readable on narrow screens
- Keep status progression obvious on detail screens

## Required UX States

Every implemented screen should account for:

- initial loading
- empty data
- no results after filtering
- validation failure
- recoverable API error
- destructive action confirmation when relevant

## Frontend Do Nots

- No inline styles
- No CSS modules
- No direct DOM manipulation unless unavoidable for browser APIs
- No direct axios calls in components
- No undocumented route prefixes or status values
- No desktop-only assumptions on employee or manager flows
