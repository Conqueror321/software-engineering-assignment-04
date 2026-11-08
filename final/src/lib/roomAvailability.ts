import type { Room } from '@/domain/room';
import { isAvailable } from './availability';
export function checkRoom(room: Room, start: number, end: number, now: number) {
  return isAvailable({ start, end, now, bookings: room.bookings, roomBlocked: room.blocked });
}
