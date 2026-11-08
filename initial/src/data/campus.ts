import type { Booking } from '@/lib/availability';

export const ROOM_NAME = 'Library Study Room A';
export const NOW = new Date('2026-10-27T10:00:00').getTime();

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', start: new Date('2026-10-27T09:00').getTime(), end: new Date('2026-10-27T10:00').getTime(), owner: 'Prof. Lane' },
  { id: 'b2', start: new Date('2026-10-27T11:00').getTime(), end: new Date('2026-10-27T11:30').getTime(), owner: 'Study Group 4' },
  { id: 'b3', start: new Date('2026-10-27T14:00').getTime(), end: new Date('2026-10-27T15:00').getTime(), owner: 'Debate Club' },
];

