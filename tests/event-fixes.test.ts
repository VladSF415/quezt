import { describe, it, expect } from "vitest";
import { eventFixes, VENUE, REGISTRATION_DEADLINE } from "@/lib/event-fixes";

const NOV_10 = new Date("2026-11-10T23:59:00-08:00"); // the first deadline, as seeded in September
const pacific = (d: Date) =>
  d.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "long", timeStyle: "short" });

describe("eventFixes (run by the seed on every deploy)", () => {
  it("moves the first deadline (Nov 10) to Nov 15, 11:59 PM Pacific", () => {
    const data = eventFixes({ location: VENUE, registrationDeadline: NOV_10 });
    expect(data.registrationDeadline?.toISOString()).toBe(REGISTRATION_DEADLINE.toISOString());
    expect(pacific(REGISTRATION_DEADLINE)).toBe("November 15, 2026 at 11:59 PM");
    expect(data.location).toBeUndefined();
  });

  it("moves any time on Nov 10 Pacific (the day is what the site shows)", () => {
    const data = eventFixes({ location: VENUE, registrationDeadline: new Date("2026-11-10T00:00:00-08:00") });
    expect(data.registrationDeadline?.toISOString()).toBe(REGISTRATION_DEADLINE.toISOString());
  });

  it("changes nothing once the deadline is Nov 15 (a second deploy skips)", () => {
    expect(eventFixes({ location: VENUE, registrationDeadline: REGISTRATION_DEADLINE })).toEqual({});
  });

  it("leaves a deadline set any other way alone", () => {
    expect(eventFixes({ location: VENUE, registrationDeadline: new Date("2026-11-13T23:59:00-08:00") })).toEqual({});
    expect(eventFixes({ location: VENUE, registrationDeadline: null })).toEqual({});
  });

  it("still moves a TBD location to the venue (the Oct 27 rule)", () => {
    const data = eventFixes({ location: "TBD, San Francisco, CA", registrationDeadline: NOV_10 });
    expect(data.location).toBe(VENUE);
    expect(data.registrationDeadline?.toISOString()).toBe(REGISTRATION_DEADLINE.toISOString());
  });
});
