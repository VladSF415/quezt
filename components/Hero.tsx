import Image from "next/image";

export function Hero() {
  return (
    <header className="relative overflow-hidden border-b-2 border-black/60">
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-14 md:pt-12 md:pb-20">
        <div className="flex items-center gap-3">
          <span className="scoretag">Quezt Sports Association</span>
          <span className="scoretag scoretag--purple">San Francisco</span>
        </div>

        <div className="mt-8 grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="font-display text-chalk text-6xl sm:text-7xl md:text-8xl">
              Community
              <br />
              <span className="text-gold">basketball.</span>
              <br />
              More than
              <br />
              just a game.
            </h1>
            <p className="mt-6 max-w-md text-lg text-chalk/80">
              3 on 3 tournaments, 1 on 1 King of the Court, and 3-point
              contests for ages 8U to 18 and up. Real people, real support,
              real community.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#register" className="btn-register px-7 py-4 text-lg">
                Register your team
              </a>
              <a
                href="#event"
                className="scoretag scoretag--purple py-3 text-sm"
              >
                See the next event
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="taped rotate-2 p-2">
              <Image
                src="/images/hero.jpg"
                alt="Coach kneeling next to a young player, both wearing first place medals at the court"
                width={900}
                height={1100}
                priority
                className="h-auto w-full object-cover"
              />
              <p className="scoretag mt-2 mb-1 ml-1 text-[0.6rem]">
                Champions, Quezt tournament
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
