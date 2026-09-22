import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.event.findFirst({ where: { isActive: true } });
  if (existing) {
    console.log("[seed] active event already exists, skipping");
    return;
  }
  await prisma.event.create({
    data: {
      name: "Quezt 3 on 3 Community Basketball Event",
      date: new Date("2026-11-24T09:00:00-08:00"),
      location: "TBD, San Francisco, CA",
      divisions: ["8U", "10U", "12U", "14U", "16U", "18U", "18UP"],
      prizes:
        "$300 cash prize to all age group winners. Turkey and shoes giveaway.",
      registrationDeadline: new Date("2026-11-10T23:59:00-08:00"),
      isActive: true,
    },
  });
  console.log("[seed] active event created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
