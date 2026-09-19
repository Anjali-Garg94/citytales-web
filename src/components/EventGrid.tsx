import Image from "next/image";
import { eventGrid } from "@/lib/data";

export default function EventGrid() {
  return (
    <section className="px-5 pt-2 pb-14 lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:pb-16">
      <div className="mt-9 mb-5 flex items-baseline justify-between lg:mt-12 lg:mb-[26px]">
        <div className="font-serif text-[26px] font-semibold lg:text-[34px]">
          Everything on
        </div>
        <a
          href="#"
          className="text-xs font-semibold tracking-[0.04em] text-accent no-underline lg:text-[13px]"
        >
          See all events →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-6">
        {eventGrid.map((event) => (
          <div key={event.title} className={event.tall ? "lg:row-span-2" : ""}>
            <div
              className={`relative w-full overflow-hidden ${
                event.tall ? "h-[172px] lg:h-[360px]" : "h-[132px] lg:h-[170px]"
              }`}
            >
              <Image
                src={event.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="mt-2.5 text-[10px] font-semibold tracking-[0.14em] text-accent uppercase lg:mt-3 lg:text-[10.5px]">
              {event.category}
            </div>
            <div className="mt-[3px] font-serif text-[14.5px] font-semibold leading-[1.25] lg:mt-1 lg:text-base">
              {event.title}
            </div>
            <div className="mt-1 text-[10.5px] text-ink-soft lg:text-[11.5px]">
              {event.venue}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
