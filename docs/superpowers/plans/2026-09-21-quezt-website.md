# Quezt Sports Association Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a flexible Next.js + Postgres website for Quezt Sports Association: a public landing page with a native team-registration form, plus a password-protected coach dashboard to manage registrations, deployed on Railway under the org account.

**Architecture:** Single Next.js (App Router) app with a Postgres database. Public routes render the landing page and accept registrations via a server action that writes to Postgres and emails the coach via Resend. Admin routes are gated by a single shared password (cookie session) and list/manage registrations. Prisma is the DB layer. Deployed to Railway (org account: queztbasketball@gmail.com).

**Tech Stack:** Next.js 15 (App Router, TypeScript), React 19, Prisma + PostgreSQL, Tailwind CSS, Resend (email), Zod (validation), Vitest (unit tests), Playwright (smoke), Railway (hosting).

**Spec:** `docs/superpowers/specs/2026-09-21-quezt-website-design.md`

## Global Constraints

- **ACTUAL versions installed (differ from original assumptions):** Next.js **16.3.5**, React 19.2, Prisma **7.10** (client output must be an explicit `output` path, no longer `node_modules/.prisma`; import from the generated path), Zod **4.6**. Next 16 breaking changes to heed: **`cookies()` is async** (`await cookies()`); read `node_modules/next/dist/docs/` before using an unfamiliar API. Vitest 4 config lives in `vitest.config.mts`.
- **Org Railway login:** `queztbasketball@gmail.com` (single-s "basketball"). Do NOT deploy to any other Railway account.
- **Verify `railway status` before every `railway up`** — known mislink risk (past DROP-TABLE incident from a stale-linked repo).
- **Divisions (exact, ordered):** `8U`, `10U`, `12U`, `14U`, `16U`, `18U`, `18UP`.
- **Registration deadline shown on site:** `Nov 10, 2026`. **Event date:** `Nov 24, 2026`. **Event location:** `TBD, San Francisco, CA`.
- **Public contact email must NOT be the Railway login.** Use a placeholder `info@quezt.org` in copy until the domain exists.
- **No em dashes** in any user-facing text (site copy, emails, button labels). Use commas/periods/parentheses.
- **Simple, plain language** in all user-facing copy. No marketing jargon.
- **All 4 player name pairs required** on the registration form (matches the coach's JotForm).
- **Resend "from"** stays a Resend test/verified sender until `quezt.org` is verified; do not hardcode `@quezt.org` as the sender.
- **Real event photos** live in `public/images/` (converted from `~/Desktop/Quezt/` HEIC/JPEG). Source assets are NOT committed; only optimized web copies.

---

### Task 1: Scaffold Next.js app + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `.env.example`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `postcss.config.mjs`, `tailwind.config.ts`
- Create: `vitest.config.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a running Next.js dev server on `:3000`; `npm test` runs Vitest; Tailwind classes work in components.

- [ ] **Step 1: Scaffold the app**

```bash
cd /Users/vladislavg/quezt
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint --use-npm --import-alias "@/*" --yes
```
If `create-next-app` refuses due to the existing `docs/` folder, answer prompts to keep existing files, or scaffold in a temp dir and copy in (do NOT delete `docs/`).

- [ ] **Step 2: Add test + validation + db deps**

```bash
npm install zod @prisma/client resend
npm install -D vitest @vitejs/plugin-react prisma
```

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```
Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Write a smoke test**

Create `tests/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run test, verify pass**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 6: Create `.env.example`**

```
DATABASE_URL="postgresql://user:pass@localhost:5432/quezt"
RESEND_API_KEY=""
COACH_NOTIFY_EMAIL="queztbasketball@gmail.com"
RESEND_FROM="onboarding@resend.dev"
ADMIN_PASSWORD="change-me"
SESSION_SECRET="change-me-long-random"
```

- [ ] **Step 7: Init git + commit**

```bash
cd /Users/vladislavg/quezt
git init
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind, Vitest, deps"
```

---

### Task 2: Prisma schema + database client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`
- Create: `prisma/seed.ts`
- Test: `tests/db.test.ts`

**Interfaces:**
- Consumes: `DATABASE_URL` from env.
- Produces:
  - `prisma` client exported from `lib/db.ts` as `export const prisma`.
  - Models `Event` and `Registration` (see schema below).
  - A seeded active event row (name "Quezt 3 on 3 Community Basketball Event", date 2026-11-24, location "TBD, San Francisco, CA", `isActive: true`).

- [ ] **Step 1: Write the schema**

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Event {
  id                 String         @id @default(cuid())
  name               String
  date               DateTime
  location           String
  divisions          String[]
  prizes             String?
  registrationDeadline DateTime?
  isActive           Boolean        @default(false)
  createdAt          DateTime       @default(now())
  registrations      Registration[]
}

model Registration {
  id                  String   @id @default(cuid())
  eventId             String
  event               Event    @relation(fields: [eventId], references: [id])
  teamName            String
  players             Json     // [{first,last} x4]
  division            String
  cellPhone           String?
  email               String
  volunteerReferee    Boolean  @default(false)
  volunteerScoreboard Boolean  @default(false)
  liabilityAgreed     Boolean  @default(false)
  paid                Boolean  @default(false)
  createdAt           DateTime @default(now())
}
```

- [ ] **Step 2: Create the db client**

Create `lib/db.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Add a local Postgres for dev**

Start a throwaway local Postgres (Docker) for tests/dev:
```bash
docker run --name quezt-pg -e POSTGRES_PASSWORD=pass -e POSTGRES_USER=user -e POSTGRES_DB=quezt -p 5432:5432 -d postgres:16
```
Set `.env` `DATABASE_URL="postgresql://user:pass@localhost:5432/quezt"`.
If Docker is unavailable, use a Railway-provisioned Postgres URL for dev instead.

- [ ] **Step 4: Push schema + generate client**

```bash
npx prisma db push
npx prisma generate
```

- [ ] **Step 5: Write the seed**

Create `prisma/seed.ts`:
```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.event.findFirst({ where: { isActive: true } });
  if (existing) return;
  await prisma.event.create({
    data: {
      name: "Quezt 3 on 3 Community Basketball Event",
      date: new Date("2026-11-24T09:00:00-08:00"),
      location: "TBD, San Francisco, CA",
      divisions: ["8U", "10U", "12U", "14U", "16U", "18U", "18UP"],
      prizes: "$300 cash prize to all age group winners. Turkey and shoes giveaway.",
      registrationDeadline: new Date("2026-11-10T23:59:00-08:00"),
      isActive: true,
    },
  });
}
main().finally(() => prisma.$disconnect());
```
Add to `package.json`: `"prisma": { "seed": "npx tsx prisma/seed.ts" }` and install `tsx`: `npm install -D tsx`.

- [ ] **Step 6: Run the seed**

```bash
npx prisma db seed
```

- [ ] **Step 7: Write a test that reads the seeded event**

Create `tests/db.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db";

describe("seeded event", () => {
  it("has one active event with 7 divisions", async () => {
    const event = await prisma.event.findFirst({ where: { isActive: true } });
    expect(event).not.toBeNull();
    expect(event?.divisions).toHaveLength(7);
    expect(event?.divisions).toContain("18UP");
  });
});
```

- [ ] **Step 8: Run test, verify pass**

Run: `npm test -- tests/db.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add prisma lib/db.ts tests/db.test.ts package.json
git commit -m "feat: prisma schema, db client, seed active event"
```

---

### Task 3: Registration validation schema (Zod)

**Files:**
- Create: `lib/registration-schema.ts`
- Test: `tests/registration-schema.test.ts`

**Interfaces:**
- Consumes: nothing (pure).
- Produces:
  - `export const DIVISIONS = ["8U","10U","12U","14U","16U","18U","18UP"] as const;`
  - `export const registrationSchema` (Zod) validating the form payload.
  - `export type RegistrationInput = z.infer<typeof registrationSchema>;`
  - Shape: `{ players: {first:string,last:string}[] (exactly 4, all non-empty), teamName: string(non-empty), division: enum(DIVISIONS), cellPhone?: string, email: string(email), volunteerReferee: boolean, volunteerScoreboard: boolean, liabilityAgreed: literal(true) }`.

- [ ] **Step 1: Write failing tests**

Create `tests/registration-schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { registrationSchema } from "@/lib/registration-schema";

const valid = {
  players: [
    { first: "A", last: "One" }, { first: "B", last: "Two" },
    { first: "C", last: "Three" }, { first: "D", last: "Four" },
  ],
  teamName: "Ballers",
  division: "14U",
  cellPhone: "(415) 555-1212",
  email: "coach@example.com",
  volunteerReferee: true,
  volunteerScoreboard: false,
  liabilityAgreed: true,
};

describe("registrationSchema", () => {
  it("accepts a full valid team", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects when liability not agreed", () => {
    expect(registrationSchema.safeParse({ ...valid, liabilityAgreed: false }).success).toBe(false);
  });
  it("rejects a bad division", () => {
    expect(registrationSchema.safeParse({ ...valid, division: "20U" }).success).toBe(false);
  });
  it("rejects when a player name is blank", () => {
    const players = [...valid.players];
    players[3] = { first: "", last: "" };
    expect(registrationSchema.safeParse({ ...valid, players }).success).toBe(false);
  });
  it("rejects a bad email", () => {
    expect(registrationSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm test -- tests/registration-schema.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the schema**

Create `lib/registration-schema.ts`:
```ts
import { z } from "zod";

export const DIVISIONS = ["8U", "10U", "12U", "14U", "16U", "18U", "18UP"] as const;

const playerSchema = z.object({
  first: z.string().trim().min(1),
  last: z.string().trim().min(1),
});

export const registrationSchema = z.object({
  players: z.array(playerSchema).length(4),
  teamName: z.string().trim().min(1),
  division: z.enum(DIVISIONS),
  cellPhone: z.string().trim().optional(),
  email: z.string().trim().email(),
  volunteerReferee: z.boolean(),
  volunteerScoreboard: z.boolean(),
  liabilityAgreed: z.literal(true),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- tests/registration-schema.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/registration-schema.ts tests/registration-schema.test.ts
git commit -m "feat: zod registration validation schema"
```

---

### Task 4: Registration server action (save + email)

**Files:**
- Create: `lib/email.ts`
- Create: `app/actions/register.ts`
- Test: `tests/register-action.test.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2), `registrationSchema`/`RegistrationInput` (Task 3), env `RESEND_API_KEY`, `RESEND_FROM`, `COACH_NOTIFY_EMAIL`.
- Produces:
  - `lib/email.ts`: `export async function sendCoachNotification(reg: RegistrationInput & { eventName: string }): Promise<void>` — no-throw if `RESEND_API_KEY` is empty (logs + returns).
  - `app/actions/register.ts`: `export async function registerTeam(input: unknown): Promise<{ ok: true } | { ok: false; error: string }>` — validates, finds active event, inserts Registration, calls `sendCoachNotification`. Email failure does NOT fail the registration.

- [ ] **Step 1: Write failing test (validation + persistence path)**

Create `tests/register-action.test.ts`:
```ts
import { describe, it, expect, beforeAll } from "vitest";
import { registerTeam } from "@/app/actions/register";
import { prisma } from "@/lib/db";

const valid = {
  players: [
    { first: "A", last: "One" }, { first: "B", last: "Two" },
    { first: "C", last: "Three" }, { first: "D", last: "Four" },
  ],
  teamName: "Test Team " + Date.now(),
  division: "14U", cellPhone: "(415) 555-1212", email: "t@example.com",
  volunteerReferee: false, volunteerScoreboard: false, liabilityAgreed: true,
};

describe("registerTeam", () => {
  it("rejects invalid input", async () => {
    const res = await registerTeam({ ...valid, email: "bad" });
    expect(res.ok).toBe(false);
  });
  it("saves a valid registration", async () => {
    const res = await registerTeam(valid);
    expect(res.ok).toBe(true);
    const row = await prisma.registration.findFirst({ where: { teamName: valid.teamName } });
    expect(row?.division).toBe("14U");
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- tests/register-action.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement email helper**

Create `lib/email.ts`:
```ts
import { Resend } from "resend";
import type { RegistrationInput } from "@/lib/registration-schema";

export async function sendCoachNotification(
  reg: RegistrationInput & { eventName: string }
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] RESEND_API_KEY not set, skipping notification");
    return;
  }
  const resend = new Resend(key);
  const players = reg.players.map((p) => `${p.first} ${p.last}`).join(", ");
  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: process.env.COACH_NOTIFY_EMAIL || "queztbasketball@gmail.com",
    subject: `New team registered: ${reg.teamName} (${reg.division})`,
    text:
      `Event: ${reg.eventName}\n` +
      `Team: ${reg.teamName}\nDivision: ${reg.division}\n` +
      `Players: ${players}\nEmail: ${reg.email}\nPhone: ${reg.cellPhone || "n/a"}\n` +
      `Volunteer referee: ${reg.volunteerReferee}\nVolunteer scoreboard: ${reg.volunteerScoreboard}\n`,
  });
}
```

- [ ] **Step 4: Implement the action**

Create `app/actions/register.ts`:
```ts
"use server";

