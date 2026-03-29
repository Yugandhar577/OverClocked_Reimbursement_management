# Tech Stack

## Status

The repo now has a scaffolded `client/` admin frontend in place. The backend is still pending, so the current frontend uses contract-aligned mock APIs while staying within the approved stack below.

## Frontend

- Framework: React 18
- Build tool: Vite
- Styling: Tailwind CSS v3
- Routing: React Router v6
- State management: Zustand
- Motion: Framer Motion for page and card transitions
- Primitive UI layer: Radix UI primitives wrapped through local shadcn-style components in `client/src/components/ui/*.jsx`
- Iconography: `lucide-react`
- Typography: `@fontsource/inter` and `@fontsource/public-sans`
- HTTP layer: Axios through `client/src/api/*.api.js`, with `resolveMock()` used until backend routes are live
- Mobile capability: PWA assets for the employee and manager surface

## Backend

- Runtime: Node.js LTS
- Framework: Express.js
- Language: TypeScript with strict mode
- ORM: Prisma
- Validation: Zod
- File uploads: Multer
- Authentication: `jsonwebtoken` plus `bcrypt`
- Email: Nodemailer with Gmail SMTP during development and demo prep

## Database and Infrastructure

- Primary database: PostgreSQL
- Migration strategy: Prisma Migrate
- Local development storage: local `server/uploads/`
- Allowed hosting approaches: Railway, Render, Docker-hosted services, or equivalent raw infrastructure
- Disallowed shortcuts: Firebase, Supabase, MongoDB, and static JSON as production data storage
- Unapproved stack additions such as FastAPI, Redis, Celery, pgvector, or Python worker infrastructure must not be introduced unless this file and `docs/implementation_plan.md` are updated first

## External Services

| Service | Purpose |
|---------|---------|
| RestCountries API | Country list and company base-currency derivation |
| ExchangeRate API | Live FX rates and base-currency conversion |
| Mindee API | Primary OCR pipeline for structured receipt extraction |
| OCR.space API | OCR fallback when Mindee is unavailable or exhausted |
| Razorpay | Reimbursement payout initiation and verification |

## Development Tooling

- Package manager: npm
- Linting: ESLint
- Formatting: Prettier
- CSS tooling: `tailwindcss`, `postcss`, and `autoprefixer`
- API verification: Thunder Client or Postman
- Browser verification: Chrome DevTools responsive mode
- Source control: GitHub

## Non-Negotiable Conventions

- Tailwind utilities only on the frontend; no CSS modules and no inline style objects
- API access must go through the API client layer, not ad hoc axios calls inside components
- Access tokens stay in memory; refresh tokens stay in `httpOnly` cookies
- Money values are stored as `DECIMAL(12,2)` in PostgreSQL
- OCR results are suggestions only and must be reviewable before submission
