# DevSK — Pillar 2: Approval Engine + Payments

## Ownership
**Approval workflow engine, payment processing, notifications, and audit logging.**

## Scope
- Approval engine service (`approval.engine.ts`) — the brain of the system
  - Sequential multi-step approval chain
  - Percentage-based approval (e.g. 60% of approvers)
  - VIP auto-approve logic (can_auto_approve flag)
  - Required approver veto (is_required flag)
  - Auto-escalation when expense exceeds manager's limit
  - Department-scoped manager resolution
  - Self-approval prevention
- Approval rules CRUD API (admin creates/updates rules)
- Approval actions API (manager approve/reject with comments)
- Approval steps tracking (instance log per expense)
- Duplicate expense detection service
- Razorpay payment integration
  - Create order
  - Verify payment signature
  - Update payment_status on expense
- Notification service (in-app notifications for all events)
- Audit log service (immutable event logging with old/new values)
- Comment service (threaded discussions on expenses)

## Key Files
```
server/src/services/approval.engine.ts
server/src/routes/approval.routes.ts
server/src/controllers/approval.controller.ts
server/src/routes/payment.routes.ts
server/src/controllers/payment.controller.ts
server/src/services/payment.service.ts
server/src/routes/notification.routes.ts
server/src/controllers/notification.controller.ts
server/src/services/notification.service.ts
server/src/routes/comment.routes.ts
server/src/controllers/comment.controller.ts
server/src/services/comment.service.ts
server/src/services/audit.service.ts
server/src/validators/approval.validator.ts
server/src/validators/payment.validator.ts
```

## Dependencies
- DevY's Prisma schema (tables: approval_rules, approval_rule_approvers, approval_steps, notifications, audit_log, expense_comments)
- DevY's user service (for hierarchy lookups)
- DevY's expense service (for status updates)

## Blocked By
- DevY (schema + base APIs must exist)

## Blocks
- DevSM (admin approval rule builder UI needs API)
- DevP (approval queue + comment thread needs API)

---

## Changelog

> **Format**: Each entry records date, what was done, files touched.
> AI agents: append to this section after every code session.

| Date | Action | Files Changed | Notes |
|------|--------|---------------|-------|
| | | | |
