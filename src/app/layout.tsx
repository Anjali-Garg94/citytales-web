import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import MotionProvider from "@/components/motion/MotionProvider";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { getCities } from "@/lib/api";

/**
 * Helvetica Neue is used site-wide, for body copy and the headings that use
 * font-serif alike — see --font-sans / --font-serif in globals.css.
 */

export const metadata: Metadata = {
  title: "CityTales | What's On",
  description:
    "Markets, gigs, workshops, and meetups — find out what's happening around you before everyone else does.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Loaded once here rather than client-side from the sign-up modal — the
  // dropdown renders already populated, no fetch-on-open + retry banner.
  const cities = await getCities();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans">
        <MotionProvider>
          {/* Renders nothing — starts Lenis for wheel/trackpad scrolling */}
          <SmoothScroll />
          <AuthProvider cities={cities}>
            {children}
            <AuthModal />
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
