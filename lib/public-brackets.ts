// The public brackets (short names only) for the active event, read from the database. Used by the
// home page's age divisions and by /brackets.
import { prisma } from "@/lib/db";
import { publicBrackets, type PublicBrackets } from "@/lib/brackets";

export async function loadPublicBrackets(): Promise<{ eventName: string; brackets: PublicBrackets } | null> {
  const event = await prisma.event.findFirst({ where: { isActive: true } });
  if (!event) return null;
  const regs = await prisma.registration.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, format: true, teamName: true, division: true, players: true, paid: true, createdAt: true },
  });
  const brackets = publicBrackets(
    regs.map((r) => ({ ...r, players: r.players as { first: string; last: string }[] })),
    event.bracketSettings
  );
  return { eventName: event.name, brackets };
}
