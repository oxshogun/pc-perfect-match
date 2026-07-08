
# Auto-updating Amazon prices with Rainforest API

This is a substantial change because the app currently stores everything in browser localStorage. Doing it right in phases:

## Phase 1 — Backend foundation

1. **Enable Lovable Cloud** (Supabase under the hood).
2. **Auth**: email/password + Google sign-in. No user profile table needed — just `auth.users`.
3. **Schema** (new migration with GRANTs + RLS):
   - `parts` — same shape as current `Part` type, plus `owner_id`, `asin` (text, nullable), `price_updated_at`.
   - `builds` — id, owner_id, name, parts (jsonb), timestamps.
   - `price_history` — part_id, price, currency, checked_at (for graphs later).
   - RLS: owner reads/writes own rows. Service role for the cron job.
4. **One-time migration UX**: on first login, if the browser has `riglab.parts.v1` in localStorage, offer to import them into the user's cloud library.

## Phase 2 — Rainforest integration

5. **Secret**: `RAINFOREST_API_KEY` (user provides after signup at rainforestapi.com).
6. **Server fn** `refreshPartPrice({ partId })` — looks up the part's ASIN, calls Rainforest `type=product`, updates `parts.price` + `parts.price_updated_at`, inserts a `price_history` row. Auth-gated to the part owner.
7. **UI**: in the parts library, each part gets an ASIN field, a "Refresh price" button, and shows "updated 2h ago".

## Phase 3 — Daily automation

8. **Public cron endpoint** `/api/public/cron/refresh-prices` — HMAC-verified via a `CRON_SECRET`. Iterates all parts with an ASIN older than 20h and refreshes them (rate-limited, batched).
9. **pg_cron job** scheduled daily at 03:00 UTC that POSTs to that endpoint with the shared secret.

## Phase 4 — Frontend refactor

10. Replace `src/lib/pc/store.ts` (localStorage) with TanStack Query hooks calling authenticated server functions. All existing components (`PartForm`, `PartPickerDialog`, `builds.tsx`, `library.tsx`, `index.tsx`, share flow) get rewired.
11. Add `_authenticated/` layout for the workbench, library, and builds pages. Keep `/share/$data` public.

## Cost + caveats

- Rainforest: ~$0.003/request. 100 parts refreshed daily = ~$9/month. Only parts with an ASIN filled in get refreshed.
- Currency is USD by default; can be parameterized per-user later.
- Prices reflect Amazon's listed price at check time (not necessarily lowest).

## Scope

Phase 4 alone touches ~10 files and is where most of the work is. If you'd rather do this in two chats — Phase 1+2 first (manual "Refresh" button working), then Phase 3 (cron) later — say so; otherwise I'll build all four phases in one go.

Reply **approve** to start with Phase 1, or tell me what to change.
