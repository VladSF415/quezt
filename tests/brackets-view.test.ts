import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BracketsSheet } from "@/app/admin/brackets/BracketsSheet";
import { bracketOptions, groupRegistrations, scheduleBrackets, scheduleShooters, type Reg } from "@/lib/brackets";

let n = 0;
function reg(format: string, division: string, name: string, paid = false): Reg {
  n += 1;
  const solo = format !== "3on3";
  return {
    id: `v${n}`,
    format,
    teamName: solo ? null : name,
    division,
    players: solo ? [{ first: name, last: "Shooter" }] : [{ first: `${name}A`, last: "P" }, { first: `${name}B`, last: "P" }, { first: `${name}C`, last: "P" }],
    paid,
    createdAt: new Date(Date.UTC(2026, 10, 2, 0, n)),
  };
}

function render(params: Record<string, string> = {}) {
  const regs = [
    reg("3on3", "14U", "Hawks", true),
    reg("3on3", "14U", "Owls"),
    reg("3on3", "14U", "Jets", true),
    reg("3on3", "8U", "Lonely Team", true),
    reg("1v1", "18UP", "Ray"),
    reg("1v1", "18UP", "Dee"),
    reg("3point", "12U", "Ana"),
  ];
  const groups = groupRegistrations(regs);
  const opts = bracketOptions(params);
  const pick = (f: string) => groups.filter((g) => g.format === f);
  return renderToStaticMarkup(
    createElement(BracketsSheet, {
      eventName: "Quezt 3 on 3 Community Basketball Event",
      asOf: "Sat, Nov 21, 9:00 PM",
      threeOnThree: { groups: pick("3on3"), schedule: scheduleBrackets(pick("3on3"), opts.threeOnThree), opts: opts.threeOnThree },
      oneOnOne: { groups: pick("1v1"), schedule: scheduleBrackets(pick("1v1"), opts.oneOnOne), opts: opts.oneOnOne },
      threePoint: { groups: pick("3point"), schedule: scheduleShooters(pick("3point"), opts.threePoint), opts: opts.threePoint },
    })
  );
}

describe("BracketsSheet", () => {
  const html = render();

  it("shows each contest, its age groups and the coach's times", () => {
    for (const s of ["3 on 3 Tournament", "1v1 King of the Court", "3-Point Contest", "14U · 3 teams", "18UP · 2 players", "14 &amp; under · 1 shooter"]) {
      expect(html).toContain(s);
    }
    expect(html).toContain("Starts 1:00 PM, finals at 3:30 PM");
    expect(html).toContain("Starts 12:30 PM");
  });

  it("gives the earliest sign-up a bye and fills the final from the semifinal winner", () => {
    expect(html).toContain("Winner of G1");
    expect(html).toContain("#1 </span><span class=\"font-semibold\">Hawks</span>");
  });

  it("marks unpaid 3 on 3 teams only", () => {
    expect(html.match(/>unpaid</g)?.length).toBe(1);
  });

  it("calls out an age group with only one sign-up", () => {
    expect(html).toContain("Only one sign-up, so no bracket yet:");
    expect(html).toContain("8U (Lonely Team)");
  });

  it("warns when early rounds would push the finals late", () => {
    expect(render({ m3: "60", c3: "1", fa3: "13:30" })).toContain("The early rounds run past the finals time");
  });

  it("has a settings form whose fields match the page's options", () => {
    for (const name of ["s3", "c3", "m3", "f3", "fa3", "s1", "c1", "m1", "f1", "fa1", "sp", "cp", "mp"]) {
      expect(html).toContain(`name="${name}"`);
    }
  });
});
