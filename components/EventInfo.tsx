import Image from "next/image";

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

export function EventInfo({
  name,
  date,
  location,
  divisions,
  prizes,
  registrationDeadline,
}: EventInfoProps) {
  return (
    <section id="event" className="border-b-2 border-black/60 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <span className="scoretag scoretag--purple">Next event</span>
        <h2 className="font-display mt-4 text-4xl text-chalk sm:text-5xl md:text-6xl">
          {name}
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <figure className="taped taped--tape -rotate-1 p-2">
            <Image
              src="/images/flyer.jpg"
              alt="Quezt Community Basketball Event flyer with the tournament details, prizes, and sponsors"
              width={1024}
              height={1536}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <figcaption className="scoretag mt-2 mb-1 ml-1 text-[0.6rem]">
              The official flyer
            </figcaption>
          </figure>

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
            <p className="font-display mt-3 text-2xl text-court">{location}</p>
            <p className="mt-1 text-court/80">
              Location details go out to registered teams.
            </p>
          </div>
          <div className="taped p-6 pt-8 sm:col-span-2">
            <span className="scoretag">Prizes</span>
            <p className="mt-3 text-court/90">
              {prizes ?? "Prizes for winners in every age division."}
            </p>
          </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="scoretag mb-3">Age divisions</p>
            <ul className="flex flex-wrap gap-2">
              {divisions.map((d) => (
                <li
                  key={d}
                  className="font-display border-2 border-gold px-3 py-1 text-lg text-gold"
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
          {registrationDeadline && (
            <p className="text-chalk/80">
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
      </div>
    </section>
  );
}
