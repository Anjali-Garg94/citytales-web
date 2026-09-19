import Link from "next/link";
import { InstagramIcon, ChatIcon } from "./Icons";

const explore = [
  { label: "Today", href: "/today" },
  { label: "Clubs", href: "/clubs" },
  { label: "Activities", href: "/activities" },
  { label: "Exhibitions", href: "/exhibitions" },
];

const cityTalesLinks = [
  { label: "About", href: "/about" },
  { label: "List your event", href: "/for-organisers" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-bg px-5 pt-11 pb-10 lg:px-20 lg:pt-14 lg:pb-9">
      <div className="lg:mx-auto lg:grid lg:max-w-[1280px] lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
        <div>
          <div className="font-serif text-[22px] font-bold lg:text-2xl">CityTales</div>
          <div className="mt-1.5 text-[11.5px] tracking-[0.04em] text-ink-soft lg:text-xs">
            WHAT&#39;S ON
          </div>
          <div className="mt-5 hidden max-w-[260px] text-[13px] leading-[1.6] text-ink-soft lg:block">
            If it&#39;s happening in your city, you&#39;ll find it here.
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-7 lg:mt-0 lg:contents">
          <div>
            <div className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-ink-soft lg:mb-3.5">
              EXPLORE
            </div>
            <div className="flex flex-col gap-2.5 text-sm lg:gap-[11px]">
              {explore.map((link) => (
                <Link key={link.label} href={link.href} className="text-ink no-underline hover:text-accent">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-ink-soft lg:mb-3.5">
              CITYTALES
            </div>
            <div className="flex flex-col gap-2.5 text-sm lg:gap-[11px]">
              {cityTalesLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-ink no-underline hover:text-accent">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-ink-soft lg:mb-3.5">
              GET THE APP
            </div>
            <div className="flex gap-2.5 lg:flex-col lg:gap-2.5">
              <div className="w-fit border border-line px-3.5 py-2 text-xs font-medium lg:px-4 lg:py-[9px] lg:text-[12.5px]">
                App Store
              </div>
              <div className="w-fit border border-line px-3.5 py-2 text-xs font-medium lg:px-4 lg:py-[9px] lg:text-[12.5px]">
                Google Play
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-9 flex items-center justify-between pt-5 lg:mx-auto lg:mt-12 lg:max-w-[1280px] lg:pt-[22px]">
        <div className="text-[11px] text-ink-soft lg:text-[11.5px]">
          © 2026 CityTales
        </div>
        <div className="flex gap-3.5 lg:gap-4">
          <InstagramIcon className="h-4 w-4 text-ink-soft lg:h-[17px] lg:w-[17px]" />
          <ChatIcon className="h-4 w-4 text-ink-soft lg:h-[17px] lg:w-[17px]" />
        </div>
      </div>
    </footer>
  );
}
