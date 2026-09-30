const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransitionOrder, pointsForPickupTransition, validatePickupTime } = require('../lib/orderLogic.js');

test('allows only forward staff workflow transitions and customer cancellation window', () => {
  assert.equal(canTransitionOrder('placed', 'confirmed'), true);
  assert.equal(canTransitionOrder('confirmed', 'preparing'), true);
  assert.equal(canTransitionOrder('preparing', 'ready'), true);
  assert.equal(canTransitionOrder('ready', 'picked_up'), true);
  assert.equal(canTransitionOrder('placed', 'cancelled'), true);
  assert.equal(canTransitionOrder('confirmed', 'cancelled'), true);
  for (const pair of [['placed', 'ready'], ['ready', 'cancelled'], ['picked_up', 'cancelled'], ['cancelled', 'confirmed'], ['preparing', 'picked_up']]) {
    assert.equal(canTransitionOrder(pair[0], pair[1]), false, `${pair[0]} -> ${pair[1]} must be denied`);
  }
});

test('transition function exhaustively accepts only the declared status matrix', () => {
  const statuses = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'];
  const allowed = new Set(['placed>confirmed', 'placed>cancelled', 'confirmed>preparing', 'confirmed>cancelled', 'preparing>ready', 'ready>picked_up']);
  for (const from of statuses) for (const to of statuses) {
    assert.equal(canTransitionOrder(from, to), allowed.has(`${from}>${to}`), `${from} -> ${to}`);
  }
});

test('awards points only on ready to picked_up and computes them idempotently from cents', () => {
  assert.equal(pointsForPickupTransition('ready', 'picked_up', 25999), 2);
  assert.equal(pointsForPickupTransition('ready', 'picked_up', 9999), 0);
  assert.equal(pointsForPickupTransition('placed', 'confirmed', 25999), 0);
  assert.equal(pointsForPickupTransition('picked_up', 'picked_up', 25999), 0);
  assert.equal(pointsForPickupTransition('ready', 'cancelled', 25999), 0);
});

test('validates configured weekday hours, slot increments, lead time, and date horizon', () => {
  const config = {
    timezone: 'Asia/Manila', slotMinutes: 30, leadTimeMinutes: 120, daysAhead: 7,
    openingHours: Object.fromEntries(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map((day) => [day, { open: '08:00', close: '18:00' }])),
  };
  const now = Date.parse('2026-09-30T23:00:00.000Z');
  assert.equal(validatePickupTime('2026-10-01T09:00:00+08:00', config, now), null);
  assert.match(validatePickupTime('2026-10-01T09:10:00+08:00', config, now), /every 30 minutes/);
  assert.match(validatePickupTime('2026-10-02T06:30:00+08:00', config, now), /opening hours/);
  assert.match(validatePickupTime('2026-10-01T08:00:00+08:00', config, now), /at least 120 minutes/);
  assert.match(validatePickupTime('2026-10-20T09:00:00+08:00', config, now), /within 7 days/);
});
