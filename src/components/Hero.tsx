"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "./Icons";
import Parallax from "./motion/Parallax";

const cards = [
  {
    src: "/images/hero/hero-sunflower.jpg",
    alt: "Woman with raised arms in a sunflower field",
    /**
     * Only the two large cards drift on scroll. The small ones (the DJ strip,
     * the pool circle) are too short for the movement to read as anything but
     * jitter, and a collage where every piece moves separately is noise.
     */
    parallax: true,
    className:
      "left-[40%] top-0 h-[64%] w-[56%] z-[1] shadow-[0_20px_40px_-14px_rgba(30,26,22,0.28)] rounded-2xl lg:left-auto lg:right-[-3%] lg:top-0 lg:h-[62%] lg:w-[58%] lg:rounded-[18px] lg:shadow-[0_26px_50px_-16px_rgba(30,26,22,0.3)]",
  },
  {
    src: "/images/hero/hero-fair-couple.jpg",
    alt: "Couple laughing at a nighttime fair with a Ferris wheel behind them",
    parallax: true,
    className:
      "left-[2%] top-[10%] h-[56%] w-[44%] z-[3] shadow-[0_16px_32px_-14px_rgba(30,26,22,0.24)] rounded-2xl lg:left-[2%] lg:top-[12%] lg:h-[58%] lg:w-[42%] lg:rounded-[18px] lg:shadow-[0_22px_42px_-16px_rgba(30,26,22,0.26)]",
  },
  {
    src: "/images/hero/hero-star-smile.jpg",
    alt: "Woman smiling with colorful star stickers on a yellow background",
    className:
      "left-[18%] bottom-0 h-[46%] w-[40%] z-[3] shadow-[0_18px_36px_-14px_rgba(30,26,22,0.26)] rounded-2xl lg:left-[18%] lg:h-[50%] lg:w-[38%] lg:rounded-[18px] lg:shadow-[0_24px_46px_-16px_rgba(30,26,22,0.28)]",
  },
  {
    src: "/images/hero/hero-kids-pool.jpg",
    alt: "Kid floating in a pool with an inflatable ring",
    className:
      "right-[8%] bottom-0 h-36 w-36 z-[4] shadow-[0_14px_28px_-12px_rgba(30,26,22,0.3)] rounded-full lg:right-[20%] lg:bottom-0 lg:h-[220px] lg:w-[220px] lg:shadow-[0_18px_34px_-14px_rgba(30,26,22,0.32)]",
  },
];

export default function Hero() {
  return (
    <section className="grid lg:min-h-[640px] lg:grid-cols-[38fr_62fr]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col justify-center px-5 pt-2 pb-6 lg:justify-start lg:bg-bg lg:px-16 lg:pt-8 lg:pb-14"
      >
        <h1 className="font-serif text-[30px] font-medium leading-[1.1] text-balance text-ink lg:text-[42px] lg:leading-[1.06]">
          <span className="block text-balance">Your city didn&#39;t stay home.</span>
          <span className="block text-balance">Neither should you.</span>
        </h1>
        <p className="mt-3 max-w-[320px] text-sm leading-[1.6] text-ink-soft lg:mt-5 lg:max-w-[380px] lg:text-[14.5px]">
          Live music, workshops, food, fitness and many more.
        </p>
        <a href="/explore-events" className="cta-pill mt-5 lg:mt-7">
          Start exploring
          <ArrowRightIcon className="cta-pill__arrow" />
        </a>
      </motion.div>

      <div className="relative h-[420px] overflow-hidden px-5 pt-2 pb-9 lg:h-auto lg:pt-11 lg:pr-16 lg:pb-11 lg:pl-6">
        <div className="relative h-full w-full">
          {cards.map((card, i) => (
            <motion.div
              key={card.src}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.1, ease: "easeOut" }}
              className={`absolute overflow-hidden ${card.className}`}
            >
              {card.parallax ? (
                <Parallax>
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 60vw"
                    className="object-cover"
                  />
                </Parallax>
              ) : (
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 60vw"
                  className="object-cover"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
