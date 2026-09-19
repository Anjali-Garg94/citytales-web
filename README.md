# CityTales Website

The CityTales marketing homepage ("What's On Ludhiana"), built with Next.js 16 (App Router), Tailwind CSS v4, and Framer Motion — coded from the Mobile/Desktop design mockup.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** — utility classes matching the mockup's spacing/typography almost 1:1
- **Framer Motion** — hero entrance animation, card hover/scroll-reveal animations
- **next/font/google** — Playfair Display (serif headings) + DM Sans (body/UI)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site is fully responsive — resize the window or use your browser's device toolbar to check the mobile layout (it breaks at Tailwind's `lg` = 1024px, matching the Mobile/Desktop mockup split).

## Build

```bash
npm run build
npm start
```

> **Note on fonts:** `next/font/google` fetches Playfair Display and DM Sans from Google Fonts at build time. This requires normal internet access — if you build behind a restrictive proxy/firewall that blocks `fonts.googleapis.com`, the build will fail on the font step. It will build cleanly on a normal machine, Vercel, Netlify, or any standard CI runner.

## Project structure

```
src/
  app/
    page.tsx              # homepage — assembles all sections
    layout.tsx             # fonts, metadata, global <html>/<body>
    globals.css             # brand color tokens, marquee keyframes
    today/, clubs/, activities/, exhibitions/,
    about/, contact/, get-the-app/, this-week/,
    for-organisers/         # placeholder routes (site skeleton) — swap
                             # ComingSoonPage content for real pages later
  components/
    Header.tsx, Hero.tsx, OrganisersMarquee.tsx,
    TodayEvents.tsx, ThisWeek.tsx, EventCategories.tsx,
    FeaturedEvents.tsx, BrowseBySection.tsx, EventGrid.tsx,
    BrandPromise.tsx, Footer.tsx
    PageShell.tsx, ComingSoonPage.tsx   # shared shell for stub pages
    Icons.tsx                # inline SVG icon set
  lib/
    data.ts                  # all copy/content as typed arrays —
                              # swap for a real API/CMS later
public/
  images/
    hero/        # the two real photos used in the hero collage
    organisers/  # the 12 real organiser photos (from your carousel API)
    events/      # placeholder event photography
```

## Backend API

The organisers marquee is wired to the live CityTales backend:

```
GET {NEXT_PUBLIC_API_BASE_URL}/api/v1/public/website/carousel
→ [{ id, name, coverUrl, column, position }, ...]
```

`src/lib/api.ts` fetches it **server-side** (the backend is plain HTTP, so a
browser-side fetch from an HTTPS site would be blocked as mixed content),
groups records into the three marquee columns by `column`, orders each by
`position`, and caches the response for an hour (`revalidate: 3600`).

If the API is unreachable or returns something unexpected, it logs the reason
and falls back to the bundled static organisers in `src/lib/data.ts`, so a
backend outage never breaks the page.

Set the base URL in `.env.local` (copy `.env.example`):

```
NEXT_PUBLIC_API_BASE_URL=http://139.59.80.51:8080
```

The organiser images are served from CloudFront, which is allowlisted for
`next/image` in `next.config.ts` under `images.remotePatterns`. Adding another
image host means adding it there too, or `next/image` will refuse to load it.

## What's real vs. placeholder

- **Organisers marquee**: live — fetched from your `carousel` API on every server render (hourly cache).
- **Hero photos**: real — the three photos you supplied.
- **Event listings (Today's Events, This Week, Featured, Event Grid, categories)**: placeholder copy and stock-style imagery carried over from the design mockup — wire these to your real events API the same way `src/lib/api.ts` does for organisers, replacing the arrays in `src/lib/data.ts`.
- **Nav destination pages** (`/today`, `/clubs`, `/activities`, `/exhibitions`, `/about`, `/contact`, `/get-the-app`, `/this-week`, `/for-organisers`): "coming soon" placeholders sharing the site's Header/Footer chrome — this is the routing skeleton for pages you'll build out next.

## Design fidelity

This was coded directly from the two `.dc.html` design mockup artboards (Mobile 390px / Desktop 1440px) — spacing, type scale, colors, and layout breakpoints all carried over 1:1 where Tailwind's scale allows, with `lg:` variants covering the desktop layout. The organiser marquee's auto-scroll and the hero collage's entrance/hover animations use Framer Motion + CSS keyframes rather than being static.
