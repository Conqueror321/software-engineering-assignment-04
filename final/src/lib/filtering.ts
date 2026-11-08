import type { Requirements, Room } from '@/domain/room';
export function filterRooms(rooms: readonly Room[], requirements: Requirements): readonly Room[] {
  const { attendees, equipment } = requirements;
  if (!Number.isInteger(attendees) || attendees < 1) return [];
  return rooms.filter(room => room.capacity >= attendees && equipment.every(item => room.equipment.includes(item)));
}
export function selectVisibleRoom(rooms: readonly Room[], preferredId: string): Room | undefined {
  return rooms.find(room => room.id === preferredId) ?? rooms[0];
}
