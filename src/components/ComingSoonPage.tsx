import Link from "next/link";
import PageShell from "./PageShell";

export default function ComingSoonPage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <PageShell>
      <section className="flex min-h-[50vh] flex-col justify-center px-5 py-20 text-center lg:px-20 lg:py-32">
        <div className="mx-auto text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
          {eyebrow}
        </div>
        <h1 className="mx-auto mt-4 max-w-[560px] font-serif text-[32px] font-semibold leading-[1.15] text-ink lg:text-[44px]">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[420px] text-sm leading-[1.6] text-ink-soft lg:text-base">
          {description}
        </p>
        <Link
          href="/"
          className="mx-auto mt-7 w-fit text-[13px] font-semibold tracking-[0.03em] text-accent no-underline hover:text-accent-deep"
        >
          ← Back to home
        </Link>
      </section>
    </PageShell>
  );
}
