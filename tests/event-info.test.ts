import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// next/image needs the Next runtime; a plain <img> is enough to check the card's words and links.
vi.mock("next/image", () => ({
  default: (p: Record<string, unknown>) =>
    createElement("img", { src: String(p.src), alt: String(p.alt) }),
}));

import { EventInfo } from "@/components/EventInfo";
import { RAIN_LOCATION, SCHEDULE } from "@/lib/site";

const props = {
  name: "Quezt 3 on 3 Community Basketball Event",
  date: new Date("2026-11-24T17:00:00.000Z"),
  location: "Margaret Hayward Playground, 1016 Laguna St, San Francisco, CA 94115",
  divisions: ["8U", "10U"],
  prizes: null,
  registrationDeadline: null,
};

function minutes(t: string): number {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(t);
  if (!m) throw new Error(`not a time: ${t}`);
  return ((Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + Number(m[2]);
}

describe("the day's schedule (the coach's text, Nov 20)", () => {
  it("runs from 10 AM setup to 5:30 PM cleanup, in time order", () => {
    expect(SCHEDULE.map((s) => s.time)).toEqual([
      "10:00 AM",
      "11:00 AM",
      "12:30 PM",
      "1:00 PM",
      "1:30 PM",
      "3:30 PM",
      "4:30 PM",
      "5:00 PM",
      "5:30 PM",
    ]);
    const mins = SCHEDULE.map((s) => minutes(s.time));
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
  });

  it("marks the staff-only steps", () => {
    expect(SCHEDULE.filter((s) => s.staff).map((s) => s.what)).toEqual([
      "Staff arrival and setup",
      "Cleanup",
    ]);
  });
});

describe("EventInfo", () => {
  const html = renderToStaticMarkup(createElement(EventInfo, props));

  it("keeps the main venue and adds the rain location with its own directions link", () => {
    expect(html).toContain("Margaret Hayward Playground");
    expect(html).toContain("If it rains");
    expect(html).toContain("Ella Hill Hutch Community Center");
    expect(html).toContain("1050 McAllister St");
    expect(html).toContain(
      `https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(RAIN_LOCATION)}`
    );
  });

  it("lists every schedule step in order, with the staff steps tagged", () => {
    const at = SCHEDULE.map((s) => html.indexOf(s.what));
    expect(at.every((i) => i > 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(html.match(/>Staff</g)?.length).toBe(2);
  });
});
