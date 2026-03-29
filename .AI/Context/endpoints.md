# Endpoints and Entrypoints Inventory

Last updated: 2026-03-29

## Scope

This document is the live source of truth for:

- App entrypoints (frontend and backend)
- Frontend route entrypoints and role gates
- Backend API route groups and concrete HTTP routes
- Frontend API modules and the backend routes they call

## Role Guard Legend

- Public: no authentication required
- Authenticated: valid access token required
- Admin: SUPER_ADMIN or ADMIN
- Finance: SUPER_ADMIN or ADMIN or FINANCE
- Manager: SUPER_ADMIN or ADMIN or FINANCE or MANAGER
- Employee+: SUPER_ADMIN or ADMIN or FINANCE or MANAGER or EMPLOYEE

## Runtime Entrypoints

### Frontend

- Bootstrap: `client/src/main.jsx`
- Route tree root: `client/src/App.jsx`
- PWA registration: service worker registration in `client/src/main.jsx`
- Manifest file: `client/public/manifest.json`
- Service worker script: `client/public/sw.js`

### Backend

- Server bootstrap: `server/src/index.ts`
- Health endpoint: `GET /health`
- Static uploads endpoint: `GET /uploads/*`

## Frontend Route Entrypoints (React Router)

Source: `client/src/App.jsx`

| Route | Access | Surface |
|------|--------|---------|
| `/` | Guest only | Redirect to login |
| `/login` | Guest only | Auth page |
| `/signup` | Guest only | Auth page |
| `/admin/dashboard` | SUPER_ADMIN, ADMIN, FINANCE | Admin dashboard |
| `/admin/employees` | SUPER_ADMIN, ADMIN, FINANCE | Employee management |
| `/admin/expenses` | SUPER_ADMIN, ADMIN, FINANCE | Expenses workspace |
| `/admin/reports` | SUPER_ADMIN, ADMIN, FINANCE | Reports workspace |
| `/admin/hierarchy` | SUPER_ADMIN, ADMIN, FINANCE | Hierarchy view |
| `/admin/categories` | SUPER_ADMIN, ADMIN, FINANCE | Category management |
| `/admin/payments` | SUPER_ADMIN, ADMIN, FINANCE | Payments queue |
| `/admin/approval-rules` | SUPER_ADMIN, ADMIN | Approval rules config |
| `/admin/import` | SUPER_ADMIN, ADMIN | CSV import |
| `/expenses` | Employee+ | Mobile employee list |
| `/expenses/new` | Employee+ | Mobile draft create/edit |
| `/expenses/:id` | Employee+ | Mobile expense detail |
| `/scan` | Employee+ | Mobile OCR flow |
| `/profile` | Employee+ | Mobile profile |
| `/approvals` | Manager | Manager approval queue |
| `/approvals/:id` | Manager | Manager approval detail |
| `/team-expenses` | Manager | Manager team feed |

## Backend API Mount Points

Source: `server/src/index.ts`

- `/api/auth`
- `/api/companies`
- `/api/users`
- `/api/departments`
- `/api/categories`
- `/api/expenses`
- `/api/receipts`
- `/api/approvals`
- `/api/approval-rules`
- `/api/payments`
- `/api/notifications`
- `/api/comments`

## Backend HTTP Routes

### Auth (`/api/auth`)

Source: `server/src/routes/auth.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| POST | `/api/auth/refresh` | Public |
| GET | `/api/auth/me` | Authenticated |
| POST | `/api/auth/logout` | Authenticated |
| POST | `/api/auth/change-password` | Authenticated |

### Companies (`/api/companies`)

Source: `server/src/routes/company.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/companies` | Authenticated |
| GET | `/api/companies/currencies` | Authenticated |
| PUT | `/api/companies` | Admin |
| PUT | `/api/companies/settings` | Admin |
| GET | `/api/companies/stats` | Admin |

### Users (`/api/users`)

Source: `server/src/routes/user.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/users` | Authenticated |
| GET | `/api/users/hierarchy` | Authenticated |
| GET | `/api/users/import-template` | Admin |
| POST | `/api/users/import/preview` | Admin (multipart file) |
| POST | `/api/users/import/finalize` | Admin |
| POST | `/api/users/import` | Admin (multipart file) |
| GET | `/api/users/:id` | Authenticated |
| POST | `/api/users` | Admin |
| PUT | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |

### Departments (`/api/departments`)

Source: `server/src/routes/department.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/departments` | Authenticated |
| GET | `/api/departments/hierarchy` | Authenticated |
| GET | `/api/departments/:id` | Authenticated |
| POST | `/api/departments` | Admin |
| PUT | `/api/departments/:id` | Admin |
| DELETE | `/api/departments/:id` | Admin |

### Categories (`/api/categories`)

Source: `server/src/routes/category.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/categories` | Authenticated |
| GET | `/api/categories/hierarchy` | Authenticated |
| GET | `/api/categories/:id` | Authenticated |
| POST | `/api/categories` | Admin |
| PUT | `/api/categories/:id` | Admin |
| DELETE | `/api/categories/:id` | Admin |

### Expenses (`/api/expenses`)

Source: `server/src/routes/expense.routes.ts`

All routes in this group require Employee+.

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/expenses` | Employee+ |
| GET | `/api/expenses/:id` | Employee+ |
| POST | `/api/expenses` | Employee+ |
| PUT | `/api/expenses/:id` | Employee+ |
| DELETE | `/api/expenses/:id` | Employee+ |
| POST | `/api/expenses/:id/submit` | Employee+ |
| POST | `/api/expenses/:id/lines` | Employee+ |
| PUT | `/api/expenses/:id/lines/:lineId` | Employee+ |
| DELETE | `/api/expenses/:id/lines/:lineId` | Employee+ |

