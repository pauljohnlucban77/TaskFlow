export type LoyaltyTier = 'Bronze Member' | 'Silver Member' | 'Gold Member';

export interface LoyaltyAccount {
  memberId: string;
  customerName: string;
  email: string;
  points: number;
  tier: LoyaltyTier;
  nextTier: string;
  targetPoints: number;
  pointsToNextTier: number;
  progressPercent: number;
}

export interface LoyaltyCustomer {
  customerId: string;
  name: string;
  email: string;
  points: number;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  active: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earned' | 'redeemed';
  points: number;
  description?: string;
  purchaseAmount?: number;
  rewardId?: string;
  rewardName?: string;
  redemptionCode?: string;
  createdAt: string;
}

export class InsufficientPointsError extends Error {
  pointsNeeded: number;
  currentPoints: number;

  constructor(rewardName: string, pointsRequired: number, currentPoints: number) {
    const pointsNeeded = pointsRequired - currentPoints;
    super(`You need ${pointsNeeded} more points to redeem ${rewardName}.`);
    this.name = 'InsufficientPointsError';
    this.pointsNeeded = pointsNeeded;
    this.currentPoints = currentPoints;
  }
}

export function calculateLoyaltyAccount(
  customerName: string,
  email: string,
  customerId: string,
  points: number
): LoyaltyAccount {
  let tier: LoyaltyTier = 'Bronze Member';
  let nextTier = 'Silver Member';
  let targetPoints = 500;

  if (points >= 1500) {
    tier = 'Gold Member';
    nextTier = 'Platinum Member';
    targetPoints = 3000;
  } else if (points >= 500) {
    tier = 'Silver Member';
    nextTier = 'Gold Member';
    targetPoints = 1500;
  }

  const pointsToNextTier = Math.max(0, targetPoints - points);
  const progressPercent = Math.min(100, Math.round((points / targetPoints) * 100));

  const shortId = customerId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || '000001';
  const memberId = `FP-${shortId.padStart(6, '0')}`;

  return {
    memberId,
    customerName: customerName || 'Valued Customer',
    email,
    points,
    tier,
    nextTier,
    targetPoints,
    pointsToNextTier,
    progressPercent,
  };
}
