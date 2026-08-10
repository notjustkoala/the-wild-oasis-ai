# Feature 00 quality baseline

This baseline covers both isolated AI worktrees. It is a reproducible engineering
reference, not a production performance claim.

## Measurement environment

- Recorded: 2026-08-05
- OS: Microsoft Windows NT 10.0.26200.0
- Node.js: `v20.19.6`
- npm: `10.8.2`
- Admin worktree: `D:\working\code\17-the-wild-oasis-ai`
- Guest website worktree: `D:\working\code\21-the-wild-oasis-website-ai`

Run the complete gate independently in each worktree:

```powershell
npm run check
git diff --check
```

`npm run check` expands to lint, incremental TypeScript checking, offline
Vitest tests, and a production build. Tests use mocks or pure dependencies and
must not connect to Supabase.

## Admin application

The pre-change implementation produced an approximately `917 KB` entry bundle
(the value captured in the Feature 00 design specification). This was an
approximate historical measurement, not reproduced during this run.

The current production build uses page-level `React.lazy` boundaries and
produces 29 JavaScript chunks. The initial `index` asset is now `406.52 kB`
(`124.03 kB` gzip), approximately 56% below the historical approximate entry
measurement. This comparison is specifically entry-to-entry; the lazy route
chunks still contribute when their pages are visited.

Final `npm run check` result: exit `0`.

- ESLint: 0 warnings and 0 errors.
- TypeScript: `tsc --noEmit` passed.
- Vitest: 3 files and 3 tests passed. Test stderr contained only two React
  Router v7 future-flag notices.
- Vite: 1,805 modules transformed; build completed in 7.99 seconds.
- Largest emitted JavaScript assets: `Dashboard-7349ae44.js` at `421.65 kB`
  (`114.53 kB` gzip) and `index-f4f6e3a3.js` at `406.52 kB`
  (`124.03 kB` gzip).
- Current emitted JavaScript total: 922,177 raw bytes across 29 chunks. This
  aggregate is not directly comparable to the old single-entry estimate.

## Guest website

The guest build is dynamic for Supabase-backed pages and uses a committed local
Geist font, so `next build` does not need Google Fonts or a live Supabase
connection.

Final `npm run check` result: exit `0`.

- ESLint: 0 errors and 4 pre-existing `@next/next/no-img-element` warnings in
  `Navigation.js`, `ReservationForm.js`, `SignInButton.js`, and
  `UpdateProfileForm.js`.
- TypeScript: `tsc --noEmit` passed.
- Vitest: 8 files and 39 tests passed: base-seed generator 8, demo-data
  generator 6, privileged Supabase client 4, booking domain 4, booking service
  13, price summary 1, availability data 1, and date selector 2.
- Next.js: production compilation passed and static generation completed 12/12.

The exact first-load JavaScript sizes from that build were:

| Route | First-load JS |
| --- | ---: |
| `/` | 102 kB |
| `/about` | 93.1 kB |
| `/account` | 87.3 kB |
| `/account/profile` | 88.3 kB |
| `/account/reservations` | 112 kB |
| `/account/reservations/edit/[bookingId]` | 87.5 kB |
| `/cabins` | 109 kB |
| `/cabins/[cabinId]` | 124 kB |
| `/cabins/thankyou` | 96 kB |
| `/login` | 87.3 kB |

Shared first-load JavaScript was `87.1 kB`; middleware was `110 kB`.

## Lighthouse status

Lighthouse was **not sampled** for this baseline. The repository has no local
Lighthouse executable; `npx --no-install lighthouse --version` failed because
`lighthouse@12.8.2` is not installed. No package was downloaded. In addition,
representative authenticated and data-backed pages require a manually
configured development Supabase project, which is deliberately outside the
automated Feature 00 gate.

During human verification, configure only the isolated development Supabase
credentials, start each production build locally, and run:

```powershell
# Admin terminal
npm run build
npm run preview -- --host 127.0.0.1 --port 4173

# Guest website terminal
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000

# After installing Lighthouse intentionally in a separate tooling environment
lighthouse http://127.0.0.1:4173/login --output=html --output-path=./lighthouse-admin.html --chrome-flags="--headless"
lighthouse http://127.0.0.1:3000/ --output=html --output-path=./lighthouse-guest.html --chrome-flags="--headless"
```

For each app, record Performance, Accessibility, Best Practices, and SEO. Also
sample one authenticated business page after login; the public/login scores
alone do not represent the reservation or operations workflow.

## Interpretation and follow-up

- Compare future bundles and warnings against this file, using the same Node/npm
  versions and commands.
- Lighthouse values are intentionally absent rather than estimated.
- Manual validation still covers clean install, login, reservation, check-in,
  checkout, and visual inspection of the 12-month demo-data distribution.
- The reservation flow revalidates price, cabin capacity, the global guest
  limit, settings, ownership, and availability on the server. Its immediate
  conflict check provides a friendly application error for normal contention;
  the database `bookings_no_overlapping_active_stays` GiST exclusion constraint
  applies `[startDate, endDate)` semantics and supplies final consistency when
  concurrent requests race between that check and the insert.
