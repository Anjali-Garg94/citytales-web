import type { Metadata } from "next";
import type { ReactNode } from "react";
import ComingSoonPage from "@/components/ComingSoonPage";
import PageShell from "@/components/PageShell";
import { ChatIcon, InstagramIcon } from "@/components/Icons";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact us | CityTales",
};

type ContactCard = {
  key: string;
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
  iconClass: string;
  external: boolean;
};

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatWhatsapp(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return `+${d}`;
}

export default function ContactPage() {
  const email = CONTACT.email.trim();
  const whatsapp = CONTACT.whatsapp.replace(/\D/g, "");
  const instagram = CONTACT.instagram.trim().replace(/^@/, "");

  const cards: ContactCard[] = [];
  if (email) {
    cards.push({
      key: "email",
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      icon: <MailIcon className="h-5 w-5" />,
      iconClass: "bg-accent-tint text-accent-deep",
      external: false,
    });
  }
  if (whatsapp) {
    cards.push({
      key: "whatsapp",
      label: "WhatsApp",
      value: formatWhatsapp(whatsapp),
      href: `https://wa.me/${whatsapp}`,
      icon: <ChatIcon className="h-5 w-5" />,
      iconClass: "bg-[#E7F8EE] text-[#1FA855]",
      external: true,
    });
  }
  if (instagram) {
    cards.push({
      key: "instagram",
      label: "Instagram",
      value: `@${instagram}`,
      href: `https://instagram.com/${encodeURIComponent(instagram)}`,
      icon: <InstagramIcon className="h-5 w-5" />,
      iconClass:
        "bg-[radial-gradient(circle_at_30%_110%,#FDD674_0%,#F77737_25%,#E1306C_50%,#C13584_72%,#833AB4_100%)] text-white",
      external: true,
    });
  }

  if (cards.length === 0) {
    return (
      <ComingSoonPage
        eyebrow="Get in touch"
        title="Contact page coming soon"
        description="A direct way to reach the CityTales team is on its way. In the meantime, reach out via our socials."
      />
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-[720px] px-5 pt-8 pb-20 lg:px-6 lg:pt-14 lg:pb-28">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em] text-ink lg:text-[36px]">
          Contact us
        </h1>
        <p className="mt-3 max-w-[480px] text-[14px] leading-[1.6] text-ink-soft lg:text-[15px]">
          Questions, feedback or want to list your event? Reach the CityTales team here.
        </p>

        <ul className="mt-8 flex flex-col gap-3 lg:mt-10">
          {cards.map((card) => (
            <li key={card.key}>
              <a
                href={card.href}
                {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3.5 rounded-[16px] border border-line bg-white px-4 py-3.5 no-underline transition hover:border-ink lg:px-5 lg:py-4"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.iconClass}`}
                >
                  {card.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-ink-soft lg:text-[13px]">
                    {card.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[15px] font-semibold text-ink lg:text-[16px]">
                    {card.value}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
