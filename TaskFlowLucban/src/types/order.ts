export type OrderStatus = 'demo_confirmed';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface DemoCheckoutRequest {
  items: { productId: string; quantity: number }[];
  promoCode?: string;
  requestId: string;
}

export interface DemoCheckoutResult {
  orderId: string;
  status: OrderStatus;
  paymentMode: 'simulated';
  fulfillmentType: 'pickup';
  subtotal: number;
  discount: number;
  total: number;
  pointsAwarded: number;
  promoCode?: string;
  createdAt: string;
  persistence?: 'server' | 'device_preview';
}

export interface LocalDemoCheckoutPreview {
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface CustomerOrder extends DemoCheckoutResult {
  items: OrderItem[];
}
