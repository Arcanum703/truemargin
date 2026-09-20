# TrueMargin

TrueMargin turns Etsy Orders and Order Items exports into a small, understandable profit workspace.
It shows revenue, every marketplace fee, shipping, material cost, labor, and net margin by product.
Import the CSVs Etsy already provides; there are no accounts or 12-tab spreadsheets.
Products have editable cost and stock fields, with alerts for missing costs, low margins, and reorder points.
The demo shop loads 200 realistic orders and 15 products from `public/demo/`.
CSV parsing uses PapaParse with case-insensitive header matching and missing-column tolerance.
If Orders includes Card Processing Fees, TrueMargin uses that actual value; otherwise it computes the fee.
Offsite ads can be flagged per order or estimated at a settings-level fallback when no rows are flagged.

## Run locally

```bash
cp .env.example .env
npm install
npm run db:push
npm run seed
npm run dev -- -p 3003
```

Visit `http://localhost:3003`.

## Keys

- `DATABASE_URL`: required SQLite path; no external service is needed.
- `RESEND_API_KEY`: not required in this v1; included for shared convention compatibility.

## Checks

```bash
npm run lint
npm run test
npm run build
```

CSV import is local and synchronous for the MVP. Etsy Payments/Deposits exports can be mapped later; when actual processing fee columns are missing, the configured fee model is used.
