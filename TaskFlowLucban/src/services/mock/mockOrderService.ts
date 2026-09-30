import { localDemoOrderStore } from '../localDemoOrderStore';
import { OrderService } from '../types';
import { mockLoyaltyService } from './mockLoyaltyService';

export const mockOrderService: OrderService = {
  async completeDemoCheckout(request, preview) {
    const result = await localDemoOrderStore.completeDemoCheckout(request, preview);
    if (preview?.customerId && preview.customerId !== 'mock-customer-123') {
      const earned = await mockLoyaltyService.earnPoints(preview.customerId, result.total);
      return { ...result, pointsAwarded: earned.pointsEarned };
    }
    return result;
  },
  getMyOrders: (customerId) => localDemoOrderStore.getMyOrders(customerId),
};
