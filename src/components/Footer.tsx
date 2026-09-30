import Link from "next/link";
import { InstagramIcon, ChatIcon, BellIcon } from "./Icons";
import { CONTACT } from "@/lib/contact";
import { APP_STORE } from "@/lib/apps";

const cityTalesLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-bg px-5 pt-11 pb-10 lg:px-20 lg:pt-14 lg:pb-9">
      <div className="lg:mx-auto lg:grid lg:max-w-[1280px] lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
        <div>
          <div className="font-serif text-[22px] font-bold lg:text-2xl">CityTales</div>
          <div className="mt-5 hidden max-w-[260px] text-[13px] leading-[1.6] text-ink-soft lg:block">
            If it&#39;s happening in your city, you&#39;ll find it here.
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-7 lg:mt-0 lg:contents">
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
            <p className="mb-3 flex max-w-[260px] items-start gap-2 text-[13px] leading-[1.5] text-ink-soft lg:mb-3.5">
              <BellIcon className="mt-px h-4 w-4 shrink-0 text-accent" />
              Get reminders before your saved events start.
            </p>
            <div className="flex gap-2.5 lg:flex-col lg:gap-2.5">
              <a
                href={APP_STORE.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Download ${APP_STORE.name} on the App Store`}
                className="w-fit border border-line px-3.5 py-2 text-xs font-medium text-ink no-underline transition hover:border-ink lg:px-4 lg:py-[9px] lg:text-[12.5px]"
              >
                App Store
              </a>
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
        <div className="flex items-center gap-3.5 lg:gap-4">
          <a
            href={`https://www.instagram.com/${CONTACT.instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CityTales on Instagram"
            className="text-ink-soft transition hover:text-ink"
          >
            <InstagramIcon className="h-4 w-4 lg:h-[17px] lg:w-[17px]" />
          </a>
          <Link
            href="/contact"
            aria-label="Contact us"
            className="text-ink-soft transition hover:text-ink"
          >
            <ChatIcon className="h-4 w-4 lg:h-[17px] lg:w-[17px]" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
