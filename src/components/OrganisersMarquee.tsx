import Image from "next/image";
import { getOrganiserColumns } from "@/lib/api";
import { ArrowRightIcon } from "./Icons";

const directions: ("up" | "down")[] = ["up", "down", "up"];
const durationVars = ["[--dur:32s] lg:[--dur:34s]", "[--dur:35s] lg:[--dur:38s]", "[--dur:29s] lg:[--dur:31s]"];

export default async function OrganisersMarquee() {
  const organiserColumns = await getOrganiserColumns();

  return (
    <section className="overflow-hidden border-t border-line">
      <div className="px-5 pt-9 pb-[22px] lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:pt-12 lg:pb-7">
        <div className="font-serif text-[26px] font-semibold leading-[1.15] lg:text-[34px]">
          Organisers you love
        </div>
        <div className="mt-2 max-w-[300px] text-[13px] leading-[1.55] text-ink-soft lg:mt-2.5 lg:max-w-[420px] lg:text-sm">
          New experiences, new memories.
        </div>
      </div>

      <div
        className="flex h-[400px] gap-3 px-5 lg:mx-auto lg:h-[600px] lg:max-w-[1280px] lg:gap-6 lg:px-20"
        style={{
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        }}
      >
        {organiserColumns.map((column, i) => (
          <div key={i} className="flex-1 overflow-hidden">
            <div
              className={`flex flex-col gap-3 lg:gap-6 ${
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
                  className="relative h-[140px] w-full overflow-hidden lg:h-[290px]"
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

      {/* CTA sits after the marquee: you see who's already here, then get asked to join */}
      <div className="flex justify-center px-5 pt-8 pb-10 lg:pt-10 lg:pb-14">
        <a
          href="/for-organisers"
          className="flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14px] font-semibold tracking-[0.01em] text-white no-underline transition hover:gap-3 hover:brightness-110 lg:px-7 lg:py-3.5 lg:text-[15px]"
        >
          Become an organiser
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
