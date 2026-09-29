# Fred's Pies — Private Demo App

Private Android and iOS customer demo for **Fred's Pies**, built with React Native, Expo SDK 57, Expo Router, TypeScript, Firebase Authentication, Firestore, and a staging-only Cloud Function.

## Features
- **Customer Home:** Wordmark, notification bell with unread badge, urgent announcement banner, search with instant local filtering, swipeable promotions carousel, category navigation, featured products, popular today, and announcements preview.
- **Promotions System:** Active deals carousel, promotion details, promo codes with one-tap copy, and full terms & conditions.
- **Announcements System:** Reverse-chronological feed, unread status tracker, detail view with CTA navigation, and dismissible urgent banner.
- **Demo pickup orders:** Authenticated customers can place simulated orders; no payment is collected and the bakery receives no real order.
- **Loyalty demo:** Points are added once by the trusted staging function after simulated checkout succeeds. Client-side point grants are disabled.
- **Cart & Availability:** Add-to-cart, promo codes for percentage and fixed-amount discounts, product availability, and peso (`₱`) currency formatting.
- **Dual Data Layer:** Runs out-of-the-box on rich mock data with zero configuration, or switches seamlessly to Firebase Cloud Firestore via `EXPO_PUBLIC_DATA_SOURCE=firebase`.

## Project Structure
```text
src/
├── app/                  # Expo Router (tabs, promotions, announcements)
├── components/           # UI, bakery, promotions, announcements components
├── context/              # CartContext, AnnouncementsContext
├── data/mock/            # Mock products, categories, promotions, announcements
├── services/             # Repository pattern (mock vs firebase)
├── lib/                  # Firebase initialization
├── types/                # TypeScript interfaces
├── constants/            # Theme, colors, spacing, typography
└── utils/                # Date helpers, price formatter
```

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```
  The local `.env` file is ignored by Git. Restrict the Firebase API key in Google Cloud Console to the actual app/domain and only the APIs the app needs; never put service-account credentials in the client app.
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Open in **Expo Go** by scanning the QR code with your mobile device (ensure phone and PC are on the same Wi-Fi network, or use `npx expo start --tunnel`).

## Production Deployment Checklist
- This repo is configured for a private staging demo, not production orders or real payments.
- Create a separate Firebase project whose ID ends in `-staging`; never point the demo build at production data.
- Enable Firebase Authentication (email/password), Firestore, Cloud Functions, and billing for the staging project.
- Configure the EAS `preview` environment with the staging `EXPO_PUBLIC_FIREBASE_*` values and `EXPO_PUBLIC_DATA_SOURCE=firebase`.
- Seed synthetic catalog data and deploy only to the staging project using [docs/deployment-runbook.md](docs/deployment-runbook.md).
- Run the environment validation using the EAS preview environment before building:
  ```bash
  eas env:exec --environment preview "npm run check:env"
  ```
- Run the project validation gate and Firebase emulator suites:
  ```bash
  npm run validate
  npm test
  npm run test:functions:unit
  npm run test:firebase
  ```
- Build private Android and iOS preview apps (requires EAS and Apple signing setup):
  ```bash
  eas build --profile preview --platform all
  ```
- Verify the complete test account flow on physical Android and iOS devices before inviting private testers.

## Final QA and Deployment Docs
- Final QA report: [docs/final-qa-report.md](docs/final-qa-report.md)
- Deployment runbook: [docs/deployment-runbook.md](docs/deployment-runbook.md)
- Firebase schema notes: [docs/firebase-schema.md](docs/firebase-schema.md)

## Release Status
The project implements a staging-only simulated checkout. It is not a production ordering or payment system. Cloud Functions deployment needs a billing-enabled staging project; real Firebase provisioning and signed device builds still require account access.
