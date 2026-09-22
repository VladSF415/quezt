"use client";

import { useMemo, useState, useTransition } from "react";
import { togglePaid } from "./actions";

export type Row = {
  id: string;
  teamName: string;
  division: string;
  players: { first: string; last: string }[];
  email: string;
  cellPhone: string | null;
  volunteerReferee: boolean;
  volunteerScoreboard: boolean;
  paid: boolean;
  createdAt: string;
};

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
        r.teamName,
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
          placeholder="Search team, player, division, email"
          className="w-full max-w-sm border-2 border-court bg-white px-3 py-2 text-court placeholder-court/40"
        />
        <span className="text-chalk/70">
          {filtered.length} team{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {byDivision.length === 0 && (
        <p className="text-chalk/70">No teams yet.</p>
      )}

      {byDivision.map(([division, teams]) => (
        <div key={division} className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="scoretag">{division}</span>
            <span className="text-chalk/60">{teams.length} team{teams.length === 1 ? "" : "s"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse bg-white text-court">
              <thead>
                <tr className="border-b-2 border-court text-left text-sm">
                  <th className="p-3">Team</th>
                  <th className="p-3">Players</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Volunteer</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((r) => (
                  <tr key={r.id} className="border-b border-court/15 align-top">
                    <td className="p-3 font-semibold">{r.teamName}</td>
                    <td className="p-3 text-sm">
                      {r.players.map((p, i) => (
                        <div key={i}>
                          {p.first} {p.last}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-sm">
                      <div>{r.email}</div>
                      {r.cellPhone && <div className="text-court/60">{r.cellPhone}</div>}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
