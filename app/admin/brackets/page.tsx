import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE } from "@/lib/auth";
import { bracketOptions, groupRegistrations, scheduleBrackets, scheduleShooters } from "@/lib/brackets";
import { BracketsSheet } from "./BracketsSheet";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Brackets | Quezt coach dashboard", robots: { index: false, follow: false } };

// Every sign-up for the active event, grouped into brackets with a time and court for each game.
// Players' names only show here, behind the coach's sign-in.
export default async function BracketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) {
    redirect("/admin/login");
  }

  const event = await prisma.event.findFirst({ where: { isActive: true } });
  const registrations = event
    ? await prisma.registration.findMany({
        where: { eventId: event.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, format: true, teamName: true, division: true, players: true, paid: true, createdAt: true },
      })
    : [];
  const groups = groupRegistrations(
    registrations.map((r) => ({ ...r, players: r.players as { first: string; last: string }[] }))
  );
  const opts = bracketOptions(await searchParams);
  const pick = (format: string) => groups.filter((g) => g.format === format);
  const asOf = new Date().toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });

  return (
    <main className="flex-1 px-5 py-10 print:p-0">
      <div className="mx-auto max-w-6xl">
        <BracketsSheet
          eventName={event?.name ?? null}
          asOf={asOf}
          threeOnThree={{ groups: pick("3on3"), schedule: scheduleBrackets(pick("3on3"), opts.threeOnThree), opts: opts.threeOnThree }}
          oneOnOne={{ groups: pick("1v1"), schedule: scheduleBrackets(pick("1v1"), opts.oneOnOne), opts: opts.oneOnOne }}
          threePoint={{ groups: pick("3point"), schedule: scheduleShooters(pick("3point"), opts.threePoint), opts: opts.threePoint }}
        />
      </div>
    </main>
  );
}
