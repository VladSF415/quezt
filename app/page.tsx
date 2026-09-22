import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Videos } from "@/components/Videos";
import { EventInfo } from "@/components/EventInfo";
import { RegisterForm } from "@/components/RegisterForm";
import { Training } from "@/components/Training";
import { SiteFooter } from "@/components/SiteFooter";

// Dynamic so the build never touches the DB (only reachable at runtime), but
// the event query itself is cached for 5 minutes via unstable_cache, so
// repeated visits are served from cache instead of hitting Postgres each time.
export const dynamic = "force-dynamic";

const getActiveEventCached = unstable_cache(
  async () => prisma.event.findFirst({ where: { isActive: true } }),
  ["active-event"],
  { revalidate: 300, tags: ["active-event"] }
);

// unstable_cache serializes to JSON, so Date fields come back as strings.
// Rehydrate them to Date objects for the components.
async function getActiveEvent() {
  const event = await getActiveEventCached();
  if (!event) return null;
  return {
    ...event,
    date: new Date(event.date),
    registrationDeadline: event.registrationDeadline
      ? new Date(event.registrationDeadline)
      : null,
  };
}

export default async function Home() {
  const event = await getActiveEvent();

  return (
    <main className="flex-1">
      <Hero />
      <About />
      <Gallery />
      <Videos />
      {event && (
        <EventInfo
          name={event.name}
          date={event.date}
          location={event.location}
          divisions={event.divisions}
          prizes={event.prizes}
          registrationDeadline={event.registrationDeadline}
        />
      )}
      <section id="register" className="border-b-2 border-black/60 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <RegisterForm deadline={event?.registrationDeadline ?? null} />
        </div>
      </section>
      <Training />
      <SiteFooter />
    </main>
  );
}