import { prisma } from "@/lib/db";
import { registrationSchema } from "@/lib/registration-schema";
import { sendCoachNotification } from "@/lib/email";

export async function registerTeam(
  input: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form and try again." };

  const event = await prisma.event.findFirst({ where: { isActive: true } });
  if (!event) return { ok: false, error: "Registration is not open right now." };

  const data = parsed.data;
  await prisma.registration.create({
    data: {
      eventId: event.id,
      teamName: data.teamName,
      players: data.players,
      division: data.division,
      cellPhone: data.cellPhone,
      email: data.email,
      volunteerReferee: data.volunteerReferee,
      volunteerScoreboard: data.volunteerScoreboard,
      liabilityAgreed: data.liabilityAgreed,
    },
  });

  try {
    await sendCoachNotification({ ...data, eventName: event.name });
  } catch (e) {
    console.error("[register] notification failed", e);
  }

  return { ok: true };
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `npm test -- tests/register-action.test.ts`
Expected: PASS (2 tests). (Email is skipped when `RESEND_API_KEY` empty.)

- [ ] **Step 6: Commit**

```bash
git add lib/email.ts app/actions/register.ts tests/register-action.test.ts
git commit -m "feat: registerTeam server action saves registration + emails coach"
```

---

### Task 5: Prepare optimized event photos

**Files:**
- Create: `public/images/` (optimized web copies)
- Create: `lib/gallery.ts`

**Interfaces:**
- Consumes: source assets in `~/Desktop/Quezt/` (NOT committed).
- Produces:
  - `public/images/gallery-01.jpg` ... `gallery-NN.jpg` (max width ~1400, jpeg quality ~80).
  - `lib/gallery.ts`: `export const galleryImages: { src: string; alt: string }[]` listing the committed images with human alt text.

- [ ] **Step 1: Convert + downscale source photos into public/images**

```bash
cd /Users/vladislavg/quezt
mkdir -p public/images
i=1
for f in ~/Desktop/Quezt/IMG_4031.jpeg ~/Desktop/Quezt/IMG_4032.jpeg ~/Desktop/Quezt/IMG_4034.jpeg \
         ~/Desktop/Quezt/IMG_4037.JPG ~/Desktop/Quezt/IMG_4039.jpeg ~/Desktop/Quezt/IMG_4042.jpeg \
         ~/Desktop/Quezt/IMG_4045.jpeg ~/Desktop/Quezt/IMG_4046.jpeg ~/Desktop/Quezt/IMG_4056.jpeg \
         ~/Desktop/Quezt/IMG_7369.JPEG ~/Desktop/Quezt/IMG_7379.JPEG \
         ~/Desktop/Quezt/IMG_0143.heic ~/Desktop/Quezt/IMG_4987.heic; do
  out=$(printf "public/images/gallery-%02d.jpg" "$i")
  sips -s format jpeg -Z 1400 -s formatOptions 80 "$f" --out "$out" >/dev/null 2>&1 && echo "ok $out"
  i=$((i+1))
done
```
Exclude the flyer (`DB1B1F93...PNG`) from the gallery — it is the promo poster, used separately in the hero, not the photo grid.

- [ ] **Step 2: Write the gallery manifest**

Create `lib/gallery.ts` listing each generated file with descriptive alt text (real, human descriptions, e.g. "Tournament winners with medals on the court", "Coach with young players between games", "3-on-3 team after their match"). No em dashes in alt text.

- [ ] **Step 3: Verify images load in dev**

```bash
npm run dev
```
Open `http://localhost:3000` after Task 6; confirm images resolve (200) in the network tab. (This step is validated visually in Task 9.)

- [ ] **Step 4: Commit**

```bash
git add public/images lib/gallery.ts
git commit -m "assets: optimized event photos + gallery manifest"
```

---

### Task 6: Landing page UI (hero, about, gallery, event, training, footer)

**Files:**
- Create: `app/page.tsx` (replace scaffold)
- Create: `components/Hero.tsx`, `components/About.tsx`, `components/Gallery.tsx`, `components/EventInfo.tsx`, `components/Training.tsx`, `components/SiteFooter.tsx`
- Create: `components/RegisterForm.tsx` (client component; wired in Task 7)
- Modify: `app/globals.css` (theme tokens, fonts)

**Interfaces:**
- Consumes: `galleryImages` (Task 5), active `Event` fetched in `app/page.tsx` via `prisma`.
- Produces: a rendered landing page at `/` with sections in order: Hero, About, Gallery, EventInfo, Register (RegisterForm placeholder), Training, Footer. `EventInfo` receives `{ date, location, divisions, prizes, registrationDeadline }` props.

**Design note:** Follow `frontend-design` guidance. Energetic street-basketball feel matching the flyer (bold display type, court/night energy, purple/gold/black from the flyer palette). Mobile-first. Do NOT ship a generic near-black + one-accent template. Pick an art-movement not in the design-styles-used ledger. All copy in plain language, no em dashes, no jargon.

- [ ] **Step 1: Build the section components**

Each component is presentational. `Hero` shows the Quezt name, tagline ("Community basketball. More than just a game."), and a "Register your team" button that anchors to `#register`. `About` lists formats (3-on-3 tournament, 1v1 King of the Court, 3-point contest) and the community mission (youth programs, health and wellness, education and career support). `Gallery` renders `galleryImages` in a responsive grid using `next/image`. `EventInfo` renders event props. `Training` is a short "Train with the coach" block linking to `@quezsf` on Instagram. `SiteFooter` shows sponsors (text), socials, and the placeholder contact `info@quezt.org`.

- [ ] **Step 2: Compose the page**

`app/page.tsx` is a server component: fetch the active event via `prisma`, render sections in order, pass event props to `EventInfo`, and place `<section id="register"><RegisterForm/></section>` between EventInfo and Training.

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: build succeeds (RegisterForm may render a placeholder until Task 7).

- [ ] **Step 4: Commit**

```bash
git add app components
git commit -m "feat: landing page sections (hero, about, gallery, event, training, footer)"
```

---

### Task 7: Registration form (client) wired to the action

**Files:**
- Modify: `components/RegisterForm.tsx`
- Test: `tests/register-form.test.ts` (unit test of the payload builder)
- Create: `lib/form-payload.ts` (pure helper that maps form fields to `RegistrationInput`)

**Interfaces:**
- Consumes: `registerTeam` (Task 4), `DIVISIONS` (Task 3).
- Produces:
  - `lib/form-payload.ts`: `export function buildPayload(fd: FormData): unknown` — reads named fields (`player1First`.. `player4Last`, `teamName`, `division`, `cellPhone`, `email`, `volunteerReferee`, `volunteerScoreboard`, `liabilityAgreed`) into the `RegistrationInput` shape.
  - `RegisterForm.tsx`: a `"use client"` form that calls `buildPayload` then `registerTeam`, shows success/error, disables submit while pending.

- [ ] **Step 1: Write failing test for the payload builder**

Create `tests/register-form.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildPayload } from "@/lib/form-payload";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("buildPayload", () => {
  it("maps 4 players and checkboxes", () => {
    const payload = buildPayload(fd({
      player1First: "A", player1Last: "One", player2First: "B", player2Last: "Two",
      player3First: "C", player3Last: "Three", player4First: "D", player4Last: "Four",
      teamName: "Ballers", division: "14U", cellPhone: "(415) 555-1212",
      email: "c@example.com", volunteerReferee: "on", liabilityAgreed: "on",
    })) as any;
    expect(payload.players).toHaveLength(4);
    expect(payload.players[0]).toEqual({ first: "A", last: "One" });
    expect(payload.volunteerReferee).toBe(true);
    expect(payload.volunteerScoreboard).toBe(false);
    expect(payload.liabilityAgreed).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- tests/register-form.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the payload builder**

Create `lib/form-payload.ts`:
```ts
export function buildPayload(fd: FormData): unknown {
  const g = (k: string) => (fd.get(k) as string | null)?.toString() ?? "";
  const players = [1, 2, 3, 4].map((n) => ({
    first: g(`player${n}First`),
    last: g(`player${n}Last`),
  }));
  return {
    players,
    teamName: g("teamName"),
    division: g("division"),
    cellPhone: g("cellPhone") || undefined,
    email: g("email"),
    volunteerReferee: fd.get("volunteerReferee") === "on",
    volunteerScoreboard: fd.get("volunteerScoreboard") === "on",
    liabilityAgreed: fd.get("liabilityAgreed") === "on",
  };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- tests/register-form.test.ts`
Expected: PASS.

- [ ] **Step 5: Build the client form**

`components/RegisterForm.tsx` (`"use client"`): render inputs for 4 players (first/last each), team name, a **division dropdown** (`DIVISIONS`), cell phone, email, two volunteer checkboxes, and a required liability checkbox with the agreement text. On submit: `e.preventDefault()`, `buildPayload(new FormData(form))`, `await registerTeam(payload)`, show success message ("Your team is registered. The coach will be in touch.") or the returned error. Disable the button while pending. Show the registration deadline (Nov 10, 2026) above the form. Plain language, no em dashes.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/RegisterForm.tsx lib/form-payload.ts tests/register-form.test.ts
git commit -m "feat: registration form wired to server action"
```

---

### Task 8: Admin auth + registrations dashboard

**Files:**
- Create: `lib/auth.ts`
- Create: `app/admin/login/page.tsx`, `app/admin/login/actions.ts`
- Create: `app/admin/page.tsx`
- Create: `app/admin/logout/route.ts`
- Create: `app/api/admin/export/route.ts` (CSV)
- Create: `app/admin/actions.ts` (toggle paid)
- Test: `tests/auth.test.ts`, `tests/csv.test.ts`
- Create: `lib/csv.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2), env `ADMIN_PASSWORD`, `SESSION_SECRET`.
- Produces:
  - `lib/auth.ts`: `verifyPassword(input: string): boolean`, `createSessionToken(): string`, `isValidSession(token?: string): boolean`, and constant `SESSION_COOKIE = "quezt_admin"`.
  - `lib/csv.ts`: `toCsv(rows: Registration[]): string`.
  - `/admin` server component: redirects to `/admin/login` if no valid session; otherwise lists registrations for the active event grouped by division, with a paid toggle, search box, and a link to CSV export.
  - `/api/admin/export`: returns `text/csv` of the active event's registrations (session-gated).

- [ ] **Step 1: Write failing tests for auth + csv**

Create `tests/auth.test.ts`:
```ts
import { describe, it, expect, beforeAll } from "vitest";
import { verifyPassword, createSessionToken, isValidSession } from "@/lib/auth";

beforeAll(() => {
  process.env.ADMIN_PASSWORD = "secret123";
  process.env.SESSION_SECRET = "test-secret-long";
});

describe("auth", () => {
  it("verifies the right password", () => {
    expect(verifyPassword("secret123")).toBe(true);
    expect(verifyPassword("nope")).toBe(false);
  });
  it("round-trips a session token", () => {
    const t = createSessionToken();
    expect(isValidSession(t)).toBe(true);
    expect(isValidSession("garbage")).toBe(false);
    expect(isValidSession(undefined)).toBe(false);
  });
});
```
Create `tests/csv.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("includes headers and escapes commas", () => {
    const csv = toCsv([{
      id: "1", eventId: "e", teamName: "A, B", players: [{first:"X",last:"Y"}],
      division: "14U", cellPhone: "1", email: "e@e.com", volunteerReferee: false,
      volunteerScoreboard: false, liabilityAgreed: true, paid: false, createdAt: new Date(),
    } as any]);
    expect(csv).toContain("teamName");
    expect(csv).toContain('"A, B"');
  });
});
```

- [ ] **Step 2: Run tests, verify fail**

Run: `npm test -- tests/auth.test.ts tests/csv.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement auth**

