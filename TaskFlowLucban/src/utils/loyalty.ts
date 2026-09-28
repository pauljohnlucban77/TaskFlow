/**
 * Pure function to calculate loyalty points earned from a purchase.
 * Rule: Earn 1 point for every ₱100 spent.
 * Example: ₱250 => 2 points, ₱99 => 0 points, ₱1,000 => 10 points.
 */
export function calculatePointsEarned(purchaseAmount: number): number {
  if (!isFinite(purchaseAmount) || purchaseAmount <= 0) {
    return 0;
  }
  return Math.floor(purchaseAmount / 100);
}
