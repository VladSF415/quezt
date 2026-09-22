export function Training() {
  return (
    <section className="border-b-2 border-black/60 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="taped p-8 md:p-12">
          <span className="scoretag scoretag--purple">Train with the coach</span>
          <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl md:text-5xl">
            Want to get better between tournaments?
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-court/80">
            Quezt runs training for players who want real reps and real
            coaching. Whether you are new to the game or chasing the next
            level, come put in the work. Message us to set up a session.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a
              href="https://www.instagram.com/quezsf/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-register px-6 py-3"
            >
              Message on Instagram
            </a>
            <a href="#register" className="scoretag py-3">
              Or register for the next event
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
