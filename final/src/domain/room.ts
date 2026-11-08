import type { Booking } from '@/lib/availability';
export const EQUIPMENT = ['Projector', 'Whiteboard', 'Video conferencing', 'Computers'] as const;
export type Equipment = typeof EQUIPMENT[number];
export type Room = Readonly<{
  id: string; name: string; capacity: number; equipment: readonly Equipment[];
  blocked: boolean; bookings: readonly Readonly<Booking>[];
}>;
export type Requirements = Readonly<{ attendees: number; equipment: readonly Equipment[] }>;
