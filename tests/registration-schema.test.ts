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
});
