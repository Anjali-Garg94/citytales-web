import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { ArrowRightIcon } from "@/components/Icons";
import RevealItem from "@/components/motion/RevealItem";

export const metadata: Metadata = {
  title: "About | CityTales",
};

const HAPPENINGS = ["Concerts", "Pottery workshops", "Food pop-ups", "Garba nights", "Open mics"];

export default function AboutPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-[720px] px-5 pt-8 pb-20 lg:px-6 lg:pt-14 lg:pb-28">
        <RevealItem inGroup={false}>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
            Our story
          </div>
          <h1 className="mt-3 font-serif text-[32px] leading-[1.1] font-medium text-balance text-ink lg:text-[46px] lg:leading-[1.06]">
            It started with two sisters and a lot of quiet Saturdays.
          </h1>
        </RevealItem>

        <RevealItem inGroup={false} className="mt-8 lg:mt-10">
          <p className="text-[15.5px] leading-[1.8] text-ink first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:font-serif first-letter:text-[52px] first-letter:leading-[0.8] first-letter:text-accent lg:text-[17px]">
            One had just moved back home to Ludhiana, the other was busy with work, and every Saturday
            ended the same way: scrolling through their phones, wondering what everyone else was doing.
          </p>
          <p className="mt-5 text-[15.5px] leading-[1.8] text-ink lg:text-[17px]">
            The city was buzzing. They just never heard about any of it until the day after, in
            someone&apos;s story.
          </p>
        </RevealItem>

        <RevealItem inGroup={false} className="mt-6 flex flex-wrap gap-2">
          {HAPPENINGS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-soft lg:text-[13px]"
            >
              {item}
            </span>
          ))}
        </RevealItem>

        <RevealItem inGroup={false} y={28} className="my-12 lg:my-16">
          <blockquote className="border-l-2 border-accent pl-5 font-serif text-[24px] leading-[1.3] text-balance text-ink lg:pl-7 lg:text-[32px]">
            &ldquo;Ludhiana never had nothing going on. Nobody had put it all in one place.&rdquo;
          </blockquote>
        </RevealItem>

        <RevealItem inGroup={false}>
          <p className="text-[15.5px] leading-[1.8] text-ink lg:text-[17px]">
            So one evening, over chai and a half-finished list of places they wanted to try, they made
            a promise: <span className="font-semibold">no one in their city should feel that lonely again.</span>
          </p>
          <p className="mt-5 text-[15.5px] leading-[1.8] text-ink lg:text-[17px]">
            CityTales is that list, grown up. Every event worth knowing about, in one place, so you can
            stop wondering and start going.
          </p>
        </RevealItem>

        <RevealItem
          inGroup={false}
          className="mt-14 flex flex-col items-center rounded-[24px] bg-accent-tint px-6 py-10 text-center lg:mt-20 lg:py-14"
        >
          <div className="font-serif text-[26px] leading-[1.2] text-ink lg:text-[34px]">
            Your Saturday is waiting.
          </div>
          <p className="mt-2 text-[14px] text-ink-soft lg:text-[15px]">
            See what&apos;s happening in Ludhiana this week.
          </p>
          <Link href="/explore-events?when=all" className="cta-pill cta-pill--hero mt-6">
            Start exploring
            <ArrowRightIcon className="cta-pill__arrow" />
          </Link>
        </RevealItem>
      </article>
    </PageShell>
  );
}
