import { describe, it, expect } from "vitest";
import {
  buildBracket,
  formatTime,
  groupRegistrations,
  parseTime,
  scheduleBrackets,
  scheduleShooters,
  seedOrder,
  bracketOptions,
  type Reg,
} from "@/lib/brackets";

let n = 0;
function reg(format: string, division: string, name: string, extra: Partial<Reg> = {}): Reg {
  n += 1;
  const solo = format !== "3on3";
  return {
    id: `r${n}`,
    format,
    teamName: solo ? null : name,
    division,
    players: solo
      ? [{ first: name, last: "Player" }]
      : [1, 2, 3, 4].map((i) => ({ first: `${name}${i}`, last: "P" })),
    paid: false,
    createdAt: new Date(Date.UTC(2026, 10, 1, 0, n)),
    ...extra,
  };
}

describe("times", () => {
  it("reads 24-hour times and writes them like the schedule", () => {
    expect(parseTime("13:00")).toBe(780);
    expect(parseTime("9:05")).toBe(545);
    expect(parseTime("25:00")).toBeNull();
    expect(parseTime("abc")).toBeNull();
    expect(formatTime(780)).toBe("1:00 PM");
    expect(formatTime(750)).toBe("12:30 PM");
    expect(formatTime(600)).toBe("10:00 AM");
  });
});

describe("groupRegistrations", () => {
  it("groups each contest by age, youngest first, sign-ups in order; 3-point uses the flyer's 4 age groups", () => {
    const regs = [
      reg("3on3", "18UP", "Bulls"),
      reg("3on3", "10U", "Minis"),
      reg("3on3", "18UP", "Kings"),
      reg("1v1", "14U", "Ava"),
      reg("3point", "8U", "Leo"),
      reg("3point", "10U", "Mia"),
      reg("3point", "16U", "Sam"),
      reg("3point", "18UP", "Kai"),
    ];
    const g = groupRegistrations(regs);
    expect(g.map((x) => `${x.format}:${x.label}`)).toEqual([
      "3on3:10U",
      "3on3:18UP",
      "1v1:14U",
      "3point:10 & under",
      "3point:18 & under",
      "3point:18 & up",
    ]);
    expect(g[1].entrants.map((e) => e.name)).toEqual(["Bulls", "Kings"]);
    expect(g[3].entrants.map((e) => e.name)).toEqual(["Leo Player", "Mia Player"]);
    expect(g[1].entrants[0].detail).toBe("Bulls1 P, Bulls2 P, Bulls3 P, Bulls4 P");
  });
});

