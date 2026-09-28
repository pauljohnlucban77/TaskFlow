export type PromotionType = 'percent_off' | 'amount_off' | 'bundle' | 'free_item' | 'new_arrival' | 'seasonal';

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  type: PromotionType;
  code?: string;
  discountValue?: number;
  minSpend?: number;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
  startsAt: string;
  endsAt: string;
  imageUrl?: string;
  backgroundColor?: string;
  terms: string[];
  active: boolean;
}
