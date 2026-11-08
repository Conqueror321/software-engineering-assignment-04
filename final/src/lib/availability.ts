export type Booking = {
  id: string;
  start: number; // epoch ms
  end: number; // epoch ms
  owner: string;
};

export type AvailabilityInput = {
  start: number;
  end: number;
  now: number;
  bookings: readonly Booking[];
  roomBlocked?: boolean;
};

export type AvailabilityResult =
  | { available: true }
  | { available: false; reason: UnavailableReason };

export type UnavailableReason =
  | 'invalid_range'
  | 'in_past'
  | 'too_long'
  | 'room_blocked'
  | 'overlap';

export const MAX_DURATION_MS = 120 * 60 * 1000;

export function isAvailable(input: AvailabilityInput): AvailabilityResult {
  const { start, end, now, bookings, roomBlocked = false } = input;

  if (!Number.isFinite(start) || !Number.isFinite(end) || !(start < end)) {
    return { available: false, reason: 'invalid_range' };
  }

  if (start < now || end < now) {
    return { available: false, reason: 'in_past' };
  }

  if (end - start > MAX_DURATION_MS) {
    return { available: false, reason: 'too_long' };
  }

  if (roomBlocked) {
    return { available: false, reason: 'room_blocked' };
  }

  for (const b of bookings) {
    // Touching only at endpoints is allowed: [a,b) and [b,c) do not overlap.
    const overlaps = start < b.end && b.start < end;
    if (overlaps) {
      return { available: false, reason: 'overlap' };
    }
  }

  return { available: true };
}
