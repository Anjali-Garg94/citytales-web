import { NextResponse } from "next/server";

/**
 * Digital Asset Links — this is what makes Android open citytales.in links in the
 * CityTales app (App Links) instead of just loading the page in Chrome.
 *
 * Served at https://citytales.in/.well-known/assetlinks.json
 * Paired with android:autoVerify="true" on the intent filters in AndroidManifest.xml.
 *
 * ⚠️  THE FINGERPRINT MUST MATCH THE CERTIFICATE THE INSTALLED APP IS SIGNED WITH.
 *
 *   • Play App Signing ON (the default for apps published since 2021 — and the
 *     "citytales-upload" keystore name strongly suggests it is on here):
 *     the correct value is the SHA-256 under
 *        Play Console → your app → Test and release → Setup → App signing
 *        → "App signing key certificate"
 *     The UPLOAD key fingerprint is NOT the one Android checks, because Play re-signs
 *     the AAB with the app signing key before it reaches the device.
 *
 *   • Play App Signing OFF: the upload keystore fingerprint below is the right one.
 *
 * The array accepts several fingerprints, so ADD the Play app-signing SHA-256 next to
 * the one below rather than replacing it — that way locally-built release APKs and
 * Play-distributed builds both verify.
 *
 * Verify after deploying:
 *   https://developers.google.com/digital-asset-links/tools/generator
 *   adb shell pm verify-app-links --re-verify com.app.citytales
 *   adb shell pm get-app-links com.app.citytales     → want "verified"
 */

const SHA256_CERT_FINGERPRINTS = [
  // android/app/citytales-upload.keystore, alias "citytales-upload".
  // Correct only if Play App Signing is OFF — see the note above.
  "36:02:9E:04:2E:1F:17:DF:6A:A0:63:CC:56:0A:6F:94:3B:96:3A:57:42:55:44:8A:0B:0A:F1:97:40:B2:A0:7F",
];

const statements = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.app.citytales",
      sha256_cert_fingerprints: SHA256_CERT_FINGERPRINTS,
    },
  },
];

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(statements, {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600",
    },
  });
}
