# SleepPillow

Student product concept site: a landing page with waitlist signup, an interactive app prototype in a phone frame, and a priced, nonbinding reservation page.

| Route | What it is |
| --- | --- |
| `/` | Landing page and waitlist form |
| `/app` | Interactive app prototype (Tonight, Routine, Sounds, Device). Hardware is simulated. |
| `/reserve` | Proposed price and nonbinding reservation form. No payment is collected. |

Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000
```

Without a database, development mode saves submissions to `.data/sleeppillow-dev.json`, which git ignores. A notice under each successful submission tells you this.

## Configure storage (required before launch)

Set a PostgreSQL connection string. Any host works, for example Neon, Supabase, Vercel Postgres, or Railway.

```bash
cp .env.example .env.local
# edit DATABASE_URL=postgres://user:password@host:5432/db?sslmode=require
```

The tables (`waitlist_signups`, `reservations`, `experiment_events`) are created automatically on the first request. To create them yourself, run [`db/schema.sql`](db/schema.sql).

**In production, if `DATABASE_URL` is not set, the forms show an error and nothing is reported as saved.** The API returns `503`, and the server logs an error. `ALLOW_FILE_STORAGE=true` turns file storage back on, but only use it for local `next start` testing: serverless filesystems are ephemeral.

Privacy: emails exist only in the database. They are never sent to the browser, logged, or included in experiment events.

## Change the price

Edit **`src/config/pricing.ts`**:

```ts
export const RESERVATION_PRICE = {
  amountCents: 14900,          // $149
  currency: "USD",
  version: "dev-placeholder-v1",
  isPlaceholder: true,
};
```

> ⚠️ **$149 is a development placeholder.** No price has been decided. Before launch, set the real price, set `isPlaceholder: false`, and give it a new `version` such as `"launch-v1"`.

Each reservation stores the `price_cents`, `currency`, and `price_version` the person saw, plus `created_at`. If you later change the price, use a new `version` so the two price arms can be counted separately. If the price changes while someone has the page open, the server refuses their submission and asks them to reload. A reservation is never recorded at a price the person didn't see.

## Experiment tracking

| Event | Recorded when |
| --- | --- |
| `landing_visit` | `/` is opened (once per browser tab session) |
| `app_demo_start` | First interaction inside the phone on `/app` (once per session) |
| `reserve_visit` | `/reserve` is opened (once per session) |
| `waitlist_signup` | **Server-side, only after** the signup row is saved |
| `reservation_created` | **Server-side, only after** the reservation row is saved |

- The browser can only send the three visit and start events. `/api/events` rejects conversion events, so clicking a button never counts as a signup or reservation.
- Events carry a random anonymous `visitor_id`, which lets you build funnels without personal data.
- What people do inside the demo (timer, settings, sounds) stays in their browser's `localStorage` and is never sent to the server. It can't mix with experiment results.

**Read results.** Set `ADMIN_TOKEN` and then run:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://your-site/api/stats
```

This returns signup counts, reservations per price version, and total and unique-visitor counts per event. It contains no emails. Without `ADMIN_TOKEN`, the endpoint returns 404. For deeper analysis, query the tables directly.

## Tests and checks

```bash
npm run lint
npm run typecheck
npm run test:e2e                      # Playwright, desktop + mobile viewports
npx playwright test e2e/app.spec.ts   # a single file
npx playwright test -g "timer"        # a single test by name
```

The end-to-end tests start `next dev` on port 3217, or reuse a server already on that port, and write to the dev file store. They use your installed Google Chrome. To use Playwright's bundled browser instead, run `npx playwright install chromium` and set `CI=1`.

## Deploy (Vercel)

1. Push the repo and import it in Vercel. The defaults work.
2. Add environment variables: `DATABASE_URL`, plus `ADMIN_TOKEN` if you want the stats endpoint.
3. Deploy. Then submit a test signup and confirm the row appears in `waitlist_signups`.

Any Node host works with `npm run build && npm start`.

## Notes on the prototype

- Soundscapes are generated live with the Web Audio API, so there are no audio files or licenses to manage. Only one sound plays at a time, and nothing plays until someone presses a button.
- The countdown is based on an absolute end time. It stays correct across tab switches, background tabs, and reloads.
- Pillow connection, cooling, haptics, and app blocking are simulated and labeled as simulated. A browser can't control a pillow or block other apps.
