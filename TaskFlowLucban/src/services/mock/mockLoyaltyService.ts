import { LoyaltyService } from '../types';
import { LoyaltyCustomer, Reward, LoyaltyTransaction, InsufficientPointsError } from '../../types/loyalty';
import { mockRewards } from '../../data/mock/rewards';
import { calculatePointsEarned } from '../../utils/loyalty';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// In-memory mock store
const mockCustomers = new Map<string, LoyaltyCustomer>();
const mockTransactions: LoyaltyTransaction[] = [];
const GUEST_CUSTOMER_ID = 'mock-customer-123';

export const mockLoyaltyService: LoyaltyService = {
  async getOrCreateCustomer(customerId: string, email: string, name = 'Valued Customer'): Promise<LoyaltyCustomer> {
    await delay(200);
    if (customerId === GUEST_CUSTOMER_ID) {
      return { customerId, name, email, points: 0, createdAt: new Date().toISOString() };
    }
    if (!mockCustomers.has(customerId)) {
      mockCustomers.set(customerId, {
        customerId,
        name,
        email,
        points: 0,
        createdAt: new Date().toISOString(),
      });
    }
    return mockCustomers.get(customerId)!;
  },

  async getCustomerBalance(customerId: string): Promise<number> {
    await delay(150);
    if (customerId === GUEST_CUSTOMER_ID) return 0;
    const customer = mockCustomers.get(customerId);
    return customer ? customer.points : 0;
  },

  async getActiveRewards(): Promise<Reward[]> {
    await delay(150);
    return mockRewards.filter((r) => r.active);
  },

  async getTransactionHistory(customerId: string): Promise<LoyaltyTransaction[]> {
    await delay(200);
    return mockTransactions
      .filter((t) => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async earnPoints(customerId: string, purchaseAmount: number): Promise<{ pointsEarned: number; newBalance: number }> {
    await delay(300);
    if (customerId === GUEST_CUSTOMER_ID) {
      throw new Error('Create an account and buy a product to earn points.');
    }
    const pointsEarned = calculatePointsEarned(purchaseAmount);
    let customer = mockCustomers.get(customerId);
    if (!customer) customer = await this.getOrCreateCustomer(customerId, 'customer@fredspies.com');
    if (pointsEarned > 0) {
      customer.points += pointsEarned;
      mockTransactions.push({
        id: `tx-${Date.now()}`,
        customerId,
        type: 'earned',
        points: pointsEarned,
        purchaseAmount,
        createdAt: new Date().toISOString(),
      });
    }
    return { pointsEarned, newBalance: customer.points };
  },

  async redeemReward(customerId: string, rewardId: string): Promise<{ newBalance: number; reward: Reward }> {
    await delay(400);
    if (customerId === GUEST_CUSTOMER_ID) {
      throw new Error('Create an account and buy a product before redeeming rewards.');
    }
    const reward = mockRewards.find((candidate) => candidate.id === rewardId && candidate.active);
    if (!reward) throw new Error('Reward not found or inactive.');
    const customer = mockCustomers.get(customerId);
    if (!customer || customer.points < reward.pointsRequired) {
      throw new InsufficientPointsError(reward.name, reward.pointsRequired, customer?.points ?? 0);
    }
    if (!mockTransactions.some((transaction) => transaction.customerId === customerId && transaction.type === 'earned')) {
      throw new Error('Buy a product to earn points before redeeming rewards.');
    }
    customer.points -= reward.pointsRequired;
    mockTransactions.push({
      id: `tx-${Date.now()}`,
      customerId,
      type: 'redeemed',
      points: reward.pointsRequired,
      rewardId: reward.id,
      rewardName: reward.name,
      createdAt: new Date().toISOString(),
    });
    return { newBalance: customer.points, reward };
  },
};
