import { describe, it, expect } from "vitest";
import { registerTeam } from "@/app/actions/register";
import { prisma } from "@/lib/db";

const valid = {
  players: [
    { first: "A", last: "One" },
    { first: "B", last: "Two" },
    { first: "C", last: "Three" },
    { first: "D", last: "Four" },
  ],
  teamName: "Test Team " + Date.now(),
  division: "14U",
  cellPhone: "(415) 555-1212",
  email: "t@example.com",
  volunteerReferee: false,
  volunteerScoreboard: false,
  liabilityAgreed: true,
};

describe("registerTeam", () => {
  it("rejects invalid input", async () => {
    const res = await registerTeam({ ...valid, email: "bad" });
    expect(res.ok).toBe(false);
  });
  it("saves a valid registration", async () => {
    const res = await registerTeam(valid);
    expect(res.ok).toBe(true);
    const row = await prisma.registration.findFirst({
      where: { teamName: valid.teamName },
    });
    expect(row?.division).toBe("14U");
  });
});
