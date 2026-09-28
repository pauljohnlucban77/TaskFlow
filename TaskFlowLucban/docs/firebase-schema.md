# Fred's Pies — Firebase Schema & Integration Guide

## Collections & Fields

### 1. `categories`
- `id` (Document ID / string)
- `name` (string): e.g. "Pies", "Cakes", "Pastries"
- `icon` (string): emoji or icon name
- `sortOrder` (number)

### 2. `products`
- `id` (Document ID / string)
- `name` (string)
- `description` (string)
- `price` (number)
- `category` (string)
- `image` (string, optional)
- `available` (boolean)
- `stockStatus` ('available' | 'low_stock' | 'sold_out')
- `rating` (number, optional)
- `featured` (boolean)
- `popular` (boolean)
- `published` (boolean)
- `updatedAt` (Timestamp)

### 3. `promotions`
- `id` (Document ID / string)
- `title` (string)
- `subtitle` (string)
- `type` ('percent_off' | 'amount_off' | 'bundle' | 'free_item' | 'new_arrival' | 'seasonal')
- `code` (string, optional)
- `discountValue` (number, optional)
- `minSpend` (number, optional)
- `applicableCategoryIds` (array of strings, optional)
- `applicableProductIds` (array of strings, optional)
- `startsAt` (Timestamp)
- `endsAt` (Timestamp)
- `imageUrl` (string, optional)
- `backgroundColor` (string, optional)
- `terms` (array of strings)
- `active` (boolean)

### 4. `announcements`
- `id` (Document ID / string)
- `title` (string)
- `message` (string)
- `body` (string, optional)
- `type` ('info' | 'new_product' | 'store_hours' | 'closure' | 'holiday' | 'service_notice')
- `publishedAt` (Timestamp)
- `expiresAt` (Timestamp, optional)
- `pinned` (boolean)
- `imageUrl` (string, optional)
- `ctaLabel` (string, optional)
- `ctaRoute` (string, optional)

---

## Phase 2: Loyalty & Rewards Collections

### 5. `customers`
- `id` (Document ID = Auth UID)
- `name` (string)
- `email` (string)
- `points` (number): non-negative integer
- `createdAt` (Timestamp)

### 6. `rewards`
- `id` (Document ID / string)
- `name` (string)
- `description` (string)
- `pointsRequired` (number): positive integer
- `active` (boolean)

### 7. `loyalty_transactions`
- `id` (Document ID / string)
- `customerId` (string): Auth UID
- `type` ('earned' | 'redeemed')
- `points` (number): positive integer
- `purchaseAmount` (number, optional): when type == 'earned'
- `rewardId` (string, optional): when type == 'redeemed'
- `rewardName` (string, optional)
- `createdAt` (Timestamp)

---

## Phase 3: Customer Feedback & Rating Collection

### 8. `feedback`
- `id` (Document ID / string)
- `customerId` (string = Auth UID)
- `customerName` (string)
- `rating` (number): whole integer 1 to 5
- `comment` (string): max 500 characters
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### 9. `staff`
- `id` (Document ID = Staff Auth UID)
- `role` (string): e.g. "cashier" or "manager"
- `created` (Timestamp)

---

## Required Indexes
- `products`: `published` (Ascending) + `featured` (Descending)
- `promotions`: `active` (Ascending) + `startsAt` (Ascending)
- `announcements`: `publishedAt` (Descending)
- `loyalty_transactions`: `customerId` (Ascending) + `createdAt` (Descending)
- `feedback`: `customerId` (Ascending) + `createdAt` (Descending)

---

## How to Switch from Mock to Firebase
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Cloud Firestore** and **Firebase Authentication** (Email/Password provider).
3. Register a Web App in Project Settings and copy the configuration object.
4. Create a `.env` file in the project root (copy from `.env.example`) and fill in your Firebase web config credentials.
5. Set `EXPO_PUBLIC_DATA_SOURCE=firebase` in `.env`.
6. Deploy `firestore.rules` using the Firebase CLI or paste them in the Firestore Rules tab.
7. To test staff features (earning points), create a document in `staff/{YOUR_AUTH_UID}` in the Firestore console.
8. Restart the development server with cache cleared: `npx expo start -c`.
