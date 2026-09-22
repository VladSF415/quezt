import { INSTAGRAM_URL, YOUTUBE_CHANNEL_URL } from "@/lib/site";

const sponsors = [
  "3rd World Market",
  "Sir Hands Street Food",
  "The Quezt Community",
];

export function SiteFooter() {
  return (
    <footer className="bg-court-2 py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-3xl text-gold">Quezt</p>
            <p className="mt-2 max-w-sm text-chalk/70">
              Community basketball in San Francisco. Empowering youth, building
              leaders, strengthening communities.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="scoretag py-2"
              >
                Instagram @quezsf
              </a>
              {YOUTUBE_CHANNEL_URL && (
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="scoretag py-2"
                >
                  YouTube
                </a>
              )}
              <a href="mailto:info@quezt.org" className="scoretag scoretag--purple py-2">
                info@quezt.org
              </a>
            </div>
          </div>

          <div>
            <p className="scoretag">Sponsored by</p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-chalk/80">
              {sponsors.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-chalk/50">
          Quezt Sports Association. Real people, real support, real community.
        </p>
      </div>
    </footer>
  );
}
