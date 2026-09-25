"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EASE, viewport } from "./motion/variants";

export type CategoryTile = {
  id: string;
  name: string;
  label: string;
  image: string;
};

/**
 * Pick your Vibe tiles — photo on top, name below.
 * Diagonal cascade on scroll + soft lift/zoom on hover.
 */
export default function EventCategoriesGrid({
  tiles,
}: {
  tiles: CategoryTile[];
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 lg:mt-7 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-5">
      {tiles.map((tile, i) => {
        // Two-column cascade on mobile; four-column on desktop (approx via index).
        const col = i % 2;
        const row = Math.floor(i / 2);
        const delay = Math.min(row, 3) * 0.09 + col * 0.06;

        return (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.65, ease: EASE, delay }}
          >
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <Link
                href={`/explore-events?category=${encodeURIComponent(tile.id)}`}
                className="group block no-underline"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] lg:rounded-[10px]">
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.06 }}
                    whileInView={{ scale: 1 }}
                    viewport={viewport}
                    transition={{ duration: 0.9, ease: EASE, delay: delay + 0.05 }}
                  >
                    <Image
                      src={tile.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                    />
                  </motion.div>
                  {/* Soft light sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition duration-700 group-hover:translate-x-full group-hover:opacity-100"
                  />
                </div>
                <motion.div
                  className="mt-2 font-serif text-[15px] leading-[1.2] font-semibold text-ink transition-colors duration-300 group-hover:text-accent lg:mt-2.5 lg:text-[17px]"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.5, ease: EASE, delay: delay + 0.12 }}
                >
                  {tile.name}
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
