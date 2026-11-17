# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev`: dev server (port 3000)
- `npm run build`: production build (`cacheComponents` is on, so build errors surface prerender problems)
- `npm run lint` / `npm run typecheck`
- `npm run test:e2e`: Playwright on desktop and mobile. For a single test, use `npx playwright test -g "timer"`. Tests reuse or start `next dev` on port **3217** and use the installed Chrome (`channel: "chrome"`).

## Next.js 16 gotchas seen here

- `cacheComponents: true`: client components must not call `Date.now()`/`new Date()` during render (prerender fails). Read time in effects or handlers.
- A route handler that returns before touching the request gets prerendered statically. `/api/stats` calls `await connection()` for this reason.
- Tailwind v4: tokens live in `src/app/globals.css` (`@theme`). Global rules that utilities must override go in `@layer base`.

## Architecture

- **Storage** (`src/lib/storage/`): `getStorage()` returns Postgres when `DATABASE_URL` is set, a JSON file in `.data/` in development, and otherwise `null`. A `null` store makes the APIs return 503: never show success unless a 201 came back. Tables are auto-created; keep `db/schema.sql` in sync with `SCHEMA_SQL` in `postgres.ts`.
- **Experiment events**: the browser can only send `landing_visit`, `app_demo_start`, and `reserve_visit` (`CLIENT_EVENTS`). Conversion events are logged server-side after the insert succeeds. Events never contain emails.
- **Price**: there is a single source of truth in `src/config/pricing.ts`. `/api/reserve` rejects submissions whose `priceCents`/`priceVersion` don't match the config. The current value is a dev placeholder.
- **Prototype** (`src/components/prototype/`): `AppState.tsx` holds prefs, session, and connection, persisted to `localStorage` key `sp.demo.v1`. The timer is derived from an absolute `endsAt`. `audio.ts` is a singleton Web Audio engine (one voice at a time). Sheets and dialogs portal into the phone screen element via `OverlayHostContext`, never into `document.body`, and mark `[data-phone-content]` inert while open.
- Demo interactions must stay client-only; do not send them to `/api/events`.