Create `lib/auth.ts`:
```ts
import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "quezt_admin";

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET || "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(): string {
  const value = "ok";
  return `${value}.${sign(value)}`;
}

export function isValidSession(token?: string): boolean {
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  return sign(value) === sig;
}
```

- [ ] **Step 4: Implement csv**

Create `lib/csv.ts`:
```ts
import type { Registration } from "@prisma/client";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Registration[]): string {
  const headers = ["teamName", "division", "players", "email", "cellPhone", "volunteerReferee", "volunteerScoreboard", "paid", "createdAt"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const players = (r.players as { first: string; last: string }[]).map((p) => `${p.first} ${p.last}`).join(" | ");
    lines.push([
      cell(r.teamName), cell(r.division), cell(players), cell(r.email), cell(r.cellPhone),
      cell(r.volunteerReferee), cell(r.volunteerScoreboard), cell(r.paid), cell(r.createdAt.toISOString()),
    ].join(","));
  }
  return lines.join("\n");
}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npm test -- tests/auth.test.ts tests/csv.test.ts`
Expected: PASS.

- [ ] **Step 6: Build login page + action**

`app/admin/login/page.tsx`: a password form posting to the login server action. `app/admin/login/actions.ts` (`"use server"`): validate with `verifyPassword`; on success set cookie `SESSION_COOKIE` = `createSessionToken()` (httpOnly, sameSite lax, secure in prod) and redirect to `/admin`; on failure re-render with an error. `app/admin/logout/route.ts`: clears the cookie, redirects to `/admin/login`.

