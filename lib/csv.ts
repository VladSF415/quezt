import type { Registration } from "@prisma/client";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Registration[]): string {
  const headers = [
    "teamName",
    "division",
    "players",
    "email",
    "cellPhone",
    "volunteerReferee",
    "volunteerScoreboard",
    "paid",
    "createdAt",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const players = (r.players as { first: string; last: string }[])
      .map((p) => `${p.first} ${p.last}`)
      .join(" | ");
    lines.push(
      [
        cell(r.teamName),
        cell(r.division),
        cell(players),
        cell(r.email),
        cell(r.cellPhone),
        cell(r.volunteerReferee),
        cell(r.volunteerScoreboard),
        cell(r.paid),
        cell(r.createdAt.toISOString()),
      ].join(",")
    );
  }
  return lines.join("\n");
}
