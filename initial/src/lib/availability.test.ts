import { describe, it, expect } from 'vitest';
import {
  isAvailable,
  MAX_DURATION_MS,
  type Booking,
} from './availability';

const NOW = new Date('2026-10-27T10:00:00').getTime();

function booking(id: string, start: string, end: string, owner = 'staff'): Booking {
  return {
    id,
    start: new Date(`2026-10-27T${start}`).getTime(),
    end: new Date(`2026-10-27T${end}`).getTime(),
    owner,
  };
}

function req(start: string, end: string) {
  return {
    start: new Date(`2026-10-27T${start}`).getTime(),
    end: new Date(`2026-10-27T${end}`).getTime(),
    now: NOW,
    bookings: [] as Booking[],
  };
}

describe('availability', () => {
  it('rejects start >= end', () => {
    expect(isAvailable({ ...req('11:00', '11:00'), bookings: [] }).available).toBe(false);
    expect(isAvailable({ ...req('11:30', '11:00'), bookings: [] }).available).toBe(false);
  });

  it('rejects requests in the past', () => {
    const r = isAvailable({ ...req('09:00', '09:30'), bookings: [] });
    expect(r.available).toBe(false);
    if (!r.available) expect(r.reason).toBe('in_past');
  });

  it('rejects bookings longer than 120 minutes', () => {
    const r = isAvailable({ ...req('12:00', '14:30'), bookings: [] });
    expect(r.available).toBe(false);
    if (!r.available) expect(r.reason).toBe('too_long');
  });

  it('allows a booking of exactly 120 minutes', () => {
    const r = isAvailable({ ...req('12:00', '14:00'), bookings: [] });
    expect(r.available).toBe(true);
  });

  it('rejects a blocked room', () => {
    const r = isAvailable({ ...req('12:00', '12:30'), bookings: [], roomBlocked: true });
    expect(r.available).toBe(false);
    if (!r.available) expect(r.reason).toBe('room_blocked');
  });

  it('rejects overlapping bookings', () => {
    const bookings = [booking('b1', '12:00', '13:00')];
    const r = isAvailable({ ...req('12:30', '13:30'), bookings });
    expect(r.available).toBe(false);
    if (!r.available) expect(r.reason).toBe('overlap');
  });

  it('allows bookings that touch only at endpoints', () => {
    const bookings = [booking('b1', '12:00', '13:00')];
    // ends exactly when existing starts
    expect(isAvailable({ ...req('11:00', '12:00'), bookings }).available).toBe(true);
    // starts exactly when existing ends
    expect(isAvailable({ ...req('13:00', '13:30'), bookings }).available).toBe(true);
  });

  it('allows a booking with no conflicts', () => {
    const bookings = [booking('b1', '12:00', '13:00')];
    expect(isAvailable({ ...req('14:00', '14:30'), bookings }).available).toBe(true);
  });

  it('checking availability must not modify booking data', () => {
    const bookings = [booking('b1', '12:00', '13:00')];
    const snapshot = JSON.stringify(bookings);
    isAvailable({ ...req('12:30', '13:30'), bookings });
    expect(JSON.stringify(bookings)).toBe(snapshot);
  });

  it('MAX_DURATION_MS is 120 minutes', () => {
    expect(MAX_DURATION_MS).toBe(120 * 60 * 1000);
  });
});


describe('regression: endpoint boundaries and booking data preservation', () => {
  it('accepts a request ending at the start of an existing booking', () => {
    const bookings = [booking('b1', '12:00', '13:00')];
    expect(isAvailable({ ...req('11:00', '12:00'), bookings }))
      .toEqual({ available: true });
  });

  it('accepts a request starting at the end of an existing booking', () => {
    const bookings = [booking('b1', '12:00', '13:00')];
    expect(isAvailable({ ...req('13:00', '13:30'), bookings }))
      .toEqual({ available: true });
  });

  it('preserves unsorted booking data and object identities for an available request', () => {
    const bookings = [booking('later', '14:00', '15:00'), booking('earlier', '11:00', '11:30')];
    const snapshot = structuredClone(bookings);
    const first = bookings[0];
    const second = bookings[1];
    expect(isAvailable({ ...req('12:00', '12:30'), bookings }))
      .toEqual({ available: true });
    expect(bookings).toEqual(snapshot);
    expect(bookings[0]).toBe(first);
    expect(bookings[1]).toBe(second);
  });

  it('preserves unsorted booking data when an overlapping request is rejected', () => {
    const bookings = [booking('later', '14:00', '15:00'), booking('earlier', '11:00', '11:30')];
    const snapshot = structuredClone(bookings);
    expect(isAvailable({ ...req('14:15', '14:45'), bookings }))
      .toEqual({ available: false, reason: 'overlap' });
    expect(bookings).toEqual(snapshot);
  });
});
