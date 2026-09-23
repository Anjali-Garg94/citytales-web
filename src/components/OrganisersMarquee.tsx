import Image from "next/image";
import { getOrganiserColumns } from "@/lib/api";
import { ArrowRightIcon } from "./Icons";
import RevealGroup from "./motion/RevealGroup";
import RevealItem from "./motion/RevealItem";

const directions: ("up" | "down")[] = ["up", "down", "up"];
/**
 * One loop duration per column — lower is faster. The three differ on purpose
 * so the columns never line up into a single moving block; scaled together
 * when the speed changes so that stays true.
 */
const durationVars = ["[--dur:25s] lg:[--dur:26s]", "[--dur:27s] lg:[--dur:30s]", "[--dur:23s] lg:[--dur:24s]"];

export default async function OrganisersMarquee() {
  const organiserColumns = await getOrganiserColumns();

  return (
    <section className="overflow-hidden">
      <RevealGroup className="px-5 pt-9 pb-[22px] lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:pt-12 lg:pb-7">
        <RevealItem>
          <div className="font-serif text-xl font-medium leading-[1.15] lg:text-[26px]">
            Organisers you love
          </div>
        </RevealItem>
      </RevealGroup>

      {/* Black band behind the columns. Full-bleed on purpose: the row inside
          keeps its 1280px cap, but the colour runs edge to edge so it reads as
          a band across the page rather than a black box sitting on white.
          Same near-black as the Live music section, so the page has one black.

          The wrapper carries the colour and the row keeps the mask — put the
          background on the masked element and the gradient eats the colour at
          the top and bottom edges too. This way the logos fade into the black
          instead of fading the black into the page. */}
      <div className="bg-[#0C0A09]">
        {/* Height is sized to show four tiles per column at once:
              mobile  4 × 125 + 3 × 12 gap = 536, band 560
              desktop 4 × 210 + 3 × 24 gap = 912, band 930
            Change a tile height and this has to be recomputed, or the band
            ends up showing three-and-a-bit. */}
        <div
          className="flex h-[560px] gap-3 px-5 lg:mx-auto lg:h-[930px] lg:max-w-[1280px] lg:gap-6 lg:px-20"
          style={{
            maskImage:
              "linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          }}
        >
          {organiserColumns.map((column, i) => (
            <div key={i} className="flex-1 overflow-hidden">
            {/* Spacing is a margin on each tile, not `gap` on the track, and
                that is load-bearing. `gap` puts space only *between* items, so
                a two-copy track of 2N tiles has 2N−1 gaps — half a gap short of
                two whole copies. Translating -50% then lands half a gap off and
                the loop visibly jerks once per cycle. A trailing margin on
                every tile makes the track exactly 2 × (tile + gap), so -50% is
                precisely one copy and the seam is invisible. */}
            <div
              className={`flex flex-col ${
                durationVars[i % durationVars.length]
              } ${
                directions[i % directions.length] === "up"
                  ? "animate-marquee-up"
                  : "animate-marquee-down"
              }`}
              style={{ animationDuration: "var(--dur)" }}
            >
              {[...column, ...column].map((org, j) => (
                <div
                  key={`${org.name}-${j}`}
                  className="relative mb-3 h-[125px] w-full overflow-hidden lg:mb-6 lg:h-[210px]"
                >
                  <Image
                    src={org.image}
                    alt={org.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA sits after the marquee: you see who's already here, then get asked to join */}
      <RevealItem
        inGroup={false}
        className="flex justify-center px-5 pt-8 pb-10 lg:pt-10 lg:pb-14"
      >
        <a
          href="/for-organisers"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-[14px] font-semibold tracking-[0.01em] text-white no-underline shadow-none transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.96] hover:scale-[1.02] lg:px-8 lg:py-3.5 lg:text-[15px]"
        >
          {/* Liquid glass fill — tinted so it reads on light page bg */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-accent/85 backdrop-blur-xl backdrop-saturate-150"
          />
          {/* Specular top highlight */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent"
          />
          {/* Soft rim light */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
          />
          {/* Fluid sheen on hover */}
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative z-10">Become an organiser</span>
          <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </RevealItem>
    </section>
  );
}
