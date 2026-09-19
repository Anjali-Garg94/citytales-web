import type { Metadata } from "next";
import "./globals.css";

/**
 * Helvetica Neue is used site-wide, for body copy and the headings that use
 * font-serif alike — see --font-sans / --font-serif in globals.css.
 */

export const metadata: Metadata = {
  title: "CityTales | What's On",
  description:
    "Markets, gigs, workshops, and meetups — find out what's happening around you before everyone else does.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
