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
          <div className="font-serif text-[26px] font-medium leading-[1.15] lg:text-[34px]">
            Organisers you love
          </div>
        </RevealItem>
        <RevealItem className="mt-2 lg:mt-2.5">
          <div className="max-w-[300px] text-[13px] leading-[1.55] text-ink-soft lg:max-w-[420px] lg:text-sm">
            New experiences, new memories.
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
              mobile  4 × 140 + 3 × 12 gap = 596, band 620
              desktop 4 × 230 + 3 × 24 gap = 992, band 1000
            Change a tile height and this has to be recomputed, or the band
            ends up showing three-and-a-bit. */}
        <div
          className="flex h-[620px] gap-3 px-5 lg:mx-auto lg:h-[1000px] lg:max-w-[1280px] lg:gap-6 lg:px-20"
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
                  className="relative mb-3 h-[140px] w-full overflow-hidden lg:mb-6 lg:h-[230px]"
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
          className="flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-2 text-[14px] font-semibold tracking-[0.01em] text-white no-underline transition hover:gap-3 hover:brightness-110 lg:px-7 lg:py-2.5 lg:text-[15px]"
        >
          Become an organiser
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </RevealItem>
    </section>
  );
}
