export interface PricedLine {
  productId: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  available: boolean;
  stockStatus: string;
  published?: boolean;
}

export interface CheckoutPromotion {
  id: string;
  title: string;
  code: string;
  type: string;
  active: boolean;
  discountValue?: number;
  minSpend?: number;
  startsAt?: number;
  endsAt?: number;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
}

export interface CheckoutTotals {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  pointsAwarded: number;
  lines: Array<PricedLine & { lineTotalCents: number }>;
}

export function calculateCheckout(
  lines: PricedLine[],
  promotion: CheckoutPromotion | null,
  now = Date.now()
): CheckoutTotals {
  if (lines.length === 0 || lines.length > 25) {
    throw new Error('Add between 1 and 25 different products to your cart.');
  }

  const pricedLines = lines.map((line) => {
    if (!line.productId || !line.name || !line.available || line.stockStatus === 'sold_out' || line.published === false) {
      throw new Error(`${line.name || 'A product'} is unavailable for this pickup order.`);
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
      throw new Error('Each product quantity must be a whole number from 1 to 20.');
    }
    if (!Number.isFinite(line.unitPrice) || line.unitPrice <= 0 || line.unitPrice > Number.MAX_SAFE_INTEGER / 100) {
      throw new Error(`${line.name} has an invalid price.`);
    }

    const unitPriceCents = Math.round(line.unitPrice * 100);
    const lineTotalCents = unitPriceCents * line.quantity;
    if (!Number.isSafeInteger(lineTotalCents)) throw new Error(`${line.name} has an invalid price.`);
    return { ...line, unitPriceCents, lineTotalCents };
  });

  const subtotalCents = pricedLines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  if (!Number.isSafeInteger(subtotalCents)) throw new Error('The cart total is too large to process.');
  let discountCents = 0;

  if (promotion) {
    if (!promotion.active || now < (promotion.startsAt ?? Number.NEGATIVE_INFINITY) || now > (promotion.endsAt ?? Number.POSITIVE_INFINITY)) {
      throw new Error('This promo code is inactive or expired.');
    }
    if (promotion.type !== 'percent_off' && promotion.type !== 'amount_off') {
      throw new Error('This promo type is not available in the demo checkout.');
    }
    if (promotion.minSpend !== undefined
        && (!Number.isFinite(promotion.minSpend) || promotion.minSpend < 0 || subtotalCents < Math.round(promotion.minSpend * 100))) {
      throw new Error(`This promo requires a minimum spend of ₱${promotion.minSpend}.`);
    }

    const productIds = promotion.applicableProductIds ?? [];
    const categoryIds = promotion.applicableCategoryIds ?? [];
    const eligibleCents = pricedLines.reduce((sum, line) => {
      const eligible = productIds.length === 0 && categoryIds.length === 0
        ? true
        : productIds.includes(line.productId) || categoryIds.includes(line.category);
      return sum + (eligible ? line.lineTotalCents : 0);
    }, 0);

    if (eligibleCents === 0) {
      throw new Error('This promo code does not apply to products in your cart.');
    }

    const value = promotion.discountValue ?? 0;
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('This promo code has an invalid discount.');
    }
    if (promotion.type === 'percent_off') {
      if (value > 100) throw new Error('This promo code has an invalid discount.');
      discountCents = Math.round(eligibleCents * value / 100);
    } else {
      if (value * 100 > Number.MAX_SAFE_INTEGER) throw new Error('This promo code has an invalid discount.');
      discountCents = Math.min(eligibleCents, Math.round(value * 100));
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);
  return {
    subtotalCents,
    discountCents,
    totalCents,
    pointsAwarded: Math.floor(totalCents / 10000),
    lines: pricedLines.map(({ unitPriceCents: _unitPriceCents, ...line }) => line),
  };
}

export function isAllowedStagingProject(projectId: string | undefined, expectedProjectId: string | undefined): boolean {
  return !!projectId
    && projectId.endsWith('-staging')
    && expectedProjectId === projectId;
}

export function parseRequestId(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{16,80}$/.test(value)) {
    throw new Error('A valid checkout request ID is required.');
  }
  return value;
}

export function parseCartItems(value: unknown): Array<{ productId: string; quantity: number }> {
  if (!Array.isArray(value) || value.length === 0 || value.length > 25) {
    throw new Error('Add between 1 and 25 different products to your cart.');
  }
  const items = value.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)
        || Object.keys(item).some((key) => key !== 'productId' && key !== 'quantity')
        || typeof item.productId !== 'string' || item.productId.trim().length === 0
        || item.productId.length > 150) {
      throw new Error('The cart contains an invalid product.');
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      throw new Error('Each product quantity must be a whole number from 1 to 20.');
    }
    return { productId: item.productId, quantity: item.quantity };
  });
  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new Error('The cart contains a duplicate product.');
  }
  return items;
}
