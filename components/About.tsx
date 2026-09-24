"use client";

import { FORMATS, FORMAT_META } from "@/lib/registration-schema";
import { selectContest } from "@/lib/contest-select";

const bodies: Record<(typeof FORMATS)[number], string> = {
  "3on3": "Bring a team of four and play bracket games across your age division.",
  "1v1": "Winner stays on. Take on all comers and hold the court as long as you can.",
  "3point": "Rack up as many as you can before the clock runs out. Pure shooting.",
};

const mission = [
  "Youth programs",
  "Health and wellness",
  "Education and career support",
];

export function About() {
  return (
    <section className="border-b-2 border-black/60 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <span className="scoretag">What we run</span>
        <h2 className="font-display mt-4 text-4xl text-chalk sm:text-5xl md:text-6xl">
          Three ways to <span className="text-gold">get in the game</span>
        </h2>
        <p className="mt-4 text-chalk/70">
          Tap a contest to sign up for it. You can enter more than one.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FORMATS.map((f) => {
            const meta = FORMAT_META[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => selectContest(f)}
                className="taped group cursor-pointer p-6 pt-8 text-left transition hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold"
              >
                <span className="scoretag scoretag--purple">{meta.tag}</span>
                <h3 className="font-display mt-4 text-2xl text-court">
                  {meta.label}
                </h3>
                <p className="mt-2 text-court/80">{bodies[f]}</p>
                <span className="font-display mt-4 inline-block text-sm text-purple group-hover:text-red">
                  Sign up &rarr;
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <h3 className="font-display text-3xl text-chalk sm:text-4xl">
            More than <span className="text-purple">just a game</span>
          </h3>
          <div>
            <p className="text-lg text-chalk/80">
              Quezt is a community first. Around the games we run programs that
              help young people build leadership, stay healthy, and find a path
              after the final whistle.
            </p>
            <ul className="mt-5 flex flex-wrap gap-3">
              {mission.map((m) => (
                <li key={m} className="scoretag py-2">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
