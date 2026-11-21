import { RULES } from "@/lib/rules";

// The three contests' rules. Each card opens in place (a <details>), so the section stays short and
// works without JavaScript.
export function Rules() {
  return (
    <section id="rules" className="border-b-2 border-black/60 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <span className="scoretag scoretag--purple">Rules</span>
        <h2 className="font-display mt-4 text-4xl text-chalk sm:text-5xl md:text-6xl">Know the game</h2>
        <p className="mt-3 max-w-2xl text-chalk/80">The rules for all three contests. Tap a card to read it.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3 lg:items-start">
          {RULES.map((c) => (
            <details key={c.id} id={c.id} className="taped group p-6 pt-8">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-display block text-2xl text-court">{c.title}</span>
                <span className="mt-1 block text-court/80">{c.summary}</span>
                {/* .scoretag sets its own display, so the show/hide switch lives on a plain wrapper. */}
                <span className="mt-4 block group-open:hidden">
                  <span className="scoretag py-1.5">Read the rules</span>
                </span>
                <span className="mt-4 hidden group-open:block">
                  <span className="scoretag py-1.5">Hide the rules</span>
                </span>
              </summary>
              <p className="mt-4 text-court/80">{c.note}</p>
              {c.blocks.map((b) => (
                <div key={b.heading} className="mt-5">
                  <h3 className="font-display text-xl text-court">{b.heading}</h3>
                  <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-court/90">
                    {b.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
