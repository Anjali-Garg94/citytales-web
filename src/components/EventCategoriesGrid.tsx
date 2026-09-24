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
 * Pick your Vibe tiles — smaller photo on top, category name below.
 */
export default function EventCategoriesGrid({
  tiles,
}: {
  tiles: CategoryTile[];
}) {
  return (
    <motion.div
      className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 lg:mt-7 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-5"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(0.08)}
    >
      {tiles.map((tile) => (
        <motion.div key={tile.id} variants={fadeIn()}>
          <Link
            href={`/explore-events?category=${encodeURIComponent(tile.id)}`}
            className="group block no-underline"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] lg:rounded-[10px]">
              <RevealImage inGroup>
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              </RevealImage>
            </div>
            <div className="mt-2 font-serif text-[15px] leading-[1.2] font-semibold text-ink lg:mt-2.5 lg:text-[17px]">
              {tile.name}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
