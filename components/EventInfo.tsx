import Image from "next/image";
import {
  CONTACT_EMAIL,
  CONTACT_NAME,
  CONTACT_PHONE,
  RAIN_LOCATION,
  SCHEDULE,
  telHref,
} from "@/lib/site";
import { formatTime, THREE_POINT_GROUPS, type PublicBrackets, type Side, type Slot } from "@/lib/brackets";

type EventInfoProps = {
  name: string;
  date: Date;
  location: string;
  divisions: string[];
  prizes: string | null;
  registrationDeadline: Date | null;
  // The public brackets (short names only). With them, each age division opens to its games.
  brackets?: PublicBrackets | null;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const sideName = (s: Side) => (s.kind === "entrant" ? s.entrant.shortName : s.kind === "winner" ? `Winner of G${s.game}` : "Bye");
const gameLine = (s: Slot) =>
  `${formatTime(s.start)} · Court ${s.court} · G${s.game} ${s.roundName}: ${sideName(s.a)} vs ${sideName(s.b)}`;

// One age division: how many signed up in each contest, and when it opens, that division's games.
function DivisionPanel({ division, brackets }: { division: string; brackets: PublicBrackets }) {
  const team = brackets.threeOnThree.groups.find((g) => g.key === `3on3-${division}`);
  const solo = brackets.oneOnOne.groups.find((g) => g.key === `1v1-${division}`);
  const shootGroup = THREE_POINT_GROUPS.find((g) => g.divisions.includes(division));
  const shooters = brackets.threePoint.schedule.rows.filter((r) => r.group.key === `3point-${shootGroup?.key}`);
  const counts = [
    team && `3 on 3: ${plural(team.entrants.length, "team", "teams")}`,
    solo && `1v1: ${plural(solo.entrants.length, "player", "players")}`,
    shooters.length > 0 && `3-point: ${plural(shooters.length, "shooter", "shooters")}`,
  ].filter(Boolean);
  const games = (key: string, slots: Slot[]) => slots.filter((s) => s.group.key === key);
  const list = (lines: string[]) => (
    <ul className="mt-1 flex flex-col gap-1 text-sm text-court/90">
      {lines.map((l) => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  );
  return (
    <details id={`division-${division}`} className="border-2 border-court bg-white">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-lg text-court">{division}</span>
        <span className="text-sm text-court/70">{counts.length ? counts.join(" · ") : "No sign-ups yet"}</span>
        <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-purple">Games</span>
      </summary>
      {/* Players' first names: kept out of search snippets (data-nosnippet). */}
      <div data-nosnippet="" className="flex flex-col gap-3 border-t-2 border-court/15 px-3 py-3">
        {!counts.length && <p className="text-sm text-court/80">No sign-ups yet.</p>}
        {team && (
          <div>
            <p className="font-display text-base text-court">3 on 3</p>
            {brackets.threeOnThree.schedule.alone.some((g) => g.key === team.key) ? (
              <p className="mt-1 text-sm text-court/80">Only one team so far.</p>
            ) : (
              list(games(team.key, brackets.threeOnThree.schedule.slots).map(gameLine))
            )}
          </div>
        )}
        {solo && (
          <div>
            <p className="font-display text-base text-court">1v1 King of the Court</p>
            {brackets.oneOnOne.schedule.alone.some((g) => g.key === solo.key) ? (
              <p className="mt-1 text-sm text-court/80">Only one player so far.</p>
            ) : (
              list(games(solo.key, brackets.oneOnOne.schedule.slots).map(gameLine))
            )}
          </div>
        )}
        {shooters.length > 0 && shootGroup && (
          <div>
            <p className="font-display text-base text-court">3-Point Contest ({shootGroup.label})</p>
            {list(shooters.map((r) => `${formatTime(r.start)} · ${r.entrant.shortName}`))}
          </div>
        )}
        <a href="/brackets" className="text-sm font-semibold text-purple underline underline-offset-4">
          See all brackets
        </a>
      </div>
    </details>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

// "Margaret Hayward Playground, 1016 Laguna St, San Francisco, CA 94115"
// shows the place big, then the street and the city on their own lines.
function splitLocation(location: string): { place: string; lines: string[] } {
  const [place, ...rest] = location.split(",").map((s) => s.trim());
  if (rest.length >= 3) {
    return { place, lines: [rest[0], rest.slice(1).join(", ")] };
  }
  return { place, lines: rest.length ? [rest.join(", ")] : [] };
}

function directionsHref(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

const contactLink =
  "font-semibold text-purple underline underline-offset-4 hover:text-red";

export function EventInfo({
  name,
  date,
  location,
  divisions,
  prizes,
  registrationDeadline,
  brackets,
}: EventInfoProps) {
  const { place, lines } = splitLocation(location);
  const confirmed = !location.startsWith("TBD");
  const rain = splitLocation(RAIN_LOCATION);

  return (
    <section id="event" className="border-b-2 border-black/60 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <span className="scoretag scoretag--purple">Next event</span>
        <h2 className="font-display mt-4 text-4xl text-chalk sm:text-5xl md:text-6xl">
          {name}
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <figure className="taped taped--tape -rotate-1 self-start p-2">
            <Image
              src="/images/flyer-nov24.jpg"
              alt="Quezt Community Basketball Event flyer with the tournament details, prizes, and sponsors"
              width={1024}
              height={1536}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <figcaption className="scoretag mt-2 mb-1 ml-1 text-[0.6rem]">
              The official flyer
            </figcaption>
          </figure>

          <div className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="taped p-6 pt-8">
                <span className="scoretag">When</span>
                <p className="font-display mt-3 text-2xl text-court">
                  {formatDate(date)}
                </p>
                <p className="mt-1 text-court/80">9:00 AM to 5:00 PM</p>
              </div>
              <div className="taped p-6 pt-8">
                <span className="scoretag">Where</span>
                <p className="font-display mt-3 text-2xl text-court">
                  {place}
                </p>
                {lines.length > 0 && (
                  <p className="mt-1 text-court/80">
                    {lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                )}
                {confirmed ? (
                  <a
                    href={directionsHref(location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scoretag scoretag--purple mt-4 py-2"
                  >
                    Get directions
                  </a>
                ) : (
                  <p className="mt-1 text-court/80">
                    Location details go out to registered teams.
                  </p>
                )}
              </div>
            </div>
            <div className="taped p-6 pt-8">
              <span className="scoretag scoretag--purple">If it rains</span>
              <p className="mt-3 text-court/80">
                The event moves indoors to
              </p>
              <p className="font-display mt-1 text-2xl text-court">
                {rain.place}
              </p>
              <p className="mt-1 text-court/80">
                {rain.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <a
                href={directionsHref(RAIN_LOCATION)}
                target="_blank"
                rel="noopener noreferrer"
                className="scoretag scoretag--purple mt-4 py-2"
              >
                Rain-day directions
              </a>
            </div>
            <div className="taped p-6 pt-8">
              <span className="scoretag">Schedule</span>
              <ol className="mt-4 flex flex-col gap-2">
                {SCHEDULE.map((step) => (
                  <li
                    key={step.time}
                    className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3"
                  >
                    <span className="font-display text-lg text-red">
                      {step.time}
                    </span>
                    <span
                      className={step.staff ? "text-court/60" : "text-court/90"}
                    >
                      {step.what}
                      {step.staff && (
                        <span className="ml-2 border border-court/40 px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-court/60">
                          Staff
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#rules" className="scoretag py-2">
                  Read the rules
                </a>
                <a href="/brackets" className="scoretag scoretag--purple py-2">
                  See the brackets
                </a>
              </div>
            </div>
            <div className="taped p-6 pt-8">
              <span className="scoretag">Prizes</span>
              <p className="mt-3 text-court/90">
                {prizes ?? "Prizes for winners in every age division."}
              </p>
            </div>
            <div className="taped p-6 pt-8">
              <span className="scoretag">Age divisions</span>
              {brackets ? (
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-sm text-court/70">Tap an age group to see its games and times.</p>
                  {divisions.map((d) => (
                    <DivisionPanel key={d} division={d} brackets={brackets} />
                  ))}
                </div>
              ) : (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {divisions.map((d) => (
                    <li
                      key={d}
                      className="font-display border-2 border-court px-3 py-1 text-lg text-court"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              )}
              {registrationDeadline && (
                <p className="mt-4 text-court/80">
                  Registration closes{" "}
                  <span className="font-display text-xl text-red">
                    {registrationDeadline.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "America/Los_Angeles",
                    })}
                  </span>
                </p>
              )}
            </div>
            <div className="taped p-6 pt-8">
              <span className="scoretag">Questions?</span>
              <p className="font-display mt-3 text-2xl text-court">
                {CONTACT_NAME}
              </p>
              <div className="mt-2 flex flex-col items-start gap-1">
                <a
                  href={telHref(CONTACT_PHONE)}
                  className={`${contactLink} whitespace-nowrap`}
                >
                  {CONTACT_PHONE}
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className={`${contactLink} max-w-full break-words`}
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