describe("single elimination", () => {
  it("places seeds the standard way", () => {
    expect(seedOrder(2)).toEqual([1, 2]);
    expect(seedOrder(4)).toEqual([1, 4, 2, 3]);
    expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  it("gives byes to the earliest sign-ups and plays n - 1 games", () => {
    const entrants = ["A", "B", "C", "D", "E"].map((x, i) => ({ id: x, name: x, shortName: x, detail: null, paid: true, seed: i + 1 }));
    const b = buildBracket("g", entrants);
    expect(b.rounds.length).toBe(3);
    const games = b.rounds.flat().filter((m) => !m.bye);
    expect(games.length).toBe(4);
    const r1 = b.rounds[0].filter((m) => !m.bye);
    expect(r1.length).toBe(1);
    expect([r1[0].a, r1[0].b].map((s) => (s.kind === "entrant" ? s.entrant.name : "?"))).toEqual(["D", "E"]);
    expect(b.rounds[0].filter((m) => m.bye).length).toBe(3);
  });

  it("handles one and two entrants", () => {
    const one = buildBracket("g", [{ id: "A", name: "A", shortName: "A", detail: null, paid: true, seed: 1 }]);
    expect(one.rounds.flat().filter((m) => !m.bye).length).toBe(0);
    const two = buildBracket("g", ["A", "B"].map((x, i) => ({ id: x, name: x, shortName: x, detail: null, paid: true, seed: i + 1 })));
    expect(two.rounds.length).toBe(1);
    expect(two.rounds[0][0].bye).toBe(false);
  });
});

describe("scheduleBrackets", () => {
  const regs = [
    ...["A", "B", "C", "D"].map((x) => reg("3on3", "14U", x)),
    ...["E", "F"].map((x) => reg("3on3", "18UP", x)),
    reg("3on3", "8U", "Solo"),
  ];
  const groups = groupRegistrations(regs).filter((g) => g.format === "3on3");

  it("runs groups one after another, fills courts, numbers games by time, and holds finals for the finals time", () => {
    const s = scheduleBrackets(groups, { start: 780, courts: 2, gameMinutes: 15, finalMinutes: 20, finalsAt: 930 });
    const line = (x: (typeof s.slots)[number]) => `G${x.game} ${formatTime(x.start)} c${x.court} ${x.group.label} ${x.roundName}`;
    expect(s.slots.map(line)).toEqual([
      "G1 1:00 PM c1 14U Semifinal",
      "G2 1:00 PM c2 14U Semifinal",
      "G3 3:30 PM c1 14U Final",
      "G4 3:30 PM c2 18UP Final",
    ]);
    const final14 = s.slots[2];
    expect([final14.a, final14.b]).toEqual([{ kind: "winner", game: 1 }, { kind: "winner", game: 2 }]);
    expect(s.overlap).toBe(false);
    expect(formatTime(s.ends)).toBe("3:50 PM");
    expect(s.alone.map((g) => g.label)).toEqual(["8U"]);
  });

  it("flags prelims that run past the finals time, and starts finals after them", () => {
    const s = scheduleBrackets(groups, { start: 780, courts: 1, gameMinutes: 90, finalMinutes: 20, finalsAt: 840 });
    expect(s.overlap).toBe(true);
    const finals = s.slots.filter((x) => x.final);
    expect(finals[0].start).toBe(780 + 180);
  });

  it("without a finals time, each group's final follows its own games", () => {
    const s = scheduleBrackets(groups, { start: 780, courts: 2, gameMinutes: 15, finalMinutes: 20, finalsAt: null });
    expect(s.slots.map((x) => `${formatTime(x.start)} ${x.group.label} ${x.roundName}`)).toEqual([
      "1:00 PM 14U Semifinal",
      "1:00 PM 14U Semifinal",
      "1:15 PM 14U Final",
      "1:35 PM 18UP Final",
    ]);
  });
});

describe("scheduleShooters", () => {
  it("gives each 3-point shooter a time, group after group", () => {
    const regs = [reg("3point", "8U", "Leo"), reg("3point", "10U", "Mia"), reg("3point", "18UP", "Kai")];
    const groups = groupRegistrations(regs).filter((g) => g.format === "3point");
    const s = scheduleShooters(groups, { start: 750, stations: 1, minutesEach: 2 });
    expect(s.rows.map((r) => `${formatTime(r.start)} ${r.group.label} ${r.entrant.name}`)).toEqual([
      "12:30 PM 10 & under Leo Player",
      "12:32 PM 10 & under Mia Player",
      "12:34 PM 18 & up Kai Player",
    ]);
    expect(formatTime(s.ends)).toBe("12:36 PM");
  });
});

describe("bracketOptions", () => {
  it("uses the coach's schedule by default and takes changes from the page's form", () => {
    const d = bracketOptions({});
    expect(d.threeOnThree).toEqual({ start: 780, courts: 2, gameMinutes: 15, finalMinutes: 20, finalsAt: 930 });
    expect(d.oneOnOne).toEqual({ start: 810, courts: 1, gameMinutes: 10, finalMinutes: 10, finalsAt: null });
    expect(d.threePoint).toEqual({ start: 750, stations: 1, minutesEach: 2 });
    const c = bracketOptions({ s3: "14:00", c3: "3", m3: "12", f3: "18", fa3: "", c1: "0", mp: "999" });
    expect(c.threeOnThree).toEqual({ start: 840, courts: 3, gameMinutes: 12, finalMinutes: 18, finalsAt: null });
    expect(c.oneOnOne.courts).toBe(1);
    expect(c.threePoint.minutesEach).toBe(60);
  });
});

describe("public names and saved settings", () => {
  it("shortens solo players to first name and last initial, keeps team names", async () => {
    const { groupRegistrations: g } = await import("@/lib/brackets");
    const out = g([
      reg("1v1", "12U", "Leo", { players: [{ first: "Leo", last: "Duarte" }] }),
      reg("3on3", "12U", "Bulls"),
      reg("3point", "18UP", "Cy", { players: [{ first: "Cy", last: "" }] }),
    ]);
    expect(out.find((x) => x.format === "1v1")!.entrants[0].shortName).toBe("Leo D.");
    expect(out.find((x) => x.format === "3on3")!.entrants[0].shortName).toBe("Bulls");
    expect(out.find((x) => x.format === "3point")!.entrants[0].shortName).toBe("Cy");
  });

  it("keeps only the page's own settings, trimmed and short", async () => {
    const { settingsFromForm, savedParams } = await import("@/lib/brackets");
    const fd = new FormData();
    fd.set("s3", " 14:00 ");
    fd.set("c3", "3");
    fd.set("fa3", "");
    fd.set("evil", "x");
    fd.set("m3", "9".repeat(40));
    const s = settingsFromForm(fd);
    expect(s).toEqual({ s3: "14:00", c3: "3", fa3: "", m3: "9999999999" });
    expect(savedParams({ ...s, savedAt: "2026-11-21T05:00:00.000Z", junk: 5 })).toEqual(s);
    expect(savedParams(null)).toEqual({});
    expect(savedParams("nope")).toEqual({});
    expect(bracketOptions({ ...savedParams(s), s3: "15:00" }).threeOnThree.start).toBe(900);
  });
});
