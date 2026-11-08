import type { UnavailableReason } from './availability';

export const REASON_MESSAGES: Record<UnavailableReason, string> = {
  invalid_range: 'End time must be after the start time.',
  in_past: 'That time is already in the past.',
  too_long: 'Bookings can be at most 2 hours long.',
  room_blocked: 'This room is currently blocked and cannot be booked.',
  overlap: 'That time overlaps an existing booking.',
};

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
