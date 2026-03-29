# Tech Stack

## Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios (with JWT interceptor)
- **PWA**: manifest.json + service worker for mobile

## Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Validation**: Zod
- **File Upload**: Multer
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Email**: Nodemailer (Gmail SMTP)

## Database
- **RDBMS**: PostgreSQL
- **Hosting**: Railway / Render / Docker (local) — NO BaaS per hackathon rules
- **Migrations**: Prisma Migrate

## External APIs
| API | URL | Purpose |
|-----|-----|---------|
| RestCountries | `restcountries.com/v3.1/all?fields=name,currencies` | Country → currency on signup |
| ExchangeRate | `api.exchangerate-api.com/v4/latest/{CURRENCY}` | Live FX rates |
| Mindee | `api.mindee.net/v1/products/mindee/expense_receipts/v5/predict` | Receipt OCR (primary) |
| OCR.space | `api.ocr.space/parse/image` | Receipt OCR (fallback) |
| Razorpay | Razorpay Node SDK | Reimbursement payouts |

## Dev Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **API Testing**: Thunder Client / Postman
- **Git**: GitHub (Yugandhar577/OverClocked_Reimbursement_management)

## Hackathon Constraints
- ❌ No Firebase, Supabase, MongoDB (per guidelines)
- ❌ No static JSON for production data
- ✅ PostgreSQL with proper relational design
- ✅ Build backend from scratch
- ✅ Real-time data, proper validation, error handling
