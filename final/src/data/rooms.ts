import type { Room } from '@/domain/room';
import { INITIAL_BOOKINGS, ROOM_NAME } from './campus';
const at = (time: string) => new Date(`2026-10-27T${time}`).getTime();
const fixtures: Room[] = [
  { id: 'library-a', name: ROOM_NAME, capacity: 8,
    equipment: ['Projector', 'Whiteboard'], blocked: false, bookings: INITIAL_BOOKINGS },
  { id: 'innovation', name: 'Innovation Studio', capacity: 20,
    equipment: ['Projector', 'Whiteboard', 'Video conferencing'], blocked: false,
    bookings: [{ id: 'i1', start: at('10:30'), end: at('11:00'), owner: 'Robotics Society' }] },
  { id: 'computer-lab', name: 'Computing Lab', capacity: 12,
    equipment: ['Computers', 'Whiteboard'], blocked: false,
    bookings: [{ id: 'c1', start: at('12:00'), end: at('13:00'), owner: 'Coding Circle' }] },
  { id: 'seminar-hall', name: 'Seminar Hall', capacity: 40,
    equipment: ['Projector', 'Video conferencing'], blocked: true,
    bookings: [{ id: 's1', start: at('15:00'), end: at('16:00'), owner: 'Film Society' }] },
];
export const ROOMS: readonly Room[] = Object.freeze(fixtures.map(room => Object.freeze({
  ...room, equipment: Object.freeze([...room.equipment]),
  bookings: Object.freeze(room.bookings.map(booking => Object.freeze({ ...booking }))),
})));
