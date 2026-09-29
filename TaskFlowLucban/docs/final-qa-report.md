# Fred's Pies Private Demo QA Report

## Release status

**Implementation is present, but tester release is blocked. This is not a production release or payment system.** The app has a staging-only simulated pickup checkout, customer order history, server-calculated totals, and atomic simulated points awards. Do not distribute it until Firebase rules and Functions emulator tests pass, a dedicated staging project is provisioned and deployed, and Android/iOS preview builds pass physical-device smoke checks.

## Implemented safeguards and flows

- Cloud Function requires authentication and a configured staging Firebase project whose ID ends in `-staging`.
- The client submits product IDs, quantities, an optional code, and an idempotency request ID; Firestore product and promotion documents determine the order values.
- Only active percentage-off and fixed-amount promotions are accepted, with discount applied to eligible lines.
- The function creates a clearly labeled simulated order and awards points in one Firestore transaction. A retry with the same request ID returns the existing order.
- Non-staging Expo development builds support a separate device-local preview order path so the cart-to-history UI can be exercised without writing to another Firebase project. These records do not sync and award no points; staging builds continue to use the callable Function.
- Firestore clients cannot create/change orders or award points. Customers can read only their own order records.
- Synthetic catalog seeding uses the Admin SDK and rejects project IDs that do not end in `-staging`.
- EAS has a private preview profile for Android APK and iOS internal distribution.

## Automated verification

Run on 2026-09-30 in the project workspace:

- **Pass:** `npm run validate` — environment validation, lint, and TypeScript passed with no lint warnings after removing unused variables from both product detail screens.
- **Pass:** `npm test` — 8 tests passed.
- **Pass:** `npm run test:functions:unit` — Functions compiled and all 6 checkout logic tests passed.
- **Pass:** `npx expo export --platform android --output-dir .tmp-export-local-order-check` — Android bundle completed with the device-local order preview path included.
- **Pass:** `npm --prefix functions ci` — Functions lockfile installs reproducibly.
- **Pass:** `npm --prefix functions audit --omit=dev` — 0 runtime vulnerabilities.
- **Pass:** `npx tsc -p functions/tsconfig.json --noEmit` — Functions type check passed.
- **Pass:** `npx expo config --type public` — Expo configuration resolved with Android/iOS identifiers and version values.
- **Pass:** `npx expo export --platform android --output-dir .tmp-export-verified` — Metro bundled the configured `src/app` route tree for Android. Metro discarded an incompatible old cache and completed a full crawl.
- **Blocked:** `npm run test:firebase` — could not start: local Firebase CLI has no login and only Java 17 is installed; the installed Firebase CLI requires Java 21 or later. Install a supported JDK, authenticate the CLI, then rerun this test suite.
- **Pass:** `npm --prefix functions audit --omit=dev` — 0 vulnerabilities after updating to Firebase Admin 14.5 and Functions 7.4, with a scoped Cloud Storage `gaxios` 7 override. Recheck this override with Firebase package updates.
- **Not run:** Android/iOS cloud builds, physical installs, and device smoke tests; these require EAS credentials, iOS test-device provisioning, and the actual staging project.

## External release gates

- Create a dedicated billing-enabled Firebase staging project, ending `-staging`; enable email/password Auth, Firestore, Functions, and budget alerts. A staging project ID/config is not present in this repository yet.
- The current local `.env` selects Firebase but points to a non-staging project and does not enable demo mode. Checkout intentionally refuses to run with that configuration. Replace it with the staging web config and set `EXPO_PUBLIC_DEMO_MODE=true`, then deploy `completeDemoCheckout` to that staging project.
- Configure EAS `preview` variables with that project's Firebase web config; do not use production data or service-account keys in the app.
- Deploy Firestore rules, indexes, and the staging-only function; seed synthetic catalog data and create demo Auth accounts.
- Build and install signed private previews on physical Android and iOS devices. Test sign-in/out, browse, promo validation, unavailable product rejection, simulated checkout, idempotent retry, order history, balance refresh, and reward redemption.
- Verify the demo UI never suggests a real charge or that the bakery received the order. Push notifications and real payment processing are out of scope.

## Known limitations

- Simulated orders are not sent to bakery staff and do not represent real paid orders.
- Loyalty awards in this demo are tied only to the trusted simulated-success function and must not be reused as production payment verification.
- Firebase project creation, billing, EAS credentials, tester device provisioning, deployment, and physical-device verification require project-owner accounts and have not been performed by source changes.
