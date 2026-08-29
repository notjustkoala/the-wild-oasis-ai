# The Wild Oasis Admin

React/Vite operations application for cabins, bookings, check-in/out, settings,
and dashboard reporting. This Worktree is the isolated development branch for
the AI hospitality platform; it must not share write credentials with a
production Supabase project.

## Local setup

Requirements: Node.js 22+ and npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Configure these browser-safe Vite variables in `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_AI_BFF_URL` for the customer Next.js server (development defaults to
  `http://127.0.0.1:3000`)

`VITE_SUPABASE_ANON_KEY` is accepted only for compatibility with an existing
legacy project. Never put a secret/service-role key in a `VITE_` variable.
The admin browser never receives the Gemini key. It sends the current Supabase
access token to the BFF, where the employee is revalidated before any insight
is read, generated, or reviewed.

## AI risk Briefing

Booking details keep the original observation visible beside cached AI
summary, text severity, risk tags, actions, and confidence. Employees explicitly
start or retry generation, can force reanalysis, and can record a
correct/partially-correct/incorrect verdict with optional corrected tags and
notes. Feedback is stored alongside the original AI result for later evals.

Today's activity performs one Supabase relationship query for already-cached
insights. It never starts generation and does not issue one BFF request per
row. A failed AI request leaves check-in, checkout, and all booking operations
unchanged.

## Operations Copilot

The floating **Operations Copilot** drawer sends the employee's Supabase access
token and a natural-language question to the customer application's
`/api/ai/admin` BFF. Results are rendered as KPI cards, cabin performance bars,
booking lists, and a tool timeline. The server exposes only five fixed,
bounded read tools and never sends guest names, contact details, raw
observations, or complete booking rows to Gemini.

Booking KPIs match the dashboard reporting basis: the range uses `created_at`,
cancelled bookings remain included, and `totalRevenue` sums `totalPrice` only
because that field already includes extras. `extrasPrice` is reported
separately as `extrasRevenue` and is not added again. Each result also exposes
compact expandable `sourceIds` evidence.

The sole write action drafts an internal booking note. The drawer shows the
exact booking and note text and requires an explicit employee approval or
rejection. Rejected drafts are not retried, and the server's idempotent audit
transaction can update only the staff-only internal note field. Set
`AI_ADMIN_ORIGIN` on the customer server for a deployed admin origin; local
development permits the Vite origins described above.

For the approval-chain acceptance check, send one explicit booking command in a
single turn, for example: `Draft an internal note for booking 123: Follow up on
payment`. Verify that the drawer shows the exact booking and note, reject once
to confirm no booking field changes, then repeat and approve to confirm only
`bookings.internalNote` changes.

Feature 03 is applied to the dedicated Dev Supabase project; the original
project and database were not modified. The customer worktree's append-only
`20260825000100_optimize_ai_operations_advisors.sql` migration adds the missing
foreign-key indexes, normalizes Feature 03 RLS expressions, and preserves the
constrained approval RPC contract.

## Quality commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

`check` runs lint, the incremental TypeScript boundary, offline Vitest tests,
and a production build. ESLint is scoped to `src/`; generated `dist/` and
coverage output are excluded. Stable JSX remains JavaScript, while new `.ts`
and `.tsx` modules are checked by `tsc`.

Page components are loaded with `React.lazy` so the initial bundle does not
contain every operations screen. Tests mock Supabase and must never contact a
remote database.

The versioned lint, test, build, bundle, and Lighthouse baseline for both
applications is recorded in [docs/quality-baseline.md](docs/quality-baseline.md).
