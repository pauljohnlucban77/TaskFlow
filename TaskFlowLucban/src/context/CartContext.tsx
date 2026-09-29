import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product } from '../types/product';
import { Promotion } from '../types/promotion';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
  appliedPromotion: Promotion | null;
  promoCode: string;
  applyPromoCode: (code: string, promotions: Promotion[]) => { valid: boolean; message: string };
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [promoCode, setPromoCode] = useState('');

  const addItem = (product: Product) => {
    if (!product.available || product.stockStatus === 'sold_out') return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, 20) } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: Math.min(quantity, 20) } : i))
    );
  };

  const clear = () => {
    setItems([]);
    setAppliedPromotion(null);
    setPromoCode('');
  };

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (!appliedPromotion) return 0;
    const value = appliedPromotion.discountValue || 0;
    const productIds = appliedPromotion.applicableProductIds ?? [];
    const categoryIds = appliedPromotion.applicableCategoryIds ?? [];
    const eligibleSubtotal = items.reduce((sum, item) => {
      const eligible = productIds.length === 0 && categoryIds.length === 0
        ? true
        : productIds.includes(item.product.id) || categoryIds.includes(item.product.category);
      return sum + (eligible ? item.product.price * item.quantity : 0);
    }, 0);

    if (appliedPromotion.type === 'percent_off') {
      return eligibleSubtotal * (value / 100);
    }

    if (appliedPromotion.type === 'amount_off') {
      return Math.min(eligibleSubtotal, value);
    }

    return 0;
  }, [appliedPromotion, items]);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const applyPromoCode = (code: string, promotions: Promotion[]) => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return { valid: false, message: 'Please enter a promo code.' };
    }

    if (appliedPromotion && appliedPromotion.code?.toUpperCase() === normalizedCode) {
      return { valid: false, message: 'This promo code is already applied.' };
    }

    const promo = promotions.find((candidate) => {
      const matchesCode = candidate.code?.trim().toUpperCase() === normalizedCode;
      if (!matchesCode || !candidate.active) return false;
      if (candidate.type !== 'percent_off' && candidate.type !== 'amount_off') return false;
      if (!Number.isFinite(candidate.discountValue) || (candidate.discountValue ?? 0) <= 0) return false;
      if (candidate.type === 'percent_off' && (candidate.discountValue ?? 0) > 100) return false;

      const now = Date.now();
      const startsAt = candidate.startsAt ? new Date(candidate.startsAt).getTime() : Number.NEGATIVE_INFINITY;
      const endsAt = candidate.endsAt ? new Date(candidate.endsAt).getTime() : Number.POSITIVE_INFINITY;

      if (now < startsAt || now > endsAt) return false;
      if (candidate.minSpend !== undefined
          && (!Number.isFinite(candidate.minSpend) || candidate.minSpend < 0 || subtotal < candidate.minSpend)) return false;

      const includedProductIds = candidate.applicableProductIds ?? [];
      const includedCategories = candidate.applicableCategoryIds ?? [];

      const hasRestrictions = includedProductIds.length > 0 || includedCategories.length > 0;
      return items.some((item) => (!hasRestrictions
        || includedProductIds.includes(item.product.id)
        || includedCategories.includes(item.product.category)));
    });

    if (!promo) {
      return { valid: false, message: 'This promo code is not valid for your cart.' };
    }

    setAppliedPromotion(promo);
    setPromoCode(normalizedCode);
    return { valid: true, message: `Applied ${promo.title}.` };
  };

  const removePromoCode = () => {
    setAppliedPromotion(null);
    setPromoCode('');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        totalItems,
        subtotal,
        discount,
        total,
        appliedPromotion,
        promoCode,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
