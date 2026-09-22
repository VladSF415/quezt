import Image from "next/image";
import { galleryImages } from "@/lib/gallery";

// small rotations so the grid reads like a wall of taped-up flyers
const tilts = [
  "-rotate-2",
  "rotate-1",
  "rotate-2",
  "-rotate-1",
  "rotate-1",
  "-rotate-2",
  "rotate-2",
  "-rotate-1",
  "rotate-1",
];

export function Gallery() {
  return (
    <section className="border-b-2 border-black/60 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <span className="scoretag">On the court</span>
        <h2 className="font-display mt-4 text-4xl text-chalk sm:text-5xl md:text-6xl">
          Real games. <span className="text-gold">Real community.</span>
        </h2>
        <p className="mt-3 max-w-lg text-chalk/70">
          Every one of these is a Quezt event. Tournaments, medal days, and
          neighborhood courts across San Francisco.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((img, i) => (
            <figure
              key={img.src}
              className={`taped taped--tape self-start p-2 ${tilts[i % tilts.length]}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={800}
                height={1000}
                className="aspect-[4/5] h-auto w-full object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
