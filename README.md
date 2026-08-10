# The Wild Oasis Admin

React/Vite operations application for cabins, bookings, check-in/out, settings,
and dashboard reporting. This Worktree is the isolated development branch for
the AI hospitality platform; it must not share write credentials with a
production Supabase project.

## Local setup

Requirements: Node.js 20+ and npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Configure these browser-safe Vite variables in `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

`VITE_SUPABASE_ANON_KEY` is accepted only for compatibility with an existing
legacy project. Never put a secret/service-role key in a `VITE_` variable.

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
