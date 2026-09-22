import { YOUTUBE_VIDEO_ID, YOUTUBE_CHANNEL_URL } from "@/lib/site";

// Renders nothing until a YouTube video ID is set in lib/site.ts.
export function Videos() {
  if (!YOUTUBE_VIDEO_ID) return null;

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

        <div className="taped mt-10 -rotate-1 p-2">
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}`}
              title="Quezt basketball highlights"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {YOUTUBE_CHANNEL_URL && (
          <div className="mt-6">
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
