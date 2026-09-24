# TrueMargin

TrueMargin turns Etsy Orders and Order Items exports into a small, understandable profit workspace.
It shows revenue, every marketplace fee, shipping, material cost, labor, and net margin by product.
Import the CSVs Etsy already provides; no 12-tab spreadsheets.
Products have editable cost and stock fields, with alerts for missing costs, low margins, and reorder points.
The demo shop loads 200 realistic orders and 15 products from `public/demo/`.
CSV parsing uses PapaParse with case-insensitive header matching and missing-column tolerance.
If Orders includes Card Processing Fees, TrueMargin uses that actual value; otherwise it computes the fee.
Offsite ads can be flagged per order or estimated at a settings-level fallback when no rows are flagged.

## Run locally

Requires Node 22 and a Postgres 16 database (Docker is the quickest way):

```bash
docker run -d --name tm-pg -e POSTGRES_PASSWORD=tm -e POSTGRES_DB=truemargin -p 5432:5432 postgres:16
cp .env.example .env            # then set SESSION_SECRET (openssl rand -base64 48)
npm install
npm run db:migrate:dev          # applies prisma/migrations to the local database
npm run seed                    # demo user demo@truemargin.local / demo-passphrase-123
npm run dev                     # http://localhost:3003
```

Without `RESEND_API_KEY`, verification and reset emails are printed to the server log and new sign-ups are auto-verified.

## Environment

See `.env.example` for every variable. Required in production: `DATABASE_URL`, `APP_URL` (https), `SESSION_SECRET` (>= 32 chars).
Optional: `RESEND_API_KEY` + `EMAIL_FROM` (email), `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `STRIPE_PRICE_ID` (paid plans; optional `STRIPE_PRICE_ID_YEARLY` for an annual option), `TRIAL_DAYS`, `DEMO_MODE`.

## Deploy (Vercel)

1. Create a Postgres database (Neon, Supabase, or Vercel Postgres) and set `DATABASE_URL`.
2. Set `APP_URL`, `SESSION_SECRET`, and the email/Stripe variables in the Vercel project.
3. Build command: `npm run build` (runs `prisma generate`). Add `npm run db:migrate` to the build command or run it from CI before deploying.
4. Point a Stripe webhook at `https://<your-domain>/api/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`.
5. Health check: `GET /api/health`.

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run audit:prod
```

CI (`.github/workflows/ci.yml`) runs all of the above against a Postgres service.

## Security model

Email/password accounts (Argon2id), HTTP-only session cookies with hashed tokens, per-workspace authorisation on every query, rate limiting and login lockout, Zod input validation, bounded CSV uploads, formula-safe CSV exports, strict CSP and security headers, signature-verified idempotent Stripe webhooks, and an audit log. Details for users are on `/security`.
