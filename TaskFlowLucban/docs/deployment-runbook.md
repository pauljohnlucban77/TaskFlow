# Fred's Pies Customer App — Deployment Runbook

## 1. Prerequisites

- Node.js installed
- Expo CLI available
- Firebase project created
- Android and/or iOS signing configured for release builds
- Environment variables configured for production

## 2. Environment Setup

Copy the example env file and configure the real Firebase project values:

- cp .env.example .env
- Set EXPO_PUBLIC_DATA_SOURCE=firebase
- Fill in all required Firebase values

Required keys:
- EXPO_PUBLIC_FIREBASE_API_KEY
- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- EXPO_PUBLIC_FIREBASE_PROJECT_ID
- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
- EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- EXPO_PUBLIC_FIREBASE_APP_ID

## 3. Preflight Checks

Run the project validation gate before release:

- npm run check:env
- npm run validate
- npm test -- --runInBand

Expected result:
- Environment validation passes
- Lint passes
- TypeScript passes
- Regression tests pass

## 4. Firebase Setup

- Enable Firebase Auth for email/password if authentication is used
- Enable Firestore
- Import or configure the Firebase security rules for customers, rewards, feedback, promotions, and announcements
- Confirm the app uses authenticated customer UIDs correctly
- Confirm ownership checks are enforced in Firestore rules

## 5. Release Build

- Review all environment values for production
- Confirm EXPO_PUBLIC_DATA_SOURCE is set to firebase
- Run a release build in Expo
- Test on a real Android or iOS device
- Validate login, home, profile, products, reviews, loyalty, promotions, and announcements

## 6. Final QA Checklist

- App launches cleanly
- Firebase initializes without mock fallback in production
- Auth session works properly
- Customer profile loads and saves correctly
- Product search and browsing work
- Review save/edit/delete flows work
- Rewards and loyalty points update correctly
- Promotions and promo codes behave correctly
- Navigation and back navigation work correctly
- Error, loading, and empty states are functional
- No critical console errors remain

## 7. Launch Notes

This project is now release-hardened from a code, validation, and deployment-safety standpoint. However, final live production signoff still requires physical-device testing and a real backend validation pass before the app is declared fully production-certified.
