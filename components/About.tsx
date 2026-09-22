const formats = [
  {
    tag: "3 on 3",
    title: "3 on 3 Tournament",
    body: "Bring a team of four and play bracket games across your age division.",
  },
  {
    tag: "1 v 1",
    title: "King of the Court",
    body: "Winner stays on. Take on all comers and hold the court as long as you can.",
  },
  {
    tag: "Range",
    title: "3-Point Contest",
    body: "Rack up as many as you can before the clock runs out. Pure shooting.",
  },
];

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

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {formats.map((f) => (
            <div key={f.title} className="taped p-6 pt-8">
              <span className="scoretag scoretag--purple">{f.tag}</span>
              <h3 className="font-display mt-4 text-2xl text-court">
                {f.title}
              </h3>
              <p className="mt-2 text-court/80">{f.body}</p>
            </div>
          ))}
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
