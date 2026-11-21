import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Rules } from "@/components/Rules";
import { RULES } from "@/lib/rules";

describe("Rules section", () => {
  const html = renderToStaticMarkup(createElement(Rules));

  it("has one card for each contest, in the site's order", () => {
    expect(RULES.map((r) => r.title)).toEqual(["3 on 3 Tournament", "1v1 King of the Court", "3-Point Contest"]);
    expect(html).toContain('id="rules"');
    for (const r of RULES) expect(html).toContain(`id="${r.id}"`);
  });

  it("carries the coach's rules for each contest", () => {
    for (const line of [
      "First team to 15 points, or a 12-minute running clock, whichever comes first.",
      "Championship game: first team to 21 points, or a 15-minute running clock, whichever comes first.",
      "Basket behind the arc: 2 points.",
      "A team that isn&#x27;t ready 10 minutes after its game time forfeits, 15-0.",
      "First player to 24 points wins, scoring by 2s and 3s.",
      "Hosted by Trevor Dunbar.",
      "60 seconds to score as many points as you can.",
      "a money ball (the last ball) worth 2 points",
      "Tiebreaker: a 30-second shootout from the top of the key.",
    ]) {
      expect(html).toContain(line);
    }
  });

  it("uses the 3-point contest's own age groups", () => {
    for (const g of ["10 &amp; under", "14 &amp; under", "18 &amp; under", "18 &amp; up"]) expect(html).toContain(g);
  });
});
