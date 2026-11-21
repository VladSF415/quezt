// Brackets for the coach's dashboard: every sign-up grouped by contest and age, single-elimination
// brackets for 3 on 3 and 1v1, a shooting order for the 3-point contest, and a time and court for
// every game. Pure functions: the page reads the registrations and the options from the URL.
import { DIVISIONS, FORMATS, type Format } from "@/lib/registration-schema";

export type Reg = {
  id: string;
  format: string;
  teamName: string | null;
  division: string;
  players: { first: string; last: string }[];
  paid: boolean;
  createdAt: Date;
};

// seed = place in sign-up order within its group (1 = earliest).
export type Entrant = { id: string; name: string; detail: string | null; paid: boolean; seed: number };
export type Group = { format: Format; key: string; label: string; entrants: Entrant[] };

// The 3-point contest's own age groups, from its rules flyer.
export const THREE_POINT_GROUPS = [
  { key: "10U", label: "10 & under", divisions: ["8U", "10U"] },
  { key: "14U", label: "14 & under", divisions: ["12U", "14U"] },
  { key: "18U", label: "18 & under", divisions: ["16U", "18U"] },
  { key: "18UP", label: "18 & up", divisions: ["18UP"] },
];

const fullName = (p?: { first: string; last: string }) => (p ? `${p.first} ${p.last}`.trim() : "");

function toEntrant(r: Reg, seed: number): Entrant {
  if (r.format === "3on3") {
    const names = r.players.map(fullName).filter(Boolean).join(", ");
    return { id: r.id, name: r.teamName?.trim() || "Unnamed team", detail: names || null, paid: r.paid, seed };
  }
  return { id: r.id, name: fullName(r.players[0]) || "Player", detail: r.teamName?.trim() || null, paid: r.paid, seed };
}

// Contests in the site's order (3 on 3, 1v1, 3-point); groups youngest first; sign-ups in order.
// Empty groups are left out.
export function groupRegistrations(regs: Reg[]): Group[] {
  const sorted = [...regs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const groups: Group[] = [];
  for (const format of FORMATS) {
    const mine = sorted.filter((r) => r.format === format);
    const buckets =
      format === "3point"
        ? THREE_POINT_GROUPS.map((g) => ({ key: g.key, label: g.label, divisions: g.divisions }))
        : DIVISIONS.map((d) => ({ key: d, label: d, divisions: [d as string] }));
    for (const b of buckets) {
      const entrants = mine.filter((r) => b.divisions.includes(r.division)).map((r, i) => toEntrant(r, i + 1));
      if (entrants.length) groups.push({ format, key: `${format}-${b.key}`, label: b.label, entrants });
    }
  }
  return groups;
}

// Standard bracket order for seeds: 1 meets the lowest seed, and the top two can only meet in the final.
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const next = order.length * 2 + 1;
    order = order.flatMap((s) => [s, next - s]);
  }
  return order;
}

export type Side =
  | { kind: "entrant"; entrant: Entrant }
  | { kind: "winner"; game: number }
  | { kind: "bye" };

type Ref = { kind: "entrant"; entrant: Entrant } | { kind: "match"; id: string } | { kind: "bye" };
export type Match = { id: string; round: number; a: Ref; b: Ref; bye: boolean };

// Single elimination. A match against a bye isn't played: its entrant moves straight on.
export function buildBracket(groupKey: string, entrants: Entrant[]): { rounds: Match[][] } {
  if (entrants.length < 2) return { rounds: [] };
  let size = 2;
  while (size < entrants.length) size *= 2;
  const bySeed = new Map(entrants.map((e) => [e.seed, e]));
  let current: Ref[] = seedOrder(size).map((s) => {
    const e = bySeed.get(s);
    return e ? { kind: "entrant", entrant: e } : { kind: "bye" };
  });
  const rounds: Match[][] = [];
  for (let round = 0; current.length > 1; round++) {
    const matches: Match[] = [];
    const next: Ref[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const a = current[i];
      const b = current[i + 1];
      const bye = a.kind === "bye" || b.kind === "bye";
      const m: Match = { id: `${groupKey}-r${round}-m${i / 2}`, round, a, b, bye };
      matches.push(m);
      next.push(bye ? (a.kind === "bye" ? b : a) : { kind: "match", id: m.id });
    }
    rounds.push(matches);
    current = next;
  }
  return { rounds };
}

export function roundName(round: number, total: number): string {
  const fromEnd = total - 1 - round;
  return fromEnd === 0 ? "Final" : fromEnd === 1 ? "Semifinal" : fromEnd === 2 ? "Quarterfinal" : `Round ${round + 1}`;
}

export type Slot = {
  game: number;
  group: Group;
  roundName: string;
  a: Side;
  b: Side;
  start: number; // minutes after midnight
  court: number;
  final: boolean;
};

export type BracketOptions = {
  start: number;
  courts: number;
  gameMinutes: number;
  finalMinutes: number;
  finalsAt: number | null; // all finals of this contest start together at this time, or null
};

