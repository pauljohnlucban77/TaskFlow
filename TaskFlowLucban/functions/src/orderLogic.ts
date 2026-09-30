export const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['picked_up'],
  picked_up: [],
  cancelled: [],
};

export function canTransitionOrder(from: string, to: string): boolean {
  return ORDER_STATUSES.includes(from as OrderStatus) && transitions[from as OrderStatus].includes(to as OrderStatus);
}

export function pointsForPickupTransition(from: string, to: string, totalCents: number): number {
  if (from !== 'ready' || to !== 'picked_up' || !Number.isSafeInteger(totalCents) || totalCents < 0) return 0;
  return Math.floor(totalCents / 10000);
}

export interface PickupConfig {
  timezone: string;
  slotMinutes: number;
  leadTimeMinutes: number;
  daysAhead: number;
  openingHours: Record<string, { open: string; close: string; closed?: boolean }>;
}

function clockMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

export function validatePickupTime(value: unknown, config: PickupConfig, now = Date.now()): string | null {
  if (!config || typeof config.timezone !== 'string' || !config.openingHours || typeof config.openingHours !== 'object') {
    return 'Pickup hours are not configured correctly.';
  }
  if (typeof value !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(value)) return 'Choose a valid pickup time.';
  const pickupMs = Date.parse(value);
  if (!Number.isFinite(pickupMs)) return 'Choose a valid pickup time.';
  if (!Number.isInteger(config.slotMinutes) || config.slotMinutes < 1
      || !Number.isInteger(config.leadTimeMinutes) || config.leadTimeMinutes < 0
      || !Number.isInteger(config.daysAhead) || config.daysAhead < 1) return 'Pickup hours are not configured correctly.';
  if (pickupMs < now + config.leadTimeMinutes * 60_000) return `Pickup must be scheduled at least ${config.leadTimeMinutes} minutes ahead.`;
  if (pickupMs > now + config.daysAhead * 86_400_000) return `Pickup must be scheduled within ${config.daysAhead} days.`;

  let parts: Record<string, string>;
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: config.timezone,
      weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(pickupMs)).map((part) => [part.type, part.value]));
  } catch { return 'Pickup hours are not configured correctly.'; }
  const day = config.openingHours[parts.weekday.toLowerCase()];
  if (!day || day.closed) return 'The bakery is closed at the selected pickup time.';
  const open = clockMinutes(day.open);
  const close = clockMinutes(day.close);
  const selected = Number(parts.hour) * 60 + Number(parts.minute);
  if (open === null || close === null || close <= open) return 'Pickup hours are not configured correctly.';
  if (selected < open || selected >= close) return 'Choose a pickup time within opening hours.';
  if ((selected - open) % config.slotMinutes !== 0) return `Pickup times are available every ${config.slotMinutes} minutes.`;
  return null;
}