- [ ] **Step 7: Build the dashboard page**

`app/admin/page.tsx` (server component): read `SESSION_COOKIE` via `cookies()`; if `!isValidSession` redirect to `/admin/login`. Otherwise fetch active event + its registrations ordered by division then createdAt. Render grouped by division with counts, a client search filter, a paid toggle (calls `app/admin/actions.ts` `togglePaid(id)` server action), and a link to `/api/admin/export`.

- [ ] **Step 8: Build the CSV export route**

`app/api/admin/export/route.ts`: gate on `isValidSession`; fetch active event registrations; return `toCsv(rows)` with headers `Content-Type: text/csv` and `Content-Disposition: attachment; filename="quezt-registrations.csv"`.

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 10: Commit**

```bash
git add lib/auth.ts lib/csv.ts app/admin app/api/admin tests/auth.test.ts tests/csv.test.ts
git commit -m "feat: admin login + registrations dashboard + CSV export"
```

---

### Task 9: Local end-to-end verification

**Files:**
- Create: `tests/e2e/smoke.spec.ts` (Playwright)
- Modify: `package.json` (playwright script)

**Interfaces:**
- Consumes: the full app + local Postgres.
- Produces: a Playwright smoke that registers a team through the UI and confirms it appears in `/admin`.

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```
Add script: `"e2e": "playwright test"`. Create `playwright.config.ts` with `webServer` running `npm run build && npm start` (or `npm run dev`) on port 3000.

- [ ] **Step 2: Write the smoke**

Create `tests/e2e/smoke.spec.ts`: navigate to `/`, fill the registration form (4 players, division, team name, email, check liability), submit, assert the success message. Then log into `/admin` with `ADMIN_PASSWORD` and assert the team name appears.

- [ ] **Step 3: Run it**

Run: `npm run e2e`
Expected: PASS. Fix any wiring issues found (this is the integration gate).

- [ ] **Step 4: Visual check**

```bash
npm run dev
open -a "Visual Studio Code" .   # then open http://localhost:3000 in browser
```
Confirm: hero reads well on mobile width, gallery images load, form submits, deadline shows, admin lists the team. Screenshot for the user.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e playwright.config.ts package.json
git commit -m "test: playwright e2e smoke (register -> appears in admin)"
```

