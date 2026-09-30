import type { PickupConfig } from '../types/order';

export interface PickupSlot { date: string; value: string; label: string }

function partsAt(date: Date, timeZone: string): Record<string, string> {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
}

function zonedInstant(date: string, time: string, timeZone: string): Date {
  const target = new Date(`${date}T${time}:00.000Z`);
  const actual = partsAt(target, timeZone);
  const represented = Date.UTC(Number(actual.year), Number(actual.month) - 1, Number(actual.day), Number(actual.hour), Number(actual.minute));
  const desired = Date.parse(`${date}T${time}:00.000Z`);
  const corrected = new Date(target.getTime() + desired - represented);
  return corrected;
}

export function getPickupSlots(config: PickupConfig, now = new Date()): PickupSlot[] {
  const slots: PickupSlot[] = [];
  const localToday = partsAt(now, config.timezone);
  const dateAnchor = new Date(`${localToday.year}-${localToday.month}-${localToday.day}T12:00:00Z`);
  for (let offset = 0; offset < config.daysAhead; offset++) {
    const date = new Date(dateAnchor.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
    const day = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();
    const hours = config.openingHours[day];
    if (!hours || hours.closed) continue;
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    const open = openHour * 60 + openMinute;
    const close = closeHour * 60 + closeMinute;
    for (let minute = open; minute < close; minute += config.slotMinutes) {
      const clock = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      const slotDate = zonedInstant(date, clock, config.timezone);
      if (slotDate.getTime() < now.getTime() + config.leadTimeMinutes * 60_000) continue;
      slots.push({ date, value: slotDate.toISOString(), label: clock });
    }
  }
  return slots;
}

export function isPickupSlotAvailable(config: PickupConfig, pickupAt: string, now = new Date()): boolean {
  return getPickupSlots(config, now).some((slot) => slot.value === new Date(pickupAt).toISOString());
}
