import Image from "next/image";
import {
  CONTACT_EMAIL,
  CONTACT_NAME,
  CONTACT_PHONE,
  telHref,
} from "@/lib/site";

type EventInfoProps = {
  name: string;
  date: Date;
  location: string;
  divisions: string[];
  prizes: string | null;
  registrationDeadline: Date | null;
};

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
}: EventInfoProps) {
  const { place, lines } = splitLocation(location);
  const confirmed = !location.startsWith("TBD");

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
              src="/images/flyer.jpg"
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
              <span className="scoretag">Prizes</span>
              <p className="mt-3 text-court/90">
                {prizes ?? "Prizes for winners in every age division."}
              </p>
            </div>
            <div className="taped p-6 pt-8">
              <span className="scoretag">Age divisions</span>
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
