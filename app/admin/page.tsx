import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";
import { RegistrationsTable, type Row } from "./RegistrationsTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!isValidSession(cookieStore.get(SESSION_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const event = await prisma.event.findFirst({ where: { isActive: true } });
  const registrations = event
    ? await prisma.registration.findMany({
        where: { eventId: event.id },
        orderBy: [{ division: "asc" }, { createdAt: "asc" }],
      })
    : [];

  const rows: Row[] = registrations.map((r) => ({
    id: r.id,
    teamName: r.teamName,
    division: r.division,
    players: r.players as { first: string; last: string }[],
    email: r.email,
    cellPhone: r.cellPhone,
    volunteerReferee: r.volunteerReferee,
    volunteerScoreboard: r.volunteerScoreboard,
    paid: r.paid,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="scoretag">Coach dashboard</span>
            <h1 className="font-display mt-3 text-4xl text-chalk sm:text-5xl">
              Registered teams
            </h1>
            {event && (
              <p className="mt-1 text-chalk/70">{event.name}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a href="/api/admin/export" className="scoretag scoretag--purple py-2">
              Download CSV
            </a>
            <form action="/admin/logout" method="post">
              <button type="submit" className="scoretag py-2">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <RegistrationsTable rows={rows} />
      </div>
    </main>
  );
}
