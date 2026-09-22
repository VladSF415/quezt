import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("includes headers and escapes commas", () => {
    const csv = toCsv([
      {
        id: "1",
        eventId: "e",
        teamName: "A, B",
        players: [{ first: "X", last: "Y" }],
        division: "14U",
        cellPhone: "1",
        email: "e@e.com",
        volunteerReferee: false,
        volunteerScoreboard: false,
        liabilityAgreed: true,
        paid: false,
        createdAt: new Date(),
      },
    ] as never);
    expect(csv).toContain("teamName");
    expect(csv).toContain('"A, B"');
  });
});
