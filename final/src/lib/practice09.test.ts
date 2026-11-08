import { describe, expect, it } from 'vitest';
import { isAvailable } from './availability';
import { INITIAL_BOOKINGS, NOW } from '../data/campus';
import { REASON_MESSAGES, formatTime, toLocalInput } from './presentation';

const minute = 60000;
const request = (start: number, end: number, roomBlocked = false) => ({
  start: NOW + start * minute, end: NOW + end * minute,
  now: NOW, bookings: INITIAL_BOOKINGS, roomBlocked,
});

describe('Practice 09 acceptance boundaries using actual demo fixtures', () => {
  it('AC1: rejects an equal interval with the exact reason', () => {
    expect(isAvailable(request(30, 30))).toEqual({ available: false, reason: 'invalid_range' });
  });
  it('AC1: rejects a reversed interval with the exact reason', () => {
    expect(isAvailable(request(40, 30))).toEqual({ available: false, reason: 'invalid_range' });
  });
  it('AC1: rejects a request starting before now even when its end is future', () => {
    expect(isAvailable(request(-1, 30))).toEqual({ available: false, reason: 'in_past' });
  });
  it('AC1/AC4: allows exactly now touching the previous booking end', () => {
    expect(isAvailable(request(0, 30))).toEqual({ available: true });
  });
  it('AC2: rejects exactly 121 minutes', () => {
    expect(isAvailable(request(120, 241))).toEqual({ available: false, reason: 'too_long' });
  });
  it('AC2/AC4: allows exactly 120 minutes ending at the next booking start', () => {
    expect(isAvailable(request(120, 240))).toEqual({ available: true });
  });
  it('AC3: rejects a blocked room for a valid non-conflicting interval', () => {
    expect(isAvailable(request(30, 60, true))).toEqual({ available: false, reason: 'room_blocked' });
  });
  it('AC4: rejects a one-minute overlap', () => {
    expect(isAvailable(request(59, 61))).toEqual({ available: false, reason: 'overlap' });
  });
  it('AC5: accepts deeply frozen unsorted data without altering it', () => {
    const bookings = INITIAL_BOOKINGS.map(b => Object.freeze({ ...b })).reverse();
    const snapshot = [...bookings];
    Object.freeze(bookings);
    for (const input of [request(30, 60), request(59, 61), request(30, 60, true)]) {
      isAvailable({ ...input, bookings });
      expect(bookings).toEqual(snapshot);
      snapshot.forEach((booking, i) => expect(bookings[i]).toBe(booking));
    }
  });
});

describe('presentation boundary', () => {
  it('retains all five clear feedback messages', () => {
    expect(REASON_MESSAGES).toEqual({
      invalid_range: 'End time must be after the start time.',
      in_past: 'That time is already in the past.',
      too_long: 'Bookings can be at most 2 hours long.',
      room_blocked: 'This room is currently blocked and cannot be booked.',
      overlap: 'That time overlaps an existing booking.',
    });
  });
  it('keeps local datetime input values stable including zero padding', () => {
    const value = '2026-01-02T03:04';
    expect(toLocalInput(new Date(value).getTime())).toBe(value);
    expect(toLocalInput(NOW)).toBe('2026-10-27T10:00');
  });
  it('retains the existing locale display behavior', () => {
    expect(formatTime(NOW)).toBe(new Date(NOW).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  });
});
