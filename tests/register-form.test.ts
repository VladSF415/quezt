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
});