---

### Task 10: Deploy to Railway (org account)

**Files:**
- Create: `railway.json` (or `nixpacks`/build settings as needed)
- Modify: `package.json` (ensure `build` runs `prisma generate && prisma migrate deploy && next build`; `start` runs `next start -p $PORT`)
- Create: `README.md` (run + hand-off notes)

**Interfaces:**
- Consumes: the built app; Railway org account `queztbasketball@gmail.com`.
- Produces: a live URL on `*.up.railway.app`, Postgres provisioned, env vars set, seed run.

> **User/interactive steps:** `railway login` and account/project linking are interactive and must be done by Vlad. The plan documents them; the executor pauses for Vlad to run auth.

- [ ] **Step 1: Switch build to migrations**

Add a Prisma migration instead of `db push` for prod:
```bash
npx prisma migrate dev --name init
```
Set `package.json` scripts:
```
"build": "prisma generate && prisma migrate deploy && next build",
"start": "next start -p ${PORT:-3000}"
```

- [ ] **Step 2: Vlad logs in + links (INTERACTIVE — Vlad runs these)**

```bash
railway login          # opens browser -> log in as queztbasketball@gmail.com
railway init           # create a NEW project under the org account
railway add            # add a PostgreSQL database to the project
railway status         # VERIFY the linked project/service is the Quezt one
```
Do NOT proceed to deploy until `railway status` shows the correct Quezt project.

