# Quezt Sports Association Website — Design Spec

**Date:** 2026-09-21
**Owner:** Coach (Quezt Sports Association, @quezsf, San Francisco)
**Builder:** Vlad (hand-off to coach; Vlad likely stays maintainer)

## What Quezt is

Quezt Sports Association is an active community basketball organization in San
Francisco. It runs 3-on-3 tournaments, 1v1 "King of the Court", and 3-point
contests across age divisions 8U through 18+, with cash prizes and community
giveaways (turkey, shoes). Positioned as "more than just a game": youth
programs, health & wellness, education/career support. Has real local sponsors.

Assets on hand (`~/Desktop/Quezt/`): ~13 photos (real tournaments, medal
ceremonies, kids, adults, coach in branded Quezt tee) and ~7 short videos. One
promo flyer with full event details. These photos are the credibility engine of
the site.

## Goals (all three, in priority order on the page)

1. **Look legit** — a professional home base proving the org is real and active.
2. **Get signups** — capture team registrations for the next event.
3. **Support training** — a section for the coach's paid training / "work with me".

## Decisions (locked with the user)

- **Stack:** Next.js + Postgres on **Railway** (Vlad's familiar stack). Chosen
  over static because the user wants a *flexible* site that can grow.
- **Scope for v1:** Public site + native registration form **+ coach dashboard**.
- **Registration:** Rebuilt **native** (not embedded JotForm), styled to match
  the site. Same fields as the coach's existing JotForm.
- **Storage:** Registrations saved to Postgres (enables the dashboard, future
  brackets/payments). Coach also emailed on each new registration.
- **Email:** Resend for coach notifications.
- **Ownership:** Org Railway account logs in with Google **queztbasketball@gmail.com**
  (single-s "basketball" — corrected by user; earlier double-s "bassketball" was
  a mis-type in chat, not the real account). Everything ties to this org identity
  for hand-off. Consider using `coach@quezt.org` / `info@quezt.org` as the
  public-facing contact once the domain exists, keeping the login and the
  displayed contact address as separate concerns.
- **Domain:** Free `*.up.railway.app` (or `quezt.railway`-style) to launch; buy
  `quezt.org` later and point it. Resend "from" address stays a test/verified
  sender until the domain is verified — not a launch blocker.

## Architecture

Single Next.js app on Railway with a Postgres service in the same project.

- **Public routes**
  - `/` — landing page (hero, about, gallery, next event, register form,
    training, footer)
  - Form POST → server action / route handler → insert into `registrations` →
    send Resend email to coach → success state.
- **Admin routes** (coach dashboard)
  - `/admin` — password-protected. List registrations for the active event,
    grouped by age division. Columns: team name, players, division, contact,
    volunteer flags, paid/unpaid toggle, created-at. Search + CSV export.
  - Auth: simple single-password login (env var), session cookie. No public
    signup for admin. (Upgrade to per-user auth later if needed.)
- **Data model (initial)**
  - `events` — id, name, date, location, divisions[], prizes, registration
    deadline, is_active. (Seeded with the Nov 24, 2026 event from the flyer.)
  - `registrations` — id, event_id, team_name, players (jsonb: 4× {first,last}),
    division, cell_phone, email, volunteer_referee (bool), volunteer_scoreboard
    (bool), liability_agreed (bool), paid (bool, default false), created_at.

## Page layout (top → bottom)

1. **Hero** — Quezt name/logo, tagline ("Community Basketball. More than just a
   game."), primary CTA "Register your team".
2. **What Quezt is** — formats (3-on-3, 1v1, 3-point contest), divisions 8U–18+,
   community mission (youth programs, health & wellness, education/career).
3. **Photo gallery** — real event photos. Credibility engine.
4. **Next event** — date, location, divisions, prizes (from flyer / `events`).
5. **Register** — native team form (below).
6. **Training / work with the coach** — paid training blurb + @quezsf IG link.
7. **Footer** — sponsors, socials, contact (org Gmail).

## Registration form (native rebuild of the JotForm)

Source: `form.jotform.com/262636186260156` ("Quezt 3 on 3 Basketball
Registration Form"). Fields:

- **4× Player Name** — first + last each. Required: at least player 1; players
  2–4 required for a full 3-on-3 + sub (match JotForm: all 4 required).
- **Age division** — single **dropdown**: 8U / 10U / 12U / 14U / 16U / 18U /
  18UP. (JotForm modeled this as 7 separate yes/no radios; consolidate to one
  dropdown.)
- **Team Name** — required.
- **Cell Phone** — format (000) 000-0000.
- **Email** — required.
- **Interested in Volunteering** — checkboxes: Match Referee, Operate Scoreboard.
- **Release of Liability Agreement** — required checkbox with agreement text.
- **Submit** → validate → insert row → email coach → success message.
- Show the registration deadline (Nov 10, 2026 per JotForm) near the form.

## Design direction

Energetic, street-basketball, community feel matching the flyer (bold type,
court/night-game energy) — NOT a generic near-black + one-accent AI template.
Use the real photos prominently. Mobile-first (most signups will be on phones).
Run the design through frontend-design guidance during build; pick an
art-movement not previously used (check the design-styles-used ledger).

## Out of scope for v1 (structured for later, not built now)

- Online payment / entry fees (Stripe) — data model leaves room (`paid` flag);
  add Stripe later if events start charging.
- Bracket generation, multi-event management UI, per-user admin accounts.
- Custom domain + Resend domain verification (do at hand-off when `quezt.org`
  is bought).

## Hand-off checklist

- Org Gmail created; Railway account created under it; Resend under it.
- Short "how to run it" note: where signups live (`/admin`), how to read them,
  how to update the next event, how to export CSV.
- Verify `railway status` before every deploy (known mislink risk).
- TODO at domain time: buy `quezt.org`, point DNS, verify domain in Resend,
  switch "from" address.

## Known risks / notes

- Railway free trial is limited; org account will need the small paid plan for
  24/7. Cost lands on org Gmail billing (correct for coach-owned).
- Resend custom "from" needs a verified domain; use test/verified sender until
  `quezt.org` exists. Signups still deliver + store meanwhile.
- Railway mislink history (stale-linked repo deployed onto wrong service, caused
  a DROP-TABLE incident): a dedicated per-project account reduces this;
  still verify `railway status` before `railway up`.
