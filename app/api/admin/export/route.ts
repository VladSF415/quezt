import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const cookieStore = await cookies();
  if (!isValidSession(cookieStore.get(SESSION_COOKIE)?.value)) {
    return new Response("Not authorized", { status: 401 });
  }

  const event = await prisma.event.findFirst({ where: { isActive: true } });
  const rows = event
    ? await prisma.registration.findMany({
        where: { eventId: event.id },
        orderBy: [{ division: "asc" }, { createdAt: "asc" }],
      })
    : [];

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="quezt-registrations.csv"',
    },
  });
}
