import { Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";

function HeaderFallback() {
  return (
    <header className="flex items-center justify-between px-5 py-[18px] lg:px-20 lg:py-6">
      <span className="text-[11px] font-semibold tracking-[0.14em] text-ink uppercase">
        City Tales
      </span>
      <div className="ml-auto h-10 w-24 lg:hidden" aria-hidden />
    </header>
  );
}

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
