"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import RevealImage from "./motion/RevealImage";
import { fadeIn, staggerParent, viewport } from "./motion/variants";

export type CategoryTile = {
  id: string;
  name: string;
  label: string;
  image: string;
};

/**
 * The mood tiles. Split out from EventCategories so that section stays an
 * async server component and only the reveal runs on the client.
 *
 * These are the one place on the page where pictures get the full image
 * treatment rather than a card-level fade: they're large and deliberate, and
 * the tile's existing `overflow-hidden` gives the movement something to be
 * masked by. The tile fades as a unit while the photo slides up inside it —
 * the frame stays put, the picture arrives into it.
 */
export default function EventCategoriesGrid({
  tiles,
}: {
  tiles: CategoryTile[];
}) {
  return (
    <motion.div
      className="mt-5 grid grid-cols-2 gap-3.5 lg:mt-7 lg:grid-cols-4 lg:gap-5"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(0.08)}
    >
      {tiles.map((tile) => (
        <motion.div key={tile.id} variants={fadeIn()}>
          <Link
            href={`/events?category=${encodeURIComponent(tile.label)}`}
            className="group relative block aspect-[4/3] overflow-hidden rounded-[8px] no-underline lg:rounded-[10px]"
          >
            <RevealImage inGroup>
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            </RevealImage>

            <div className="absolute right-0 bottom-0 left-0 px-3.5 pt-3.5 pb-2 lg:px-4 lg:pb-2.5">
              <div className="font-serif text-[16px] leading-[1.15] font-semibold text-ink lg:text-[18px]">
                {tile.name}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
