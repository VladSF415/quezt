import { prisma } from "@/lib/db";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Videos } from "@/components/Videos";
import { EventInfo } from "@/components/EventInfo";
import { RegisterForm } from "@/components/RegisterForm";
import { Training } from "@/components/Training";
import { SiteFooter } from "@/components/SiteFooter";

// Rendered per-request: the homepage reads the active event from the database,
// which is only reachable at runtime, not during the build.
export const dynamic = "force-dynamic";

export default async function Home() {
  const event = await prisma.event.findFirst({ where: { isActive: true } });

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
      <section id="register" className="border-b-2 border-black/60 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <RegisterForm deadline={event?.registrationDeadline ?? null} />
        </div>
      </section>
      <Training />
      <SiteFooter />
    </main>
  );
}