// Groups play one after another, each in its own time frame. Within a group a round's games fill the
// courts in waves, and the next round starts when the last wave ends. With finalsAt, every group's
// final waits for the finals block (the coach's "Championship games"); prelims that run past it set
// overlap, and the block starts when they end.
export function scheduleBrackets(groups: Group[], o: BracketOptions) {
  type Pending = { match: Match; group: Group; roundName: string; final: boolean; start: number; court: number };
  const placed: Pending[] = [];
  const finals: { match: Match; group: Group }[] = [];
  const alone: Group[] = [];
  let t = o.start;
  const wave = (items: { match: Match; group: Group; final: boolean; total: number }[], minutes: number) => {
    for (let i = 0; i < items.length; i += o.courts) {
      items.slice(i, i + o.courts).forEach((it, k) =>
        placed.push({ match: it.match, group: it.group, final: it.final, roundName: roundName(it.match.round, it.total), start: t, court: k + 1 })
      );
      t += minutes;
    }
  };
  for (const group of groups) {
    const { rounds } = buildBracket(group.key, group.entrants);
    if (!rounds.length) {
      alone.push(group);
      continue;
    }
    rounds.forEach((matches, r) => {
      const isFinal = r === rounds.length - 1;
      const games = matches.filter((m) => !m.bye).map((match) => ({ match, group, final: isFinal, total: rounds.length }));
      if (isFinal && o.finalsAt !== null) finals.push(...games.map((g) => ({ match: g.match, group })));
      else wave(games, isFinal ? o.finalMinutes : o.gameMinutes);
    });
  }
  let overlap = false;
  if (finals.length && o.finalsAt !== null) {
    overlap = t > o.finalsAt;
    t = Math.max(t, o.finalsAt);
    const totals = new Map(groups.map((g) => [g.key, buildBracket(g.key, g.entrants).rounds.length]));
    wave(finals.map((f) => ({ ...f, final: true, total: totals.get(f.group.key) ?? 1 })), o.finalMinutes);
  }
  placed.sort((x, y) => x.start - y.start || x.court - y.court);
  const number = new Map(placed.map((p, i) => [p.match.id, i + 1]));
  const side = (ref: Ref): Side =>
    ref.kind === "match" ? { kind: "winner", game: number.get(ref.id) ?? 0 } : ref;
  const slots: Slot[] = placed.map((p, i) => ({
    game: i + 1,
    group: p.group,
    roundName: p.roundName,
    a: side(p.match.a),
    b: side(p.match.b),
    start: p.start,
    court: p.court,
    final: p.final,
  }));
  const ends = slots.length ? Math.max(...slots.map((s) => s.start + (s.final ? o.finalMinutes : o.gameMinutes))) : o.start;
  return { slots, ends, overlap, alone };
}

export type ShooterOptions = { start: number; stations: number; minutesEach: number };

// 3-point contest: each shooter gets a turn (60 seconds plus the reset), group after group.
export function scheduleShooters(groups: Group[], o: ShooterOptions) {
  const rows: { group: Group; entrant: Entrant; order: number; start: number; station: number }[] = [];
  let t = o.start;
  for (const group of groups) {
    group.entrants.forEach((entrant, i) => {
      const k = i % o.stations;
      if (i > 0 && k === 0) t += o.minutesEach;
      rows.push({ group, entrant, order: i + 1, start: t, station: k + 1 });
    });
    if (group.entrants.length) t += o.minutesEach;
  }
  return { rows, ends: t };
}

export function parseTime(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// "13:00" for the time inputs on the page.
export const inputTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

type Params = Record<string, string | string[] | undefined>;
const one = (p: Params, k: string) => (Array.isArray(p[k]) ? p[k]?.[0] : p[k]) as string | undefined;
function num(p: Params, k: string, dflt: number, min: number, max: number): number {
  const v = Number(one(p, k));
  return one(p, k) === undefined || one(p, k) === "" || !Number.isFinite(v) ? dflt : Math.min(max, Math.max(min, Math.round(v)));
}
function time(p: Params, k: string, dflt: number): number {
  const v = one(p, k);
  return v === undefined ? dflt : parseTime(v) ?? dflt;
}
function maybeTime(p: Params, k: string, dflt: number | null): number | null {
  const v = one(p, k);
  if (v === undefined) return dflt;
  return v.trim() === "" ? null : parseTime(v) ?? dflt;
}

// Defaults follow the coach's schedule: 3-point at 12:30, 3 on 3 at 1:00 with the championship games
// at 3:30, 1v1 at 1:30. Game lengths come from the rules (3 on 3: first to 15 or a 12-minute clock,
// final first to 21 or 15 minutes), with a few minutes between games.
export function bracketOptions(p: Params) {
  return {
    threeOnThree: {
      start: time(p, "s3", 780),
      courts: num(p, "c3", 2, 1, 8),
      gameMinutes: num(p, "m3", 15, 5, 60),
      finalMinutes: num(p, "f3", 20, 5, 60),
      finalsAt: maybeTime(p, "fa3", 930),
    } satisfies BracketOptions,
    oneOnOne: {
      start: time(p, "s1", 810),
      courts: num(p, "c1", 1, 1, 8),
      gameMinutes: num(p, "m1", 10, 3, 60),
      finalMinutes: num(p, "f1", 10, 3, 60),
      finalsAt: maybeTime(p, "fa1", null),
    } satisfies BracketOptions,
    threePoint: {
      start: time(p, "sp", 750),
      stations: num(p, "cp", 1, 1, 8),
      minutesEach: num(p, "mp", 2, 1, 60),
    } satisfies ShooterOptions,
  };
}
