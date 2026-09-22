"use client";

import { useState } from "react";
import { YOUTUBE_SHORT_IDS, YOUTUBE_CHANNEL_URL } from "@/lib/site";

const tilts = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1", "rotate-1", "-rotate-2"];

function ShortCard({ id, tilt }: { id: string; tilt: string }) {
  const [play, setPlay] = useState(false);

  return (
    <div className={`taped taped--tape self-start p-2 ${tilt}`}>
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: "9 / 16" }}
      >
        {play ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
            title="Quezt basketball highlight"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlay(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label="Play video"
          >
            {/* Lightweight thumbnail from YouTube instead of the full player */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt="Quezt basketball highlight"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red text-chalk shadow-lg transition group-hover:scale-110">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

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
            <ShortCard key={id} id={id} tilt={tilts[i % tilts.length]} />
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
