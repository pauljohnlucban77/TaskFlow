const test = require('node:test');
const assert = require('node:assert/strict');
const { getPickupSlots, isPickupSlotAvailable } = require('../src/utils/pickupSlots.ts');

const config = {
  timezone: 'Asia/Manila', slotMinutes: 30, leadTimeMinutes: 60, daysAhead: 3,
  openingHours: Object.fromEntries(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => [day, { open: '08:00', close: '09:00' }])),
};

test('pickup slot builder uses the configured timezone, hours, and interval', () => {
  const now = new Date('2026-10-01T00:00:00Z');
  const slots = getPickupSlots(config, now);
  assert.ok(slots.length > 0);
  assert.ok(slots.every((slot) => ['08:00', '08:30'].includes(slot.label)));
  assert.ok(slots.every((slot) => new Date(slot.value).getTime() >= now.getTime() + 60 * 60_000));
  assert.ok(isPickupSlotAvailable(config, slots[0].value, now));
  assert.equal(isPickupSlotAvailable(config, '2026-10-01T08:10:00+08:00', now), false);
});
