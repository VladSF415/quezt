import { describe, it, expect } from "vitest";
import { buildPayload } from "@/lib/form-payload";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("buildPayload", () => {
  it("maps 4 players and checkboxes", () => {
    const payload = buildPayload(
      fd({
        player1First: "A",
        player1Last: "One",
        player2First: "B",
        player2Last: "Two",
        player3First: "C",
        player3Last: "Three",
        player4First: "D",
        player4Last: "Four",
        teamName: "Ballers",
        division: "14U",
        cellPhone: "(415) 555-1212",
        email: "c@example.com",
        volunteerReferee: "on",
        liabilityAgreed: "on",
      })
    ) as {
      players: { first: string; last: string }[];
      volunteerReferee: boolean;
      volunteerScoreboard: boolean;
      liabilityAgreed: boolean;
    };
    expect(payload.players).toHaveLength(4);
    expect(payload.players[0]).toEqual({ first: "A", last: "One" });
    expect(payload.volunteerReferee).toBe(true);
    expect(payload.volunteerScoreboard).toBe(false);
    expect(payload.liabilityAgreed).toBe(true);
  });

  it("defaults format to 3on3 with four players", () => {
    const payload = buildPayload(fd({ email: "c@example.com" })) as {
      format: string;
      players: unknown[];
    };
    expect(payload.format).toBe("3on3");
    expect(payload.players).toHaveLength(4);
  });

  it("reads a solo contest as one player and keeps the nickname", () => {
    const payload = buildPayload(
      fd({
        format: "1v1",
        player1First: "Solo",
        player1Last: "Player",
        teamName: "Sniper",
        division: "16U",
        email: "s@example.com",
        liabilityAgreed: "on",
      })
    ) as {
      format: string;
      players: { first: string; last: string }[];
      teamName?: string;
    };
    expect(payload.format).toBe("1v1");
    expect(payload.players).toHaveLength(1);
    expect(payload.players[0]).toEqual({ first: "Solo", last: "Player" });
    expect(payload.teamName).toBe("Sniper");
  });

  it("falls back to 3on3 on an unknown format value", () => {
    const payload = buildPayload(fd({ format: "horse" })) as {
      format: string;
    };
    expect(payload.format).toBe("3on3");
  });
});
