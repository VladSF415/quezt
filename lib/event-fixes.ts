// Changes the next deploy makes to the active event (prisma/seed.ts runs on every deploy).
// Each rule moves a value the event was first given; a value set any other way is left alone.

// The confirmed venue (the coach, Oct 27 2026). An event still on the "TBD" placeholder moves here.
export const VENUE =
  "Margaret Hayward Playground, 1016 Laguna St, San Francisco, CA 94115";

// The coach, Nov 12 2026: sign-ups close on the 15th (the first deadline was Nov 10).
export const REGISTRATION_DEADLINE = new Date("2026-11-15T23:59:00-08:00");
const FIRST_DEADLINE_DAY = "2026-11-10";

// The calendar day in San Francisco, as YYYY-MM-DD (the site shows the deadline in Pacific time).
const pacificDay = (d: Date) =>
  d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

export function eventFixes(event: {
  location: string;
  registrationDeadline: Date | null;
}): { location?: string; registrationDeadline?: Date } {
  const data: { location?: string; registrationDeadline?: Date } = {};
  if (event.location.startsWith("TBD")) data.location = VENUE;
  if (
    event.registrationDeadline &&
    pacificDay(event.registrationDeadline) === FIRST_DEADLINE_DAY
  ) {
    data.registrationDeadline = REGISTRATION_DEADLINE;
  }
  return data;
}
