"use client";

import { ArrowRightIcon } from "./Icons";
import RevealItem from "./motion/RevealItem";

/** Post–Live Music CTA — create / list an event. */
export default function CreateEventCta() {
  return (
    <RevealItem
      inGroup={false}
      className="flex justify-center px-5 pt-10 pb-10 lg:pt-12 lg:pb-14"
    >
      <a href="/for-organisers" className="cta-pill">
        Create your own event
        <ArrowRightIcon className="cta-pill__arrow" />
      </a>
    </RevealItem>
  );
}
