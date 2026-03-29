# Product Feature Validation Pipeline

## Purpose

Use this pipeline to validate whether all core product requirements are working end-to-end before demo, release, or merge.

Outcome of each run must be one of:

- GO: all critical checks pass
- NO-GO: any critical check fails

---

## Stage 0: Preconditions

1. Use a fresh branch and pull latest code.
2. Ensure Node.js and npm are installed.
3. Ensure Docker is running (for PostgreSQL).
4. Ensure these ports are free: 3000 (server), 5173 (client), 5432 (postgres).

---

## Stage 1: Build and Test Gate (Automated)

Run from repository root:

1. npm install --prefix server
2. npm install --prefix client
3. npm run build --prefix server
4. npm run test --prefix server
5. npm run lint --prefix client
6. npm run build --prefix client

Pass criteria:

- All commands exit with code 0.
- No failing backend tests.

---

## Stage 2: Environment Gate

### 2.1 Database

If container already exists:

1. docker start oc-reimbursement-postgres

If not, create it once:

1. docker run --name oc-reimbursement-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=reimbursement_db -p 5432:5432 -d postgres:16

### 2.2 Migrations

1. cd server
2. npm run migrate:deploy

### 2.3 Start services

Terminal A:

1. cd server
2. npm run dev

Terminal B:

1. cd client
2. npm run dev

### 2.4 Health checks

1. Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing | Select-Object -ExpandProperty Content
2. Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing | Select-Object -ExpandProperty StatusCode

Pass criteria:

- Health endpoint returns status ok.
- Client is reachable.

---

## Stage 3: Test Data Setup

Create a fresh tenant every run:

1. Sign up a new admin from /signup.
2. Create at least:
   - 1 manager
   - 1 finance approver
   - 2 employees
3. Assign reporting line Employee -> Manager.
4. Create categories and at least one department.

If UI for user creation is unavailable, use API fallback (POST /api/users) with admin token.

---

## Stage 4: Feature Validation Gates

Run gates in sequence and record evidence (screenshot or request/response JSON).

### G1. Auth and Company Bootstrap

Checks:

1. Signup creates company and admin.
2. Login works for admin.
3. Refresh and logout behave correctly.

Expected:

- Tokens are issued and protected routes work after login.

### G2. User and Role Management

Checks:

1. Admin can create employee and manager accounts.
2. Role assignment persists.
3. Manager relationship persists.

Expected:

- Users visible in directory with correct role and reporting.

### G3. Employee Expense Submission

Checks:

1. Employee creates expense with amount, category, date, description.
2. Employee can edit and submit expense.
3. Expense appears in employee history.

Expected:

- Status transitions Draft or To Submit -> Submitted.

### G4. Receipt OCR

Checks:

1. Upload receipt to an expense.
2. Trigger OCR.
3. Verify parsed fields (amount/date/vendor) are returned.

Expected:

- OCR result is stored and visible on expense details.

### G5. Currency and Conversion

Checks:

1. Submit expense in non-company currency.
2. Verify converted amount and exchange rate are populated.
3. Verify manager sees normalized amount during approval.

Expected:

- Converted amount is present for approval flow.

### G6. Sequential Approval Flow

Checks:

1. Submit expense requiring multiple approvers.
2. Step 1 approver acts.
3. Verify request appears for next approver only after prior action.

Expected:

- Ordered, stepwise approval progression.

### G7. Conditional Approval Rules

Create and validate these rule types:

1. Percentage rule (example: 60%).
2. Specific approver (VIP/CFO) immediate approval.
3. Hybrid (percentage OR VIP).

Expected:

- Outcomes match rule configuration.

### G8. Manager Actions

Checks:

1. Manager sees pending queue.
2. Approve with comment.
3. Reject with comment.

Expected:

- Employee sees final status and timeline updates.

### G9. Admin Oversight

Checks:

1. Admin views expenses/reports pages.
2. Notification feed updates.
3. Comment thread works on an expense.

Expected:

- Admin visibility across company records works.

### G10. Payments Flow

Checks:

1. Create payment order for approved expense.
2. Verify payment callback/signature handling path.

Expected:

- Payment state transitions are captured correctly.

---

## Stage 5: Negative and Security Checks

1. Employee cannot access admin-only endpoints.
2. Non-manager cannot call approve/reject endpoints.
3. Invalid login returns authentication error.
4. Invalid payload returns validation errors (422/400 path).
5. Expired or invalid token rejects protected calls.

Pass criteria:

- RBAC and validation protections hold for all negative cases.

---

## Stage 6: Compatibility and Integration Checks

1. Country to currency lookup endpoint works.
2. Exchange-rate conversion path works.
3. SMTP behavior is validated:
   - If SMTP configured: credentials email arrives.
   - If SMTP missing: creation still succeeds and failure is surfaced to admin process.

---

## Stage 7: Evidence and Signoff

Use this table for every run:

| Gate | Result | Evidence | Notes |
|---|---|---|---|
| G1 Auth and Bootstrap | PASS/FAIL | link/file | |
| G2 User and Role Management | PASS/FAIL | link/file | |
| G3 Expense Submission | PASS/FAIL | link/file | |
| G4 OCR | PASS/FAIL | link/file | |
| G5 Currency Conversion | PASS/FAIL | link/file | |
| G6 Sequential Approval | PASS/FAIL | link/file | |
| G7 Conditional Rules | PASS/FAIL | link/file | |
| G8 Manager Actions | PASS/FAIL | link/file | |
| G9 Admin Oversight | PASS/FAIL | link/file | |
| G10 Payments | PASS/FAIL | link/file | |
| Security/Negative | PASS/FAIL | link/file | |

Release rule:

- GO only if all critical gates pass: G1, G2, G3, G6, G7, Security/Negative.
- NO-GO if any critical gate fails.

---

## Suggested Run Cadence

1. Quick pipeline (daily): Stages 1, 2, G1, G3, G6, Security.
2. Full pipeline (before demo/release): Stages 1 through 7.