- [ ] **Step 3: Set env vars**

```bash
railway variables --set "RESEND_API_KEY=<key or empty for now>" \
  --set "COACH_NOTIFY_EMAIL=queztbasketball@gmail.com" \
  --set "RESEND_FROM=onboarding@resend.dev" \
  --set "ADMIN_PASSWORD=<strong password>" \
  --set "SESSION_SECRET=<long random>"
```
`DATABASE_URL` is provided by the Railway Postgres plugin automatically; reference it in the app service.

- [ ] **Step 4: Deploy**

```bash
railway status   # verify AGAIN
railway up
```

- [ ] **Step 5: Seed prod (once)**

After first deploy, run the seed against prod (via `railway run npx prisma db seed`), or a one-off: confirm exactly one active event exists.

- [ ] **Step 6: Verify live**

Open the live URL. Register a test team. Confirm it appears in `/admin`. Confirm the coach notification email arrives (if `RESEND_API_KEY` set) or is skipped cleanly.

- [ ] **Step 7: Write README hand-off**

`README.md`: what the site is, where signups live (`/admin`), how to log in, how to update the next event (edit the active `Event` row), how to export CSV, the Railway account, the domain TODO (buy quezt.org, verify in Resend, switch `RESEND_FROM`), and the "verify `railway status` before every `railway up`" warning.

