# Locked catalog + private user parts

## What visitors will see

- Landing page + share links stay public.
- To use the workbench, library, or builds they sign in (Google or email/password).
- The parts library shows two sections:
  - **Catalog** — the parts you (admin) curate. Everyone can see them and use them in builds, but only you can add/edit/delete/refresh prices.
  - **My parts** — a visitor's own additions. Private to them; they can freely add/edit/delete.
- Builds are private to each user and follow them across devices.

## Admin

You're identified by the email **landonjamesmckale@gmail.com**. Sign in with Google (or email/password) using that address and the admin controls (add part, edit, delete, refresh prices) appear. Every other signed-in user sees the catalog as read-only.

## Database changes

- Extend the existing `parts` table with a `visibility` column (`catalog` | `private`) and full part data in `data` jsonb.
- Row-level rules:
  - Anyone signed-in can read `catalog` parts. Only admin can insert/update/delete them.
  - Users can fully manage their own `private` parts.
- `builds` table stays user-scoped (already set up).
- Add a `has_role` / `is_admin()` security-definer function that checks the JWT email.
- Seed the current `SEED_PARTS` list into the catalog as admin-owned rows (one-time migration).

## App rewiring

Replace the localStorage store with TanStack Query hooks calling authenticated server functions:

- `listParts()` → returns catalog + caller's private parts
- `upsertPart(part)` / `deletePart(id)` → server enforces admin-only on catalog rows
- `listBuilds()` / `saveBuild()` / `deleteBuild()` / `setActive()`
- `refreshAmazonPrices()` → admin-only, updates catalog rows
- One-time migration: on first sign-in, offer to import existing localStorage parts/builds into the user's account

Route changes:
- `/library`, `/builds`, `/` (workbench) move under `_authenticated/`
- `/auth` and `/share/$data` stay public
- Header shows sign-in state and sign-out

## Out of scope (unless you say otherwise)

- Daily automated price refresh (cron) — you'll still hit "Refresh" manually; the button just becomes admin-only.
- MCP tool updates — the existing MCP tools will keep working but read/write against the cloud instead of localStorage.

## Technical notes

- Admin check: `public.is_admin()` security-definer function comparing `auth.jwt() ->> 'email'` against the hardcoded admin email; used in RLS `WITH CHECK` on catalog rows.
- Server functions live in `src/lib/parts.functions.ts` and `src/lib/builds.functions.ts`, all gated by `requireSupabaseAuth`.
- `src/lib/pc/store.ts` becomes a thin adapter around TanStack Query — components mostly unchanged.
- Google sign-in is enabled the same turn via `configure_social_auth`.
- Landing page (`/`) stays public and links to `/auth`; the actual workbench moves to `/_authenticated/workbench` (or similar).

Reply **approve** to start, or tell me what to change.
