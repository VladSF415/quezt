import { YOUTUBE_SHORT_IDS, YOUTUBE_CHANNEL_URL } from "@/lib/site";

const tilts = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1", "rotate-1", "-rotate-2"];

// Renders nothing until at least one Short ID is set in lib/site.ts.
export function Videos() {
  if (YOUTUBE_SHORT_IDS.length === 0) return null;

  return (
    <section className="border-b-2 border-black/60 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <span className="scoretag scoretag--purple">Watch the games</span>
        <h2 className="font-display mt-4 text-4xl text-chalk sm:text-5xl md:text-6xl">
          See it in <span className="text-gold">motion</span>
        </h2>
        <p className="mt-3 max-w-lg text-chalk/70">
          Real hoops from Quezt events. Turn the sound up.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {YOUTUBE_SHORT_IDS.map((id, i) => (
            <div
              key={id}
              className={`taped self-start p-2 ${tilts[i % tilts.length]}`}
            >
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "9 / 16" }}
              >
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title="Quezt basketball highlight"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>

        {YOUTUBE_CHANNEL_URL && (
          <div className="mt-10">
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-register px-6 py-3"
            >
              More on YouTube
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
