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
2. Start the development server:
   ```bash
   npx expo start
   ```
3. Open in **Expo Go** by scanning the QR code with your mobile device (ensure phone and PC are on the same Wi-Fi network, or use `npx expo start --tunnel`).
