import { collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { CustomerOrder, DemoCheckoutRequest, DemoCheckoutResult, LocalDemoCheckoutPreview } from '../../types/order';
import { db, functions } from '../../lib/firebase';
import { runFirestore, ServiceError, toServiceError } from '../serviceError';
import { OrderService } from '../types';
import { localDemoOrderStore } from '../localDemoOrderStore';
import { isLocalOrderPreviewEnabled } from '../../utils/localOrderPreview';

function mapOrder(id: string, data: any): CustomerOrder {
  return {
    orderId: id,
    status: data.status,
    paymentMode: data.paymentMode,
    fulfillmentType: data.fulfillmentType,
    subtotal: data.subtotal,
    discount: data.discount,
    total: data.total,
    pointsAwarded: data.pointsAwarded,
    promoCode: data.promoCode,
    items: Array.isArray(data.items) ? data.items : [],
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
  };
}

export const firebaseOrderService: OrderService = {
  async completeDemoCheckout(request: DemoCheckoutRequest, localPreview?: LocalDemoCheckoutPreview): Promise<DemoCheckoutResult> {
    if (isLocalOrderPreviewEnabled()) {
      return localDemoOrderStore.completeDemoCheckout(request, localPreview);
    }

    if (!functions) {
      throw new ServiceError('firebase/unavailable', 'Firebase Functions is not initialized.');
    }

    try {
      const checkout = httpsCallable<DemoCheckoutRequest, DemoCheckoutResult>(functions, 'completeDemoCheckout');
      const result = await checkout(request);
      return result.data;
    } catch (error) {
      const firebaseError = error as { code?: unknown };
      if (firebaseError.code === 'functions/not-found') {
        throw new ServiceError(
          'checkout/function-not-deployed',
          'The staging checkout service is not deployed yet. Deploy completeDemoCheckout to the configured staging Firebase project.'
        );
      }
      if (firebaseError.code === 'functions/failed-precondition') {
        throw new ServiceError(
          'checkout/staging-configuration',
          'The checkout service rejected this Firebase project. Check that its project ID and DEMO_STAGING_PROJECT_ID match the staging project.'
        );
      }
      throw toServiceError(error, 'place simulated pickup order');
    }
  },

  async getMyOrders(customerId: string): Promise<CustomerOrder[]> {
    if (isLocalOrderPreviewEnabled()) {
      return localDemoOrderStore.getMyOrders(customerId);
    }

    return runFirestore(db, 'load order history', async (firestore) => {
      const ordersQuery = query(
        collection(firestore, 'orders'),
        where('customerId', '==', customerId)
      );
      const snapshot = await getDocs(ordersQuery);
      return snapshot.docs
        .map((order) => mapOrder(order.id, order.data()))
        .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
    });
  },
};
