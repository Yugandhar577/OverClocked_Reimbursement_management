---
name: redis-guardrails
description: Guardrail document for Redis in the OverClocked repository. Redis is not part of the currently approved stack, so this file explains when it is out of bounds and what documentation must be updated before anyone introduces it.
---

# Redis Guardrails

## Current Repo Rule

Redis is not part of the approved OverClocked stack today.

Do not add Redis-based caching, queues, pub/sub, locks, or worker orchestration unless the team first updates:

- `.AI/Context/Techstack.md`
- `.AI/Context/Architecture.md`
- `docs/implementation_plan.md`
- the relevant `.AI/Tasks/Dev*.md` changelog

## Default Alternatives In Scope

- PostgreSQL persistence through Prisma
- Express services for synchronous workflow logic
- `notifications` and `audit_log` tables for workflow visibility
- Nodemailer for email delivery
- browser-side loading states instead of speculative cache layers

## When Redis Might Be Justified Later

- background notification fan-out becomes too slow for request-time execution
- OCR job orchestration needs durable async processing
- rate limiting needs shared server-side counters
- temporary workflow locks are needed to protect payment or approval actions

## Adoption Checklist

Before proposing Redis, document:

1. the exact workflow bottleneck
2. why PostgreSQL or existing services are not sufficient
3. the new deployment and operations burden
4. failure behavior if Redis is unavailable
5. the changelog entries and canonical doc updates required

## Do Not Do

- Do not add Redis just because it is familiar
- Do not hide undocumented async behavior behind a cache or queue
- Do not let Redis become a shadow source of truth for reimbursement state
