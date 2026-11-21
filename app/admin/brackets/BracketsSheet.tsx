import {
  formatTime,
  inputTime,
  type BracketOptions,
  type Entrant,
  type Group,
  type ShooterOptions,
  type Side,
  type Slot,
  scheduleBrackets,
  scheduleShooters,
} from "@/lib/brackets";
import { PrintButton } from "./PrintButton";

type BracketPart = { groups: Group[]; schedule: ReturnType<typeof scheduleBrackets>; opts: BracketOptions };
type ShooterPart = { groups: Group[]; schedule: ReturnType<typeof scheduleShooters>; opts: ShooterOptions };

export type BracketsSheetProps = {
  eventName: string | null;
  asOf: string;
  threeOnThree: BracketPart;
  oneOnOne: BracketPart;
  threePoint: ShooterPart;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function EntrantLine({ e, showPaid }: { e: Entrant; showPaid: boolean }) {
  return (
    <span className="block">
      <span className="text-court/50">#{e.seed} </span>
      <span className="font-semibold">{e.name}</span>
      {showPaid && !e.paid && (
        <span className="ml-1.5 border border-red/60 px-1 text-[0.65rem] uppercase tracking-wider text-red">unpaid</span>
      )}
      {e.detail && <span className="block text-xs text-court/60">{e.detail}</span>}
    </span>
  );
}

function SideLine({ s, showPaid }: { s: Side; showPaid: boolean }) {
  if (s.kind === "entrant") return <EntrantLine e={s.entrant} showPaid={showPaid} />;
  if (s.kind === "winner") return <span className="block text-court/70">Winner of G{s.game}</span>;
  return <span className="block text-court/40">Bye</span>;
}

function GameBox({ g, showPaid }: { g: Slot; showPaid: boolean }) {
  return (
    <div className="sheet-box border-2 border-court bg-white p-2 text-sm text-court">
      <p className="mb-1 flex flex-wrap justify-between gap-x-2 text-xs font-semibold uppercase tracking-wide text-court/70">
        <span>G{g.game}</span>
        <span>
          {formatTime(g.start)} · Court {g.court}
        </span>
      </p>
      <SideLine s={g.a} showPaid={showPaid} />
      <span className="my-0.5 block text-xs text-court/40">vs</span>
      <SideLine s={g.b} showPaid={showPaid} />
    </div>
  );
}

function BracketContest({ title, part, showPaid, minutesLine }: { title: string; part: BracketPart; showPaid: boolean; minutesLine: string }) {
  const { groups, schedule, opts } = part;
  if (!groups.length) {
    return (
      <section className="sheet-contest mt-10">
        <h2 className="font-display text-3xl text-chalk print:text-court">{title}</h2>
        <p className="mt-2 text-chalk/70 print:text-court/70">No sign-ups yet.</p>
      </section>
    );
  }
  const played = groups.filter((g) => !schedule.alone.includes(g));
  return (
    <section className="sheet-contest mt-10">
      <h2 className="font-display text-3xl text-chalk print:text-court">{title}</h2>
      <p className="mt-1 text-chalk/70 print:text-court/70">
        {minutesLine} Starts {formatTime(opts.start)}
        {opts.finalsAt !== null ? `, finals at ${formatTime(opts.finalsAt)}` : ""}, ends about {formatTime(schedule.ends)}.
      </p>
      {schedule.overlap && (
        <p className="mt-2 border-2 border-red bg-white p-2 text-sm font-semibold text-red">
          The early rounds run past the finals time, so the finals start at{" "}
          {formatTime(Math.min(...schedule.slots.filter((s) => s.final).map((s) => s.start)))}. Add a court or shorten the games to keep the finals on time.
        </p>
      )}
      {schedule.alone.length > 0 && (
        <p className="mt-2 border-2 border-gold bg-white p-2 text-sm text-court">
          Only one sign-up, so no bracket yet:{" "}
          {schedule.alone.map((g) => `${g.label} (${g.entrants[0].name})`).join(", ")}. Move them to the next age group or wait for more sign-ups.
        </p>
      )}

      {played.map((group) => {
        const mine = schedule.slots.filter((s) => s.group.key === group.key);
        const rounds = [...new Set(mine.map((s) => s.roundName))];
        return (
          <div key={group.key} className="sheet-group mt-6">
            <h3 className="font-display text-2xl text-gold print:text-court">
              {group.label} · {plural(group.entrants.length, showPaid ? "team" : "player", showPaid ? "teams" : "players")}
            </h3>
            {/* A big bracket scrolls sideways inside this box on small screens; on paper the
                columns shrink to the page width. */}
            <div className="mt-3 overflow-x-auto pb-2 print:overflow-visible">
              <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-[minmax(12rem,18rem)] sm:items-center print:grid-flow-col print:auto-cols-[minmax(0,1fr)] print:items-center">
                {rounds.map((r) => (
                  <div key={r} className="flex flex-col gap-3">
                    <p className="scoretag self-start">{r}</p>
                    {mine
                      .filter((s) => s.roundName === r)
                      .map((g) => (
                        <GameBox key={g.game} g={g} showPaid={showPaid} />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="sheet-group mt-6 overflow-x-auto">
        <h3 className="font-display text-2xl text-gold print:text-court">Order of play</h3>
        <table className="mt-3 w-full min-w-[560px] border-collapse bg-white text-sm text-court">
          <thead>
            <tr className="border-b-2 border-court text-left">
              <th className="p-2">Time</th>
              <th className="p-2">Court</th>
              <th className="p-2">Game</th>
              <th className="p-2">Age</th>
              <th className="p-2">Round</th>
              <th className="p-2">Matchup</th>
            </tr>
          </thead>
          <tbody>
            {schedule.slots.map((g) => (
              <tr key={g.game} className="border-b border-court/15 align-top">
                <td className="p-2 whitespace-nowrap">{formatTime(g.start)}</td>
                <td className="p-2">{g.court}</td>
                <td className="p-2">G{g.game}</td>
                <td className="p-2">{g.group.label}</td>
                <td className="p-2">{g.roundName}</td>
                <td className="p-2">
                  {[g.a, g.b].map((s) => (s.kind === "entrant" ? s.entrant.name : s.kind === "winner" ? `Winner of G${s.game}` : "Bye")).join(" vs ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ShooterContest({ part }: { part: ShooterPart }) {
  const { groups, schedule, opts } = part;
  return (
    <section className="sheet-contest mt-10">
      <h2 className="font-display text-3xl text-chalk print:text-court">3-Point Contest</h2>
      {!groups.length ? (
        <p className="mt-2 text-chalk/70 print:text-court/70">No sign-ups yet. Players can also sign up on site.</p>
      ) : (
        <>
          <p className="mt-1 text-chalk/70 print:text-court/70">
            60 seconds each, {plural(opts.minutesEach, "minute", "minutes")} per turn, {plural(opts.stations, "hoop", "hoops")}. Starts{" "}
            {formatTime(opts.start)}, ends about {formatTime(schedule.ends)}. Check in 30 minutes before your age group. A tie goes to a
            30-second shootout from the top of the key.
          </p>
          {groups.map((group) => (
            <div key={group.key} className="sheet-group mt-6 overflow-x-auto">
              <h3 className="font-display text-2xl text-gold print:text-court">
                {group.label} · {plural(group.entrants.length, "shooter", "shooters")}
              </h3>
              <table className="mt-3 w-full min-w-[440px] border-collapse bg-white text-sm text-court">
                <thead>
                  <tr className="border-b-2 border-court text-left">
                    <th className="p-2">#</th>
                    <th className="p-2">Time</th>
                    {opts.stations > 1 && <th className="p-2">Hoop</th>}
                    <th className="p-2">Shooter</th>
                    <th className="w-24 p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.rows
                    .filter((r) => r.group.key === group.key)
                    .map((r) => (
                      <tr key={r.entrant.id} className="border-b border-court/15">
                        <td className="p-2">{r.order}</td>
                        <td className="p-2 whitespace-nowrap">{formatTime(r.start)}</td>
                        {opts.stations > 1 && <td className="p-2">{r.station}</td>}
                        <td className="p-2">
                          <span className="font-semibold">{r.entrant.name}</span>
                          {r.entrant.detail && <span className="ml-1 text-court/60">({r.entrant.detail})</span>}
                        </td>
                        <td className="p-2">
                          <span className="block h-5 border-b border-court/40" />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

function Field({ label, name, value, type = "number", min, max }: { label: string; name: string; value: string; type?: string; min?: number; max?: number }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-court/70">
      {label}
      <input name={name} type={type} defaultValue={value} min={min} max={max} className={`${type === "time" ? "w-36" : "w-28"} border-2 border-court bg-white px-2 py-1 text-base font-normal normal-case text-court`} />
    </label>
  );
}

function Settings({ threeOnThree, oneOnOne, threePoint }: Pick<BracketsSheetProps, "threeOnThree" | "oneOnOne" | "threePoint">) {
  const a = threeOnThree.opts;
  const b = oneOnOne.opts;
  const c = threePoint.opts;
  return (
    <form method="get" className="no-print mt-6 border-2 border-court bg-chalk p-4 text-court">
      <p className="font-semibold">Times and courts</p>
      <p className="text-sm text-court/70">Change any number and press Update. The link keeps your settings, so you can share or print it.</p>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        <fieldset className="flex flex-wrap gap-3">
          <legend className="mb-2 font-display text-xl">3 on 3</legend>
          <Field label="Start" name="s3" type="time" value={inputTime(a.start)} />
          <Field label="Courts" name="c3" value={String(a.courts)} min={1} max={8} />
          <Field label="Game minutes" name="m3" value={String(a.gameMinutes)} min={5} max={60} />
          <Field label="Final minutes" name="f3" value={String(a.finalMinutes)} min={5} max={60} />
          <Field label="Finals at (empty = right after)" name="fa3" type="time" value={a.finalsAt === null ? "" : inputTime(a.finalsAt)} />
        </fieldset>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="mb-2 font-display text-xl">1v1 King of the Court</legend>
          <Field label="Start" name="s1" type="time" value={inputTime(b.start)} />
          <Field label="Courts" name="c1" value={String(b.courts)} min={1} max={8} />
          <Field label="Game minutes" name="m1" value={String(b.gameMinutes)} min={3} max={60} />
          <Field label="Final minutes" name="f1" value={String(b.finalMinutes)} min={3} max={60} />
          <Field label="Finals at (empty = right after)" name="fa1" type="time" value={b.finalsAt === null ? "" : inputTime(b.finalsAt)} />
        </fieldset>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="mb-2 font-display text-xl">3-Point Contest</legend>
          <Field label="Start" name="sp" type="time" value={inputTime(c.start)} />
          <Field label="Hoops" name="cp" value={String(c.stations)} min={1} max={8} />
          <Field label="Minutes per shooter" name="mp" value={String(c.minutesEach)} min={1} max={60} />
        </fieldset>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className="scoretag scoretag--purple py-2">Update</button>
        <a href="/admin/brackets" className="scoretag py-2">Back to the coach&apos;s schedule</a>
      </div>
    </form>
  );
}

export function BracketsSheet(props: BracketsSheetProps) {
  const { eventName, asOf, threeOnThree, oneOnOne, threePoint } = props;
  return (
    <div className="print-sheet">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="scoretag">Coach dashboard</span>
          <h1 className="font-display mt-3 text-4xl text-chalk sm:text-5xl print:text-court">Brackets</h1>
          {eventName && <p className="mt-1 text-chalk/70 print:text-court/70">{eventName}</p>}
          <p className="mt-1 text-sm text-chalk/60 print:text-court/60">
            Sign-ups as of {asOf}. Seeds follow sign-up order, and byes go to the earliest sign-ups.
          </p>
        </div>
        <div className="no-print flex items-center gap-3">
          <a href="/admin" className="scoretag py-2">Back to teams</a>
          <PrintButton />
        </div>
      </div>
      <Settings threeOnThree={threeOnThree} oneOnOne={oneOnOne} threePoint={threePoint} />
      <BracketContest
        title="3 on 3 Tournament"
        part={threeOnThree}
        showPaid
        minutesLine={`${plural(threeOnThree.opts.courts, "court", "courts")}, ${threeOnThree.opts.gameMinutes}-minute games, ${threeOnThree.opts.finalMinutes}-minute finals. Teams check in 15 minutes before their game; 10 minutes late is a 15-0 forfeit.`}
      />
      <BracketContest
        title="1v1 King of the Court"
        part={oneOnOne}
        showPaid={false}
        minutesLine={`${plural(oneOnOne.opts.courts, "court", "courts")}, ${oneOnOne.opts.gameMinutes}-minute games (first to 24 by 2s and 3s).`}
      />
      <ShooterContest part={threePoint} />
    </div>
  );
}
