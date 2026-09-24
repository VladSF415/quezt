"use client";

import { useMemo, useState, useTransition } from "react";
import { togglePaid } from "./actions";
import { FORMAT_META, type Format } from "@/lib/registration-schema";

export type Row = {
  id: string;
  format: string;
  teamName: string | null;
  division: string;
  players: { first: string; last: string }[];
  email: string;
  cellPhone: string | null;
  volunteerReferee: boolean;
  volunteerScoreboard: boolean;
  paid: boolean;
  createdAt: string;
};

function contestMeta(format: string) {
  return (
    FORMAT_META[format as Format] ?? {
      label: format,
      tag: format,
      solo: false,
      players: 4,
    }
  );
}

// The primary name to show: the team name for 3on3, otherwise the solo
// player's name (their nickname/tag rides along under it when given).
function displayName(r: Row): string {
  const meta = contestMeta(r.format);
  if (!meta.solo) return r.teamName || "Unnamed team";
  const p = r.players[0];
  return p ? `${p.first} ${p.last}`.trim() : "Player";
}

function PaidButton({ row }: { row: Row }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => togglePaid(row.id))}
      disabled={pending}
      className={`border-2 border-court px-3 py-1 text-sm font-semibold disabled:opacity-50 ${
        row.paid ? "bg-gold text-court" : "bg-white text-court/70"
      }`}
    >
      {row.paid ? "Paid" : "Mark paid"}
    </button>
  );
}

export function RegistrationsTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay = [
        r.teamName ?? "",
        contestMeta(r.format).label,
        r.division,
        r.email,
        r.players.map((p) => `${p.first} ${p.last}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, rows]);

  const byDivision = useMemo(() => {
    const groups = new Map<string, Row[]>();
    for (const r of filtered) {
      const list = groups.get(r.division) ?? [];
      list.push(r);
      groups.set(r.division, list);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, contest, division, email"
          className="w-full max-w-sm border-2 border-court bg-white px-3 py-2 text-court placeholder-court/40"
        />
        <span className="text-chalk/70">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {byDivision.length === 0 && (
        <p className="text-chalk/70">No entries yet.</p>
      )}

      {byDivision.map(([division, entries]) => (
        <div key={division} className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="scoretag">{division}</span>
            <span className="text-chalk/60">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse bg-white text-court">
              <thead>
                <tr className="border-b-2 border-court text-left text-sm">
                  <th className="p-3">Contest</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Players</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Volunteer</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((r) => {
                  const meta = contestMeta(r.format);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-court/15 align-top"
                    >
                      <td className="p-3 text-sm font-semibold">
                        {meta.label}
                      </td>
                      <td className="p-3 font-semibold">
                        {displayName(r)}
                        {meta.solo && r.teamName && (
                          <div className="text-xs font-normal text-court/60">
                            &ldquo;{r.teamName}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {r.players.map((p, i) => (
                          <div key={i}>
                            {p.first} {p.last}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 text-sm">
                        <div>{r.email}</div>
                        {r.cellPhone && (
                          <div className="text-court/60">{r.cellPhone}</div>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {r.volunteerReferee && <div>Referee</div>}
                        {r.volunteerScoreboard && <div>Scoreboard</div>}
                        {!r.volunteerReferee && !r.volunteerScoreboard && (
                          <span className="text-court/40">None</span>
                        )}
                      </td>
                      <td className="p-3">
                        <PaidButton row={r} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
