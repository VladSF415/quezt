import { describe, it, expect } from "vitest";
import { registrationSchema } from "@/lib/registration-schema";

const valid = {
  players: [
    { first: "A", last: "One" },
    { first: "B", last: "Two" },
    { first: "C", last: "Three" },
    { first: "D", last: "Four" },
  ],
  teamName: "Ballers",
  division: "14U",
  cellPhone: "(415) 555-1212",
  email: "coach@example.com",
  volunteerReferee: true,
  volunteerScoreboard: false,
  liabilityAgreed: true,
};

describe("registrationSchema", () => {
  it("accepts a full valid team", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects when liability not agreed", () => {
    expect(
      registrationSchema.safeParse({ ...valid, liabilityAgreed: false }).success
    ).toBe(false);
  });
  it("rejects a bad division", () => {
    expect(
      registrationSchema.safeParse({ ...valid, division: "20U" }).success
    ).toBe(false);
  });
  it("rejects when a player name is blank", () => {
    const players = [...valid.players];
    players[3] = { first: "", last: "" };
    expect(
      registrationSchema.safeParse({ ...valid, players }).success
    ).toBe(false);
  });
  it("rejects a bad email", () => {
    expect(
      registrationSchema.safeParse({ ...valid, email: "nope" }).success
    ).toBe(false);
  });
  it("defaults format to 3on3", () => {
    const parsed = registrationSchema.safeParse(valid);
    expect(parsed.success && parsed.data.format).toBe("3on3");
  });

  const soloValid = {
    format: "1v1",
    players: [{ first: "Solo", last: "Player" }],
    division: "16U",
    email: "solo@example.com",
    volunteerReferee: false,
    volunteerScoreboard: false,
    liabilityAgreed: true,
  };

  it("accepts a solo 1v1 entry with one player and no team name", () => {
    expect(registrationSchema.safeParse(soloValid).success).toBe(true);
  });
  it("accepts a solo 3-point entry", () => {
    expect(
      registrationSchema.safeParse({ ...soloValid, format: "3point" }).success
    ).toBe(true);
  });
  it("accepts an optional nickname on a solo entry", () => {
    expect(
      registrationSchema.safeParse({ ...soloValid, teamName: "Sniper" }).success
    ).toBe(true);
  });
  it("rejects a solo entry that sends four players", () => {
    expect(
      registrationSchema.safeParse({ ...soloValid, players: valid.players })
        .success
    ).toBe(false);
  });
  it("rejects a 3on3 entry with only one player", () => {
    expect(
      registrationSchema.safeParse({
        ...valid,
        players: [{ first: "A", last: "One" }],
      }).success
    ).toBe(false);
  });
  it("rejects a 3on3 entry with no team name", () => {
    const { teamName: _omit, ...noTeam } = valid;
    expect(registrationSchema.safeParse(noTeam).success).toBe(false);
  });
  it("rejects an unknown format", () => {
    expect(
      registrationSchema.safeParse({ ...soloValid, format: "horse" }).success
    ).toBe(false);
  });
});