### Receipts (`/api/receipts`)

Source: `server/src/routes/receipt.routes.ts`

All routes in this group require Employee+.

| Method | Route | Guard |
|-------|-------|-------|
| POST | `/api/receipts/expense/:expenseId` | Employee+ (multipart file) |
| GET | `/api/receipts/:id` | Employee+ |
| GET | `/api/receipts/:id/url` | Employee+ |
| DELETE | `/api/receipts/:id` | Employee+ |
| POST | `/api/receipts/:id/ocr` | Employee+ |

### Approvals (`/api/approvals`)

Source: `server/src/routes/approval.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/approvals/pending` | Manager |
| POST | `/api/approvals/:expenseId/approve` | Manager |
| POST | `/api/approvals/:expenseId/reject` | Manager |

### Approval Rules (`/api/approval-rules`)

Source: `server/src/routes/approval.routes.ts`

All routes in this group require Admin.

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/approval-rules` | Admin |
| POST | `/api/approval-rules` | Admin |
| PUT | `/api/approval-rules/:id` | Admin |
| DELETE | `/api/approval-rules/:id` | Admin (deactivate) |

### Payments (`/api/payments`)

Source: `server/src/routes/payment.routes.ts`

All routes in this group require Finance.

| Method | Route | Guard |
|-------|-------|-------|
| POST | `/api/payments/order` | Finance |
| POST | `/api/payments/verify` | Finance |

### Notifications (`/api/notifications`)

Source: `server/src/routes/notification.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/notifications` | Authenticated |
| PATCH | `/api/notifications/read-all` | Authenticated |
| PATCH | `/api/notifications/:id/read` | Authenticated |

### Comments (`/api/comments`)

Source: `server/src/routes/comment.routes.ts`

| Method | Route | Guard |
|-------|-------|-------|
| GET | `/api/comments/expense/:expenseId` | Authenticated |
| POST | `/api/comments/expense/:expenseId` | Authenticated |
| DELETE | `/api/comments/:commentId` | Authenticated |

## Frontend API Modules to Backend Route Mapping

### Core auth and transport

- `client/src/api/auth.api.js`
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- `client/src/api/http.js`
  - Axios instance and token refresh retry logic

### Admin and shared data

- `client/src/api/dashboard.api.js`
  - Uses expenses, users, notifications aggregations
- `client/src/api/users.api.js`
  - `GET /api/users`
  - `GET /api/users/import-template`
  - `POST /api/users/import/preview`
  - `POST /api/users/import/finalize`
  - `POST /api/users/import`
- `client/src/api/company.api.js`
  - `GET /api/users/hierarchy`
  - `GET /api/companies/stats`
- `client/src/api/categories.api.js`
  - `GET /api/categories`
- `client/src/api/expenses.api.js`
  - `GET /api/expenses`
- `client/src/api/reports.api.js`
  - Uses expenses aggregation
- `client/src/api/approval-rules.api.js`
  - `GET /api/approval-rules`
  - `POST /api/approval-rules`
  - `PUT /api/approval-rules/:id`
  - `DELETE /api/approval-rules/:id`
- `client/src/api/payments.api.js`
  - `POST /api/payments/order`
  - `POST /api/payments/verify`
- `client/src/api/notifications.api.js`
  - `GET /api/notifications`

### Employee and manager mobile

- `client/src/api/expense.api.js`
  - `GET /api/expenses`
  - `GET /api/expenses/:id`
  - `POST /api/expenses`
  - `PUT /api/expenses/:id`
  - `DELETE /api/expenses/:id`
  - `POST /api/expenses/:id/submit`
  - `POST /api/expenses/:id/lines`
  - `PUT /api/expenses/:id/lines/:lineId`
  - `DELETE /api/expenses/:id/lines/:lineId`
  - `POST /api/receipts/expense/:expenseId`
  - `POST /api/receipts/:id/ocr`
  - `GET /api/receipts/:id/url`
  - `GET /api/companies/currencies`
- `client/src/api/approval.api.js`
  - `GET /api/approvals/pending`
  - `POST /api/approvals/:expenseId/approve`
  - `POST /api/approvals/:expenseId/reject`
- `client/src/api/comment.api.js`
  - `GET /api/comments/expense/:expenseId`
  - `POST /api/comments/expense/:expenseId`

## Notes for Future Changes

- Any route change in `server/src/routes/*.ts` must update this file in the same session.
- Any frontend role gate change in `client/src/App.jsx` must update this file.
- If a frontend API module starts calling a new endpoint, add it to the mapping section.
