# Quezt Admin Accounts + Google Sign-In — Design

Date: 2026-09-22
Status: Approved for implementation

## Goal

Replace the single shared `ADMIN_PASSWORD` gate on `/admin` with real,
per-person admin accounts. Coaches sign in with Google. Access is
invite-only (owner adds a coach's email; only invited emails can sign in).
Works today with NO custom domain and NO working email delivery, because
Google sign-in carries identity directly. Password login + email-based
reset are built as a dormant fallback that activates once `quezt.org`
email is verified in Resend.

## Non-goals

- Multi-tenant / multiple organizations. One program, a few coaches.
- Public self-signup. Invite-only.
- Rate limiting, 2FA, audit logs. Out of scope (YAGNI).

## Data model (Prisma)

```
model AdminUser {
  id           String      @id @default(cuid())
  email        String      @unique   // lowercased login identity
  name         String?
  passwordHash String?               // null until/unless a password is set (fallback path)
  role         String      @default("coach")  // "owner" | "coach"
  createdAt    DateTime    @default(now())
  lastLoginAt  DateTime?
  tokens       AuthToken[]
}

model AuthToken {
  id        String    @id @default(cuid())
  userId    String
  user      AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique  // sha256 of raw token; raw token only in the link
  purpose   String              // "invite" | "reset"
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}
```

Registration/Event models untouched. Additive migration.

## Auth / sessions

- Session cookie `quezt_admin` keeps the existing HMAC approach but signs
  the **user id** instead of the literal "ok": token = `${userId}.${hmac(userId)}`.
- `lib/auth.ts` gains `getSessionUser(token): Promise<AdminUser | null>`
  (verifies HMAC, then loads the user). `isValidSession` is replaced by this.
- `createSessionToken(userId)` signs the id. Same cookie flags (httpOnly,
  secure in prod, sameSite lax, 7-day maxAge).
- Password hashing: bcrypt (`@node-rs/bcrypt`, native, no build issues).

## Google sign-in (primary path, domain-independent)

- `GET /api/auth/google/login` → builds Google OAuth consent URL (scope:
  `openid email profile`), sets a signed state cookie (CSRF), redirects to Google.
- `GET /api/auth/google/callback` → verifies state, exchanges `code` for
  tokens with Google (`google-auth-library`), reads the verified email.
  - Look up `AdminUser` by lowercased email.
  - **Match** → set session cookie, update `lastLoginAt`, redirect `/admin`.
  - **No match** → redirect `/admin/login?error=not_invited` ("This Google
    account hasn't been invited. Ask the owner to add you.").
- Env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_URL`
  (e.g. `https://quezt-production.up.railway.app`) used to build the callback URL.

## Invite flow (owner-only, in dashboard)

- Dashboard gains an "Coaches" section (owner role only): list of admin
  users + an "Invite coach" form (email, optional name).
- Submitting creates an `AdminUser` (role coach, no password). Because
  Google carries identity, **no email is required** for them to get in —
  they just sign in with Google using that address.
- If email IS working (post-domain), also send an optional "you've been
  added" note. Pre-domain, the dashboard shows "They can now sign in with
  Google using <email>." So the feature is fully usable with no domain.
- Owner can remove a coach (deletes the AdminUser; their sessions die on
  next request since the user no longer resolves).

## Owner bootstrap

- On deploy (`npm run release` → seed step), ensure an `AdminUser` exists
  for `OWNER_EMAIL` (role "owner", no password). Idempotent upsert.
- So the first login works immediately: owner signs in with Google using
  `OWNER_EMAIL`, lands in the dashboard, invites coaches.
- `ADMIN_PASSWORD` is retired from the login path (kept unused in env as a
  no-op; login no longer reads it).

## Password + reset (dormant fallback)

- `/admin/login` shows Google button (primary) AND an email+password form.
- Password login: look up user by email, `bcrypt.compare`. Generic error.
- "Set / reset password": creates an `AuthToken` (purpose reset, 1h expiry),
  emails a link `/admin/reset?token=…`. Link page sets a new bcrypt hash,
  marks token used.
- Invite-with-password (optional): `AuthToken` purpose invite, 7d expiry.
- **All email here depends on Resend delivering to non-owner addresses,
  which only works after quezt.org is verified.** Until then this path is
  present but effectively owner-only; Google is the working path. As a
  pre-domain aid, the dashboard can show a copyable reset/invite link so
  the owner can hand it over manually.

## Files

- `prisma/schema.prisma` — 2 new models
- `prisma/seed.ts` — owner upsert from OWNER_EMAIL
- `lib/auth.ts` — identity sessions, getSessionUser, bcrypt helpers, token hash/verify
- `lib/google.ts` — Google OAuth URL + code exchange (google-auth-library)
- `app/api/auth/google/login/route.ts`, `app/api/auth/google/callback/route.ts`
- `app/admin/login/page.tsx` + `actions.ts` — Google button + email/password
- `app/admin/reset/page.tsx` + action — set/reset password via token
- `app/admin/coaches/` (or a section in page.tsx) — invite/list/remove (owner only)
- `app/admin/page.tsx` — use getSessionUser; show Coaches section for owner

## Testing

- Unit: HMAC identity round-trip, token hashing (raw never stored), bcrypt
  verify, invite-gate logic (invited email in / uninvited out), expiry/used-token rejection.
- The Google code-exchange is mocked in tests (no live Google call).
- Manual: owner Google login → invite a coach → coach Google login → remove coach → coach locked out.

## Env vars (Railway)

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — from Google Console
- `APP_URL` — `https://quezt-production.up.railway.app` (callback base)
- `OWNER_EMAIL` — the first/owner account (e.g. queztbasketball@gmail.com)
- Existing: `SESSION_SECRET` (reused to sign identity cookie), `RESEND_*`
- `ADMIN_PASSWORD` — no longer read by login (safe to remove later)
```
