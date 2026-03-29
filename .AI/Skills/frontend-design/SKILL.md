---
name: frontend-design
description: Repo-specific frontend design guidance for the OverClocked reimbursement system. Use when building or refining admin desktop pages, shared auth screens, or the mobile-first employee and manager flows. Keep all UI decisions aligned with `.AI/Context/Frontend_Reference.md`, `.AI/Context/MVP.md`, and `docs/implementation_plan.md`.
license: Complete terms in LICENSE.txt
---

# Reimbursement Frontend Design

## Read First

- `.AI/AGENT.md`
- `.AI/Context/Frontend_Reference.md`
- `.AI/Context/MVP.md`
- `docs/implementation_plan.md`

If this skill conflicts with those files, the canonical docs win.

## Product Direction

OverClocked has two frontend surfaces that should feel related but not identical:

- Admin and finance: Odoo-inspired operations UI with dense information, strong filters, fast table workflows, and clear status visibility
- Employee and manager: mobile-first flows with large touch targets, clear progression, camera or upload-first receipt capture, and obvious approval actions

The goal is not generic creativity. The goal is a polished, reliable reimbursement product that feels deliberate, operational, and easy to navigate under pressure.

## When To Use

- Building a new page, screen, modal, or shared component
- Refining layout, hierarchy, copy, or interaction quality
- Translating the implementation plan into concrete UI structure
- Normalizing desktop and mobile patterns so both route groups feel like one product

## Core Design Rules

### Shared Principles

- Prioritize clarity over novelty
- Use visible labels, helper text, and explicit section headings
- Every workflow needs loading, empty, success, and failure states
- Status must be understandable without relying on color alone
- Preserve the documented route contract and shared component names

### Admin Surface

- Favor scanability, fast actions, and table-first information density
- Use summary cards, sidebar filters, status badges, and drill-down tables deliberately
- Keep important actions visible without burying them in menus
- Make destructive and finance-sensitive actions explicit

### Mobile Surface

- Keep flows single-column and thumb-friendly
- Put primary actions near the bottom of the viewport when possible
- Break long forms into clear sections
- Make receipt preview, OCR review, and approval history easy to inspect on narrow screens

## Layout And Component Guidance

- Auth flows use `AuthLayout`
- Admin flows use `DesktopLayout`
- Employee and manager flows use `MobileLayout`
- Shared components should stay reusable by behavior, not by forcing identical styling on every surface
- When in doubt, prefer the component contracts already named in `.AI/Context/Frontend_Reference.md`

## Before You Ship UI

Check that the screen:

- matches the route and ownership defined in `docs/implementation_plan.md`
- uses the documented status vocabulary
- routes API access through `client/src/api/*.api.js`
- keeps global state in Zustand only when multiple routes truly share it
- works on desktop for admin pages and in Chrome mobile emulation for employee or manager flows

## Do Not Do

- Do not import a different design language that fights the Odoo-inspired admin direction
- Do not invent new route groups or status labels without updating the implementation plan
- Do not hide critical state behind hover-only or color-only cues
- Do not use inline styles, CSS modules, Redux, or app-wide Context API
