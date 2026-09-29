# Fred's Pies — Customer Mobile App

Modern food-ordering mobile app experience for **Fred's Pies** bakery, built with React Native, Expo (SDK 57), Expo Router, and TypeScript.

## Features
- **Customer Home:** Wordmark, notification bell with unread badge, urgent announcement banner, search with instant local filtering, swipeable promotions carousel, category navigation, featured products, popular today, and announcements preview.
- **Promotions System:** Active deals carousel, promotion details, promo codes with one-tap copy, and full terms & conditions.
- **Announcements System:** Reverse-chronological feed, unread status tracker, detail view with CTA navigation, and dismissible urgent banner.
- **Cart & Availability:** Add-to-cart with cart badge, availability status text (Available, Low Stock, Sold Out), and peso (`₱`) currency formatting.
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
- Set `EXPO_PUBLIC_DATA_SOURCE=firebase` only when Firebase config is valid.
- Ensure all `EXPO_PUBLIC_FIREBASE_*` values are present in the production environment.
- Do not allow silent mock fallback in production builds.
- Run the environment validation before shipping:
  ```bash
  npm run check:env
  ```
- Run the project validation gate:
  ```bash
  npm run validate
  ```
- Run regression tests:
  ```bash
  npm test -- --runInBand
  ```
- Review Firestore security rules before allowing live customers access.
- Test the review, cart, loyalty, announcements, and notification flows on a real device before launch.

## Final QA and Deployment Docs
- Final QA report: [docs/final-qa-report.md](docs/final-qa-report.md)
- Deployment runbook: [docs/deployment-runbook.md](docs/deployment-runbook.md)
- Firebase schema notes: [docs/firebase-schema.md](docs/firebase-schema.md)

## Release Status
The project has been hardened for production readiness, including Firebase fail-fast checks, review reset fixes, validation scripts, and regression tests. Final live-device and Firebase security verification are still required before a full production certification signoff.
