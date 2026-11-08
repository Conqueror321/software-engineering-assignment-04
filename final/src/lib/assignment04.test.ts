import { describe, expect, it } from 'vitest';
import { ROOMS } from '@/data/rooms';
import { NOW } from '@/data/campus';
import { EQUIPMENT } from '@/domain/room';
import { filterRooms, selectVisibleRoom } from './filtering';
import { checkRoom } from './roomAvailability';
import { isAvailable } from './availability';
const requirements = (attendees = 1, equipment: typeof EQUIPMENT[number][] = []) => ({ attendees, equipment });
const ids = (attendees: number, equipment: typeof EQUIPMENT[number][] = []) => filterRooms(ROOMS, requirements(attendees, equipment)).map(r => r.id);
const check = (index: number) => checkRoom(ROOMS[index], NOW + 30 * 60000, NOW + 60 * 60000, NOW);

describe('Assignment 04 catalog and F1-F5 contracts', () => {
  it('includes four distinct complete fictional rooms with own booking arrays', () => {
    expect(ROOMS).toHaveLength(4);
    expect(new Set(ROOMS.map(r => r.id)).size).toBe(4);
    expect(new Set(ROOMS.map(r => r.bookings)).size).toBe(4);
    ROOMS.forEach(r => { expect(r.name).not.toBe(''); expect(r.capacity).toBeGreaterThan(0); expect(r.equipment.length).toBeGreaterThan(0); expect(typeof r.blocked).toBe('boolean'); });
  });
  it('F1 includes exact capacity 8', () => expect(ids(8)).toContain('library-a'));
  it('F1 excludes insufficient capacity 8 for 9 attendees', () => expect(ids(9)).not.toContain('library-a'));
  it('F1 exact capacity 40 returns only the 40-seat hall', () => expect(ids(40)).toEqual(['seminar-hall']));
  it('F4 returns no matches above maximum capacity', () => expect(ids(41)).toEqual([]));
  it('F2 requires ALL equipment, not any', () => expect(ids(1, ['Projector', 'Video conferencing'])).toEqual(['innovation', 'seminar-hall']));
  it('F2 impossible combination returns no matches', () => expect(ids(1, ['Projector', 'Computers'])).toEqual([]));
  it('F1 + F2 combine conjunctively', () => expect(ids(13, ['Whiteboard', 'Video conferencing'])).toEqual(['innovation']));
  it('F2 empty requirements accept all four', () => expect(ids(1)).toHaveLength(4));
  it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid attendee count %s', attendees => expect(ids(attendees)).toEqual([]));
  it('F3 retains a blocked matching room but never reports it available', () => {
    expect(ids(40)).toEqual(['seminar-hall']);
    expect(check(3)).toEqual({ available: false, reason: 'room_blocked' });
  });
  it('uses the selected room bookings for the same 10:30-11:00 interval', () => {
    expect(check(0)).toEqual({ available: true });
    expect(check(1)).toEqual({ available: false, reason: 'overlap' });
    expect(check(2)).toEqual({ available: true });
  });
  it('F5 keeps a preferred room while it is visible', () => expect(selectVisibleRoom(ROOMS, 'innovation')?.id).toBe('innovation'));
  it('F5 selects a matching fallback when the chosen room is filtered out', () => expect(selectVisibleRoom(filterRooms(ROOMS, requirements(9)), 'library-a')?.id).toBe('innovation'));
  it('F4 never falls back to an invisible room when no match exists', () => expect(selectVisibleRoom([], 'library-a')).toBeUndefined());
  it('AC5 filtering, sorting for display and availability preserve frozen catalog', () => {
    const before = JSON.stringify(ROOMS);
    ROOMS.forEach((r, i) => {
      expect(Object.isFrozen(r)).toBe(true); expect(Object.isFrozen(r.bookings)).toBe(true);
      expect(Object.isFrozen(r.equipment)).toBe(true); r.bookings.forEach(b => expect(Object.isFrozen(b)).toBe(true));
      check(i); [...r.bookings].sort((a, b) => a.start - b.start);
    });
    filterRooms(ROOMS, requirements(9, ['Projector']));
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
  it.each([[NaN, NOW], [NOW, Infinity], [-Infinity, NOW]])('AC1 rejects non-finite interval %s / %s', (start, end) => {
    expect(isAvailable({ start, end, now: NOW, bookings: [] })).toEqual({ available: false, reason: 'invalid_range' });
  });
});
