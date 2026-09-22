import Image from "next/image";

// A "spread the word" block: the landing page is the registration page, so a QR
// here is for SHARING, not self-registration. Someone on a laptop can have a
// friend scan it, or screenshot it to a group chat. Framed as bring-your-crew.
export function ShareQR() {
  return (
    <section className="border-b-2 border-black/60 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="taped p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="scoretag scoretag--purple">Spread the word</span>
              <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl md:text-5xl">
                Bring your crew
              </h2>
              <p className="mt-4 max-w-xl text-lg text-court/80">
                Know a team that should be in this? Point their phone at the code
                or screenshot it to the group chat. It opens the registration page.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a href="#register" className="btn-register px-6 py-3">
                  Register your team
                </a>
              </div>
            </div>

            <div className="justify-self-center md:justify-self-end">
              <div className="rounded-2xl border-4 border-gold bg-white p-3 shadow-[6px_6px_0_0_rgba(0,0,0,0.85)]">
                <Image
                  src="/images/quezt-qr.png"
                  alt="Scan to open the Quezt registration page"
                  width={220}
                  height={220}
                  className="h-[220px] w-[220px]"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold uppercase tracking-wide text-court/70">
                Scan to register
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
