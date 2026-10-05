import { NextResponse } from "next/server";

/**
 * Apple App Site Association — this is what makes iOS open citytales.in links in the
 * CityTales app (Universal Links) instead of just loading the page in Safari.
 *
 * Served at https://citytales.in/.well-known/apple-app-site-association
 * Requirements Apple enforces, all satisfied by this route handler:
 *   • HTTPS, no redirects (a 301/302 silently fails verification)
 *   • Content-Type: application/json
 *   • No file extension on the path
 *
 * appIDs = <Apple Developer Team ID>.<bundle identifier>
 *   Team ID  H72S2H29HS            — ios/citytalesApp.xcodeproj → DEVELOPMENT_TEAM
 *   Bundle   com.citytales.project — PRODUCT_BUNDLE_IDENTIFIER
 *
 * Keep the paths below in sync with:
 *   • ios/citytalesApp/citytalesApp.entitlements  (com.apple.developer.associated-domains)
 *   • the app's src/navigation/linking.js route config
 *
 * iOS caches this file via Apple's CDN. After changing it, delete and reinstall the app
 * to force a re-fetch — editing it will not take effect on an already-installed build.
 */

const APP_ID = "H72S2H29HS.com.citytales.project";

const association = {
  applinks: {
    details: [
      {
        appIDs: [APP_ID],
        components: [
          { "/": "/events/*", comment: "Event detail — what the app shares" },
          { "/": "/event/*", comment: "Event detail, legacy singular path" },
          { "/": "/business/*", comment: "Business detail" },
          { "/": "/checkin/*", comment: "QR check-in" },
          { "/": "/ticket/*", comment: "Ticket" },
          { "/": "/profile/*", comment: "Profile" },
        ],
      },
    ],
  },
};

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(association, {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600",
    },
  });
}
