import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedOwner() {
  const raw = process.env.OWNER_EMAIL;
  if (!raw) {
    console.log("[seed] OWNER_EMAIL not set, skipping owner bootstrap");
    return;
  }
  const email = raw.trim().toLowerCase();
  // Idempotent: ensure the owner account exists with role "owner". Never
  // downgrades or overwrites an existing row's password/name.
  await prisma.adminUser.upsert({
    where: { email },
    update: { role: "owner" },
    create: { email, role: "owner" },
  });
  console.log(`[seed] owner ensured: ${email}`);
}

// The confirmed venue (the coach, Oct 27 2026). An active event still on the
// "TBD" placeholder moves here on the next deploy; a location set any other
// way is left alone.
const VENUE =
  "Margaret Hayward Playground, 1016 Laguna St, San Francisco, CA 94115";

async function seedEvent() {
  const existing = await prisma.event.findFirst({ where: { isActive: true } });
  if (existing) {
    if (existing.location.startsWith("TBD")) {
      await prisma.event.update({
        where: { id: existing.id },
        data: { location: VENUE },
      });
      console.log("[seed] active event moved to the confirmed venue");
      return;
    }
    console.log("[seed] active event already exists, skipping");
    return;
  }
  await prisma.event.create({
    data: {
      name: "Quezt 3 on 3 Community Basketball Event",
      date: new Date("2026-11-24T09:00:00-08:00"),
      location: VENUE,
      divisions: ["8U", "10U", "12U", "14U", "16U", "18U", "18UP"],
      prizes:
        "$300 cash prize to all age group winners. Turkey and shoes giveaway.",
      registrationDeadline: new Date("2026-11-10T23:59:00-08:00"),
      isActive: true,
    },
  });
  console.log("[seed] active event created");
}

async function main() {
  await seedEvent();
  await seedOwner();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
