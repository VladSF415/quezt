# Quezt Sports Association website

Community basketball site for Quezt Sports Association (San Francisco). A public
landing page with team registration, plus a coach dashboard to manage signups.

Built with Next.js 16 + Postgres (Prisma 7) on Railway.

## What it does

- **Public site** (`/`): hero, about, photo gallery, event info, the official
  flyer, a team registration form, and a training section.
- **Registration**: teams register on the site. Each signup is saved to Postgres
  and (if email is configured) the coach gets a notification email.
- **Coach dashboard** (`/admin`): password login, teams grouped by division,
  mark teams paid, search, and download a CSV.

## Where the signups live

- Log in at **`/admin`** with the admin password (Railway env var
  `ADMIN_PASSWORD`).
- You see every registered team, grouped by age division.
- **Mark paid**: click the button on a team to toggle paid/unpaid.
- **Download CSV**: the "Download CSV" button exports all teams.
- New signups also email **queztbasketball@gmail.com** when email is on (below).

## Accounts

- **Railway** (hosting + database): logs in with Google
  **queztbasketball@gmail.com**. Do not change this login.
- **Resend** (email): API key stored as a Railway env var. Emails currently send
  from Resend's shared test sender `onboarding@resend.dev`, which can only
  deliver to the Resend account's own address (queztbasketball@gmail.com).

## Environment variables (set in Railway)

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Provided automatically by the Railway Postgres plugin. |
| `RESEND_API_KEY` | Resend key. Leave empty to turn email off (signups still save). |
| `RESEND_FROM` | Sender address. `onboarding@resend.dev` until quezt.org exists. |
| `COACH_NOTIFY_EMAIL` | Where signup emails go. `queztbasketball@gmail.com`. |
| `SESSION_SECRET` | Long random string used to sign the admin session cookie. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (for coach sign-in). |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `APP_URL` | Base URL, e.g. `https://quezt-production.up.railway.app`. Used to build the Google callback URL. Update when quezt.org goes live. |
| `OWNER_EMAIL` | The first/owner admin account. Seeded on deploy; signs in with Google. |
| `ADMIN_PASSWORD` | No longer used for login (accounts replaced the shared password). Safe to remove. |

## Admin accounts (coach sign-in)

The dashboard uses per-person accounts, invite-only:

- The **owner** account is seeded from `OWNER_EMAIL` on deploy. Sign in at
  `/admin/login` with **Sign in with Google** using that email.
- In the dashboard, the owner adds coaches by email (Coaches section). Only
  emails added there can sign in. Google carries identity, so this works
  with no custom domain and no email setup.
- Google OAuth setup: create a Web OAuth client in Google Cloud Console with
  the redirect URI `<APP_URL>/api/auth/google/callback`, then set
  `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in Railway.
- Email + password login and password reset exist as a fallback but depend on
  Resend delivering to non-owner addresses (works only after quezt.org is
  verified). Google is the working path until then.

## Updating the next event

The site shows the active event from the database. To change the date, location,
prizes, or divisions, edit the active row in the `Event` table (via Railway's
Postgres data view, or `prisma studio` locally). Keep exactly one row with
`isActive = true`.

## Deploying (Railway)

> **Always run `railway status` before `railway up`** to confirm you are on the
> Quezt project and not another one.

1. `railway login` (log in as queztbasketball@gmail.com)
2. `railway link` / `railway status` (confirm the Quezt project)
3. `railway up`

On deploy, Railway runs `npm run release` (pushes the schema and seeds the event)
then starts the app. The build runs `prisma generate && next build`.

## Local development

```bash
# start a local Postgres (Docker)
docker run --name quezt-pg -e POSTGRES_PASSWORD=pass -e POSTGRES_USER=user \
  -e POSTGRES_DB=quezt -p 5432:5432 -d postgres:16

cp .env.example .env      # then fill in values
npm install
npx prisma db push        # create tables
npx prisma db seed        # seed the active event
npm run dev               # http://localhost:3000
npm test                  # run the test suite
```

## To do at domain time (quezt.org)

1. Buy `quezt.org` and point it at the Railway service.
2. Add and verify the domain in Resend.
3. Change `RESEND_FROM` to something like `coach@quezt.org` so emails come from
   the real domain and can reach any address (not just the Resend account email).
