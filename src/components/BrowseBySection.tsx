import Image from "next/image";
import { browseSections } from "@/lib/data";

export default function BrowseBySection() {
  return (
    <section className="border-t border-line px-5 pt-2 pb-14 lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:pb-16">
      <div className="mt-9 mb-[22px] font-serif text-[26px] font-semibold lg:mt-12 lg:mb-7 lg:text-[34px]">
        Browse by section
      </div>
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-6">
        {browseSections.map((section) => (
          <a
            key={section.title}
            href="#"
            className="group relative block h-[172px] overflow-hidden no-underline lg:h-[340px]"
          >
            <Image
              src={section.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[rgba(18,15,13,0.72)] to-transparent to-55%" />
            <div className="absolute right-[18px] bottom-4 left-[18px] lg:right-6 lg:bottom-[22px] lg:left-6">
              <div className="font-serif text-[22px] font-semibold text-white lg:text-[27px]">
                {section.title}
              </div>
              <div className="mt-[3px] text-xs text-[#E9E1D6] lg:mt-[5px] lg:text-[13px]">
                {section.description}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
