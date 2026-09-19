import RevealItem from "./motion/RevealItem";

/**
 * The closing line. Given a slightly longer travel and a slower settle than
 * the rest of the page — it's the last thing read, and it should land rather
 * than arrive.
 *
 * The quote stands on its own now; the "The CityTales promise" eyebrow that
 * used to sit above it was removed. With one element left there is nothing to
 * stagger, so this is a plain RevealItem rather than a group.
 */
export default function BrandPromise() {
  return (
    <section className="px-7 py-16 text-center lg:px-20 lg:py-[88px] lg:pb-24">
      <RevealItem inGroup={false} y={32} duration={0.95}>
        <div className="mx-auto max-w-[760px] font-serif text-[26px] leading-[1.32] font-medium text-ink italic lg:text-[42px] lg:leading-[1.28]">
          &ldquo;If it&#39;s happening in your city, you&#39;ll find it
          here.&rdquo;
        </div>
      </RevealItem>
    </section>
  );
}
