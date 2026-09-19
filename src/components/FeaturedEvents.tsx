import Image from "next/image";
import { featuredEvents } from "@/lib/data";

export default function FeaturedEvents() {
  const [main, ...rest] = featuredEvents;

  return (
    <section className="border-t border-line px-5 pt-2 pb-14 lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:pb-16">
      <div className="mt-9 mb-6 font-serif text-[26px] font-semibold lg:mt-12 lg:mb-[30px] lg:text-[34px]">
        Featured this week
      </div>

      <div className="flex flex-col gap-9 lg:grid lg:grid-cols-[7fr_5fr] lg:gap-7">
        <a href="#" className="block no-underline">
          <div className="relative h-[240px] w-full overflow-hidden lg:h-[460px]">
            <Image src={main.image} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="mt-3.5 text-[11px] font-semibold tracking-[0.14em] text-accent uppercase lg:mt-[18px]">
            {main.eyebrow}
          </div>
          <div className="mt-1.5 font-serif text-xl font-semibold leading-[1.2] text-ink lg:mt-2 lg:text-[26px]">
            {main.title}
          </div>
          <div className="mt-1.5 text-[13px] text-ink-soft lg:mt-2 lg:text-[13.5px]">
            {main.meta}
          </div>
        </a>

        <div className="flex flex-col gap-9 lg:gap-7">
          {rest.map((event) => (
            <a key={event.title} href="#" className="block no-underline">
              <div className="relative h-[280px] w-full overflow-hidden lg:h-[206px]">
                <Image src={event.image} alt="" fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
              </div>
              <div className="mt-3.5 text-[11px] font-semibold tracking-[0.14em] text-accent uppercase lg:mt-3.5">
                {event.eyebrow}
              </div>
              <div className="mt-1.5 font-serif text-xl font-semibold leading-[1.2] text-ink lg:text-[19px] lg:leading-[1.25]">
                {event.title}
              </div>
              <div className="mt-1.5 text-[13px] text-ink-soft lg:text-[12.5px]">
                {event.meta}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