- [ ] **Step 8: Commit**

```bash
git add railway.json package.json README.md prisma/migrations
git commit -m "chore: railway deploy config + hand-off README"
```

---

## Self-Review

**Spec coverage:**
- Look legit → Task 6 (hero/about/gallery/footer, real photos). ✓
- Get signups → Tasks 3,4,7 (schema, action, form). ✓
- Support training → Task 6 (Training section). ✓
- Native form rebuild of JotForm fields → Tasks 3,7 (4 players, division dropdown, team name, phone, email, volunteer, liability). ✓
- Store registrations in Postgres → Tasks 2,4. ✓
- Email coach → Task 4. ✓
- Coach dashboard (by division, paid/unpaid, search, CSV) → Task 8. ✓
- Owned by coach / org Railway account → Task 10, Global Constraints. ✓
- Free Railway URL now, domain later → Task 10 README TODO. ✓
- Resend sender caveat until domain verified → Global Constraints, Tasks 4/10. ✓
- Real photos optimized, source not committed → Task 5. ✓
- No em dashes / plain language → Global Constraints, Tasks 6/7. ✓
- Design not-generic, unused art movement → Task 6 design note. ✓

**Placeholder scan:** No "TBD/TODO" left as work items (the only "TBD" is the literal event *location* string from the flyer, which is real data). Code steps include real code. ✓

**Type consistency:** `RegistrationInput` (Task 3) is consumed by `registerTeam` (Task 4), `sendCoachNotification` (Task 4), and `buildPayload` output (Task 7). `DIVISIONS` shared (Tasks 3,7). `SESSION_COOKIE`/`isValidSession`/`createSessionToken` defined in Task 8 `lib/auth.ts` and used consistently in the same task. `toCsv(rows: Registration[])` (Task 8) matches Prisma `Registration` type. ✓

**Scope:** One app, one deployable, one plan. Dashboard included per user's v1 choice. Payments/brackets explicitly deferred. ✓
