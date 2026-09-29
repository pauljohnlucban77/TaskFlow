import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerOrder, DemoCheckoutRequest, DemoCheckoutResult, LocalDemoCheckoutPreview } from '../types/order';
import { OrderService } from './types';
import { ServiceError } from './serviceError';

function storageKey(customerId: string): string {
  return `@freds-pies/local-demo-orders/${customerId}`;
}

async function readOrders(customerId: string): Promise<CustomerOrder[]> {
  try {
    const stored = await AsyncStorage.getItem(storageKey(customerId));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as CustomerOrder[] : [];
  } catch {
    throw new ServiceError('orders/local-storage', 'Could not read demo orders saved on this device.');
  }
}

function validatePreview(request: DemoCheckoutRequest, preview?: LocalDemoCheckoutPreview): LocalDemoCheckoutPreview {
  if (!preview || !Array.isArray(preview.items) || preview.items.length === 0
      || preview.items.length !== request.items.length || !preview.customerId) {
    throw new ServiceError('orders/preview-data', 'The cart preview is incomplete. Please return to your cart and retry.');
  }

  const requestItems = new Map(request.items.map((item) => [item.productId, item.quantity]));
  const previewProductIds = new Set<string>();
  for (const item of preview.items) {
    if (requestItems.get(item.productId) !== item.quantity
        || previewProductIds.has(item.productId)
        || !Number.isFinite(item.unitPrice) || item.unitPrice <= 0
        || !Number.isFinite(item.lineTotal) || item.lineTotal < 0
        || Math.abs(item.lineTotal - item.unitPrice * item.quantity) > 0.02) {
      throw new ServiceError('orders/preview-data', 'The cart changed. Please review it and retry checkout.');
    }
    previewProductIds.add(item.productId);
  }

  if (![preview.subtotal, preview.discount, preview.total].every(Number.isFinite)
      || preview.subtotal < 0 || preview.discount < 0 || preview.total < 0
      || Math.abs(preview.items.reduce((sum, item) => sum + item.lineTotal, 0) - preview.subtotal) > 0.02
      || Math.abs(preview.subtotal - preview.discount - preview.total) > 0.02) {
    throw new ServiceError('orders/preview-total', 'The preview total is invalid. Please review your cart and retry.');
  }
  return preview;
}

export const localDemoOrderStore: OrderService = {
  async completeDemoCheckout(
    request: DemoCheckoutRequest,
    localPreview?: LocalDemoCheckoutPreview
  ): Promise<DemoCheckoutResult> {
    const preview = validatePreview(request, localPreview);
    const customerId = preview.customerId;

    const orders = await readOrders(customerId);
    const existing = orders.find((order) => order.orderId.endsWith(`_${request.requestId}`));
    if (existing) return existing;

    const order: CustomerOrder = {
      orderId: `local_${customerId}_${request.requestId}`,
      status: 'demo_confirmed',
      paymentMode: 'simulated',
      fulfillmentType: 'pickup',
      subtotal: preview.subtotal,
      discount: preview.discount,
      total: preview.total,
      pointsAwarded: 0,
      promoCode: request.promoCode,
      createdAt: new Date().toISOString(),
      persistence: 'device_preview',
      items: preview.items,
    };

    try {
      await AsyncStorage.setItem(storageKey(customerId), JSON.stringify([order, ...orders]));
      return order;
    } catch {
      throw new ServiceError('orders/local-storage', 'Could not save this preview order on the device. Check available storage and retry.');
    }
  },

  async getMyOrders(customerId: string): Promise<CustomerOrder[]> {
    return (await readOrders(customerId))
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  },
};
