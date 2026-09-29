const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateCheckout,
  isAllowedStagingProject,
  parseCartItems,
  parseRequestId,
} = require('../lib/checkoutLogic.js');

const pie = {
  productId: 'apple-pie', name: 'Apple Pie', category: 'pies', unitPrice: 450,
  quantity: 2, available: true, stockStatus: 'available', published: true,
};

test('uses server product prices and computes a percentage promo and points', () => {
  const totals = calculateCheckout([pie], {
    id: 'fruit20', title: 'Fruit pies', code: 'FRUIT20', type: 'percent_off',
    active: true, discountValue: 20, applicableCategoryIds: ['pies'],
  }, Date.now());
  assert.deepEqual(
    { subtotal: totals.subtotalCents, discount: totals.discountCents, total: totals.totalCents, points: totals.pointsAwarded },
    { subtotal: 90000, discount: 18000, total: 72000, points: 7 }
  );
});

test('amount promos discount only eligible lines and cap at eligible subtotal', () => {
  const totals = calculateCheckout([
    pie,
    { ...pie, productId: 'croissant', category: 'pastries', unitPrice: 120, quantity: 1 },
  ], {
    id: 'pies100', title: 'Pies discount', code: 'PIES100', type: 'amount_off',
    active: true, discountValue: 100, applicableCategoryIds: ['pies'],
  });
  assert.equal(totals.subtotalCents, 102000);
  assert.equal(totals.discountCents, 10000);
  assert.equal(totals.totalCents, 92000);
  assert.equal(totals.pointsAwarded, 9);
});

test('rejects unavailable products and unsupported promo types', () => {
  assert.throws(() => calculateCheckout([{ ...pie, available: false }], null), /unavailable/i);
  assert.throws(() => calculateCheckout([pie], {
    id: 'bundle', title: 'Bundle', code: 'BUNDLE', type: 'bundle', active: true,
  }), /not available/i);
});

test('rejects malformed, duplicate, and excessive cart quantities', () => {
  assert.throws(() => parseCartItems([]), /between 1 and 25/i);
  assert.throws(() => parseCartItems([{ productId: 'pie', quantity: 1, price: 1 }]), /invalid product/i);
  assert.throws(() => parseCartItems([{ productId: ' ', quantity: 1 }]), /invalid product/i);
  assert.throws(() => parseCartItems([{ productId: 'pie', quantity: 1 }, { productId: 'pie', quantity: 1 }]), /duplicate/i);
  assert.throws(() => parseCartItems([{ productId: 'pie', quantity: 21 }]), /quantity/i);
  assert.equal(parseRequestId('request_id_123456').length, 17);
  assert.throws(() => parseRequestId('short'), /request ID/i);
});

test('rejects malformed minimum spend and prevents overflow in price totals', () => {
  assert.throws(() => calculateCheckout([pie], {
    id: 'bad-min', title: 'Bad minimum', code: 'BAD', type: 'amount_off',
    active: true, discountValue: 10, minSpend: Number.NaN,
  }), /minimum spend/i);
  assert.throws(() => calculateCheckout([{
    ...pie, unitPrice: Number.MAX_VALUE, quantity: 20,
  }], null), /invalid price/i);
});

test('staging guard accepts only an explicitly matched project ending in staging', () => {
  assert.equal(isAllowedStagingProject('freds-pies-staging', 'freds-pies-staging'), true);
  assert.equal(isAllowedStagingProject('freds-pies-prod', 'freds-pies-prod'), false);
  assert.equal(isAllowedStagingProject('freds-pies-staging', 'other-staging'), false);
});
