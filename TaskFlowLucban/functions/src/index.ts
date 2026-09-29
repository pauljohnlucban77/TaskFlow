import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { DocumentData, DocumentReference } from 'firebase-admin/firestore';
import { defineString } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { calculateCheckout, isAllowedStagingProject, parseCartItems, parseRequestId } from './checkoutLogic';
import type { CheckoutPromotion, PricedLine } from './checkoutLogic';

if (getApps().length === 0) initializeApp();

const db = getFirestore();
const stagingProjectId = defineString('DEMO_STAGING_PROJECT_ID');

setGlobalOptions({ region: 'asia-east1', maxInstances: 2 });

function fail(code: ConstructorParameters<typeof HttpsError>[0], message: string): never {
  throw new HttpsError(code, message);
}

function toMillis(value: unknown, fallback: number): number {
  if (value == null) return fallback;
  if (typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return fallback;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapPromotion(id: string, data: DocumentData): CheckoutPromotion {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : '',
    code: typeof data.code === 'string' ? data.code : '',
    type: typeof data.type === 'string' ? data.type : '',
    active: data.active === true,
    discountValue: data.discountValue,
    minSpend: data.minSpend,
    startsAt: toMillis(data.startsAt, Number.NEGATIVE_INFINITY),
    endsAt: toMillis(data.endsAt, Number.POSITIVE_INFINITY),
    applicableCategoryIds: Array.isArray(data.applicableCategoryIds) ? data.applicableCategoryIds : [],
    applicableProductIds: Array.isArray(data.applicableProductIds) ? data.applicableProductIds : [],
  };
}

function money(cents: number): number {
  return cents / 100;
}

function orderResult(orderId: string, data: DocumentData) {
  return {
    orderId,
    status: data.status,
    paymentMode: data.paymentMode,
    fulfillmentType: data.fulfillmentType,
    subtotal: data.subtotal,
    discount: data.discount,
    total: data.total,
    pointsAwarded: data.pointsAwarded,
    promoCode: data.promoCode,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

export const completeDemoCheckout = onCall({ timeoutSeconds: 30 }, async (request) => {
  if (!request.auth) fail('unauthenticated', 'Sign in to place a demo pickup order.');

  const emulator = process.env.FUNCTIONS_EMULATOR === 'true';
  if (!emulator && !isAllowedStagingProject(process.env.GCLOUD_PROJECT, stagingProjectId.value())) {
    fail('failed-precondition', 'Simulated checkout is available only in the configured Firebase staging project.');
  }

  const data: unknown = request.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail('invalid-argument', 'The checkout request is invalid.');
  }
  const requestData = data as Record<string, unknown>;
  const allowedKeys = new Set(['items', 'promoCode', 'requestId']);
  if (Object.keys(requestData).some((key) => !allowedKeys.has(key))) {
    fail('invalid-argument', 'Only product IDs, quantities, a promo code, and a request ID may be submitted.');
  }

  let cartItems: Array<{ productId: string; quantity: number }>;
  let requestId: string;
  try {
    cartItems = parseCartItems(requestData.items);
    requestId = parseRequestId(requestData.requestId);
  } catch (error) {
    fail('invalid-argument', error instanceof Error ? error.message : 'The cart is invalid.');
  }

  let promoCode: string | undefined;
  if (requestData.promoCode !== undefined && requestData.promoCode !== null && requestData.promoCode !== '') {
    if (typeof requestData.promoCode !== 'string' || requestData.promoCode.trim().length > 40) {
      fail('invalid-argument', 'The promo code is invalid.');
    }
    promoCode = requestData.promoCode.trim().toUpperCase();
  }

  const uid = request.auth.uid;
  const orderId = `${uid}_${requestId}`;
  const orderRef = db.collection('orders').doc(orderId);
  const customerRef = db.collection('customers').doc(uid);
  const transactionRef = db.collection('loyalty_transactions').doc(orderId);
  const productRefs = cartItems.map((item) => db.collection('products').doc(item.productId));

  let promotionRef: DocumentReference | null = null;
  if (promoCode) {
    const matches = await db.collection('promotions').where('code', '==', promoCode).limit(2).get();
    if (matches.size > 1) fail('failed-precondition', 'This promo code is duplicated. Please contact the bakery.');
    if (matches.empty) fail('invalid-argument', 'This promo code is not valid.');
    promotionRef = matches.docs[0].ref;
  }

  try {
    return await db.runTransaction(async (transaction) => {
      const existingOrder = await transaction.get(orderRef);
      if (existingOrder.exists) {
        const existing = existingOrder.data()!;
        if (existing.customerId !== uid || existing.requestId !== requestId) {
          fail('already-exists', 'This checkout request ID has already been used.');
        }
        return orderResult(orderRef.id, existing);
      }

      const [customerSnap, ...productSnaps] = await Promise.all([
        transaction.get(customerRef),
        ...productRefs.map((ref) => transaction.get(ref)),
        ...(promotionRef ? [transaction.get(promotionRef)] : []),
      ]);
      const promotionSnap = promotionRef ? productSnaps.pop() : undefined;

      const pricedLines: PricedLine[] = cartItems.map((item, index) => {
        const productSnap = productSnaps[index];
        if (!productSnap?.exists) fail('not-found', 'A product in your cart is no longer available.');
        const product = productSnap.data()!;
        return {
          productId: productSnap.id,
          name: product.name,
          category: product.category,
          unitPrice: product.price,
          quantity: item.quantity,
          available: product.available === true,
          stockStatus: product.stockStatus,
          published: product.published,
        };
      });

      let promotion: CheckoutPromotion | null = null;
      if (promotionRef) {
        if (!promotionSnap?.exists) fail('invalid-argument', 'This promo code is no longer available.');
        promotion = mapPromotion(promotionSnap.id, promotionSnap.data()!);
        if (promotion.code.trim().toUpperCase() !== promoCode) {
          fail('invalid-argument', 'This promo code is not valid.');
        }
      }

      let totals;
      try {
        totals = calculateCheckout(pricedLines, promotion);
      } catch (error) {
        fail('invalid-argument', error instanceof Error ? error.message : 'The cart could not be checked out.');
      }

      const createdAt = Timestamp.now();
      const items = totals.lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        quantity: line.quantity,
        unitPrice: money(Math.round(line.unitPrice * 100)),
        lineTotal: money(line.lineTotalCents),
      }));
      const orderData = {
        customerId: uid,
        requestId,
        items,
        subtotal: money(totals.subtotalCents),
        discount: money(totals.discountCents),
        total: money(totals.totalCents),
        pointsAwarded: totals.pointsAwarded,
        promoCode: promoCode ?? null,
        promoId: promotion?.id ?? null,
        fulfillmentType: 'pickup',
        paymentMode: 'simulated',
        paymentStatus: 'simulated_success',
        status: 'demo_confirmed',
        isDemo: true,
        createdAt,
      };

      const storedPoints = customerSnap.data()?.points;
      if (customerSnap.exists && (!Number.isSafeInteger(storedPoints) || (storedPoints as number) < 0)) {
        fail('failed-precondition', 'The customer points profile is invalid. Please contact support.');
      }
      const currentPoints = customerSnap.exists ? storedPoints as number : 0;
      if (totals.pointsAwarded > 0 && !customerSnap.exists) {
        const customerQuery = await transaction.get(
          db.collection('customers').where('email', '==', request.auth!.token.email ?? '').limit(1)
        );
        if (!customerQuery.empty) {
          fail('failed-precondition', 'The customer profile is not ready. Please retry checkout.');
        }
      }
      const customerInfo = request.auth!.token;

      transaction.create(orderRef, orderData);
      if (customerSnap.exists) {
        transaction.update(customerRef, { points: currentPoints + totals.pointsAwarded });
      } else {
        transaction.create(customerRef, {
          name: typeof customerInfo.name === 'string' ? customerInfo.name : (customerInfo.email?.split('@')[0] ?? 'Valued Customer'),
          email: typeof customerInfo.email === 'string' ? customerInfo.email : '',
          points: totals.pointsAwarded,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      if (totals.pointsAwarded > 0) {
        transaction.create(transactionRef, {
          customerId: uid,
          type: 'earned',
          points: totals.pointsAwarded,
          purchaseAmount: money(totals.totalCents),
          orderId,
          source: 'simulated_checkout',
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      return orderResult(orderRef.id, orderData);
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('[Demo checkout] transaction failed', error);
    fail('internal', 'Could not place the simulated pickup order. Please retry.');
  }
});
