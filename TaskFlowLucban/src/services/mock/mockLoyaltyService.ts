import { LoyaltyService } from '../types';
import { LoyaltyCustomer, Reward, LoyaltyTransaction, InsufficientPointsError } from '../../types/loyalty';
import { mockRewards } from '../../data/mock/rewards';
import { calculatePointsEarned } from '../../utils/loyalty';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// In-memory mock store
const mockCustomers = new Map<string, LoyaltyCustomer>();
const mockTransactions: LoyaltyTransaction[] = [];

// Seed initial mock transactions for demo customer
const INITIAL_MOCK_UID = 'mock-customer-123';
mockCustomers.set(INITIAL_MOCK_UID, {
  customerId: INITIAL_MOCK_UID,
  name: 'Valued Customer',
  email: 'customer@fredspies.com',
  points: 120,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
});

mockTransactions.push(
  {
    id: 'tx-1',
    customerId: INITIAL_MOCK_UID,
    type: 'earned',
    points: 10,
    purchaseAmount: 1000,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    customerId: INITIAL_MOCK_UID,
    type: 'earned',
    points: 15,
    purchaseAmount: 1550,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
);

export const mockLoyaltyService: LoyaltyService = {
  async getOrCreateCustomer(customerId: string, email: string, name = 'Valued Customer'): Promise<LoyaltyCustomer> {
    await delay(200);
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
    const pointsEarned = calculatePointsEarned(purchaseAmount);
    let customer = mockCustomers.get(customerId);
    if (!customer) {
      customer = await this.getOrCreateCustomer(customerId, 'customer@fredspies.com');
    }

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
    const reward = mockRewards.find((r) => r.id === rewardId && r.active);
    if (!reward) {
      throw new Error('Reward not found or inactive');
    }

    let customer = mockCustomers.get(customerId);
    if (!customer) {
      customer = await this.getOrCreateCustomer(customerId, 'customer@fredspies.com');
    }

    if (customer.points < reward.pointsRequired) {
      throw new InsufficientPointsError(reward.name, reward.pointsRequired, customer.points);
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
