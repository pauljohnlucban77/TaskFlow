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
- `lastRedemptionId` (string, optional): transaction ID paired with the latest atomic redemption

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
- `orderId` (string, optional): originating order ID for demo checkout points
- `source` (`simulated_checkout`, optional): identifies staging demo awards
- `createdAt` (Timestamp)

### 8. `orders`
- `id` (Document ID): `{Auth UID}_{requestId}` for idempotency
- `customerId` (string): Auth UID
- `requestId` (string): client-generated retry key
- `items` (array): product ID, server-read name/price, quantity, and line total
- `subtotal`, `discount`, `total` (number): server-calculated Philippine pesos
- `pointsAwarded` (integer)
- `promoCode`, `promoId` (string or null, optional)
- `fulfillmentType` (`pickup`)
- `paymentMode` (`simulated`), `paymentStatus` (`simulated_success`)
- `status` (`demo_confirmed`), `isDemo` (true)
- `createdAt` (Timestamp)

Orders and simulated checkout point awards are created by the trusted Admin SDK function. Authenticated customers cannot create profiles or award transactions from the client. A first simulated checkout creates a customer's points profile when it grants points; customers can still read an absent profile as a zero balance.

Orders and loyalty awards are written atomically by the authenticated `completeDemoCheckout` Cloud Function using the Admin SDK. App clients can read only their own orders; they cannot create orders, set simulated payment state, or grant points. Checkout applies only active `percent_off` and `amount_off` promos and calculates percentage discounts over eligible item lines. Client reward redemption is atomic and validated against an active reward and its current point cost in Firestore rules.

---

## Phase 3: Customer Feedback & Rating Collection

### 9. `feedback`
- `id` (Document ID / string)
- `customerId` (string = Auth UID)
- `customerName` (string)
- `rating` (number): whole integer 1 to 5
- `comment` (string): max 500 characters
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

---

## Required Indexes
- `products`: `published` (Ascending) + `featured` (Descending)
- `promotions`: `active` (Ascending) + `startsAt` (Ascending)
- `announcements`: `publishedAt` (Descending)
- `loyalty_transactions`: `customerId` (Ascending) + `createdAt` (Descending)
- `feedback`: `customerId` (Ascending) + `createdAt` (Descending)
- `orders`: `customerId` (Ascending) + `createdAt` (Descending), optional if server-side ordering is later restored. The customer app currently filters by customer ID and sorts the returned orders locally to avoid requiring a composite index on existing Firebase projects.

---

## Staging setup

Follow [the private demo deployment runbook](deployment-runbook.md). This Firebase configuration is staging-only: the Cloud Function requires a matching project ID ending in `-staging`, and the local Admin SDK seeder refuses other project IDs.
