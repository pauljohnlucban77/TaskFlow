# Fred's Pies Private Demo Deployment Runbook

## Demo guarantees

- This build is for private testers and staging data only.
- In Expo development builds that are not configured for staging, checkout is a device-local preview: it saves orders in app storage, does not sync with Firebase, and awards no points. Only a correctly configured staging build uses the trusted checkout Function.
- Checkout creates a simulated pickup order. It does not collect money and does not notify bakery staff.
- Successful simulated checkout awards loyalty points once. The client cannot set prices, payment status, order status, or points.
- The staging Firebase project ID must end in `-staging`; the callable function rejects other deployed projects.
- Mobile push notifications are not implemented. The announcements inbox is an in-app feature.

## 1. Create the staging project

1. Create a separate Firebase project with an ID ending in `-staging`, for example `freds-pies-demo-staging`.
2. Enable Email/Password under Firebase Authentication and create a Firestore database.
3. Upgrade this staging project to the Firebase billing plan required to deploy Cloud Functions. Set Google Cloud budget alerts and keep the function's `maxInstances` limit in place.
4. Do not use production Firebase config or customer data in this project.
5. Create a Firebase Web App in the staging project and add its config values to the EAS `preview` environment. Set `EXPO_PUBLIC_DATA_SOURCE=firebase` and `EXPO_PUBLIC_DEMO_MODE=true` there. Keep these app config values out of Git; never add service-account credentials to the app.

## 2. Install, seed, and deploy Firebase

Use Node.js 22.13 or newer (Expo SDK 57 minimum), install dependencies, and authenticate the Firebase CLI to the intended staging account.

```bash
npm ci
npm --prefix functions install
firebase login
npm --prefix functions run build
```

The Admin SDK seeder uses Application Default Credentials. Authenticate those credentials using the Google Cloud CLI, then seed only a project ID ending in `-staging`:

```bash
gcloud auth application-default login
npm run seed:staging -- --project-id=freds-pies-demo-staging
```

Before the first Functions deploy, provide `DEMO_STAGING_PROJECT_ID` when prompted or in the ignored `functions/.env.<project-id>` parameter file. Its value must exactly match the selected staging project ID.

Review the selected project ID, then deploy Firestore rules, indexes, and Functions to staging:

```bash
firebase deploy --only firestore,functions --project freds-pies-demo-staging
```

Create Firebase Auth test accounts in the staging project. Do not enable public customer access or deploy the demo checkout function to a production project.

## 3. Configure and build private Android/iOS previews

1. Configure the EAS `preview` environment with all six `EXPO_PUBLIC_FIREBASE_*` values for staging. The checked-in `eas.json` forces the preview profile to Firebase and demo mode.
2. Confirm the staging project ID ends in `-staging` and run:

```bash
eas env:exec --environment preview "npm run check:env"
npm run validate
npm test
npm run test:functions:unit
npm run test:firebase
eas build --profile preview --platform all
```

3. Register iOS tester devices/provisioning with EAS. The Android preview profile produces an installable APK.
4. Install the builds on physical devices and sign in with a staging test account.

## 4. Acceptance checklist

- Sign up, sign in, session restoration, and sign out work on Android and iOS.
- Catalog, product availability, and only percentage/fixed-amount promo codes load from staging.
- An unauthenticated customer cannot submit checkout.
- Checkout ignores client prices/totals, reads current product documents, rejects unavailable products and invalid/expired/ineligible promos, and creates a clearly labeled demo pickup order.
- Retrying the same request returns the same order and awards points once; failed calls award neither points nor an order.
- Customers can read only their own orders, profile, feedback, and points history. Client attempts to write orders or grant points are rejected by rules.
- Redemption remains atomic; points reflect checkout after navigating back to a screen with the loyalty balance.
- Confirmation and order history state that the order is simulated, not sent to the bakery, and not paid.
- No mobile push notification behavior is promised.

## 5. External steps not performed by repository changes

The Firebase staging project, billing plan and budget alerts, Authentication provider, staging config values, Google/Apple developer accounts, EAS credentials, and actual signed device installs must be provisioned and verified by the project owner. A public app-store launch or real payment processing is outside this demo release.
