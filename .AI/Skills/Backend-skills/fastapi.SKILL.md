---
name: express-api-development
description: Repo-specific backend API guidance for OverClocked. This file replaces the legacy FastAPI import with the approved Express + TypeScript + Zod + Prisma patterns used by this repository.
---

# Express API Development

## Important Note

This file keeps its legacy path for compatibility, but this repository does not use FastAPI.

Use:

- Express for routing
- TypeScript strict mode for backend code
- Zod for request validation
- Prisma for data access

Read `.AI/AGENT.md`, `.AI/Context/Techstack.md`, `.AI/Context/Architecture.md`, and `docs/implementation_plan.md` before using this guide.

## App Structure

```text
server/src/
|-- config/
|-- controllers/
|-- middleware/
|-- routes/
|-- services/
|-- utils/
`-- validators/
```

## Implementation Rules

- Keep routes thin
- Keep controllers focused on HTTP translation
- Keep business logic in services
- Keep request and response validation in Zod schemas
- Funnel failures to centralized Express error handling

## Middleware Order

Typical route chain:

1. auth middleware
2. role or ownership checks
3. request validation
4. controller
5. centralized error handler

## Auth Rules

- Access token stays in memory on the client
- Refresh token stays in an `httpOnly` cookie
- Do not invent alternate auth storage patterns

## Contract Rules

- Route prefixes must match `docs/implementation_plan.md`
- Status values must match the shared vocabulary exactly
- Any schema, dependency, or interface change requires updating the canonical docs

## Do Not Do

- Do not apply Python-specific FastAPI patterns here
- Do not move validation into ad hoc controller code
- Do not call Prisma directly from routes
- Do not add unapproved stack changes without updating `.AI/Context/Techstack.md`
